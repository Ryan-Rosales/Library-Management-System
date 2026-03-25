<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookReservation;
use App\Models\CirculationLog;
use App\Models\Shelf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MemberPortalController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $member = $request->user();

        $currentLoans = BookCopy::query()
            ->where('borrower_id', $member->id)
            ->whereIn('status', ['issued', 'on_loan'])
            ->count();

        $overdueLoans = BookCopy::query()
            ->where('borrower_id', $member->id)
            ->whereIn('status', ['issued', 'on_loan'])
            ->whereDate('due_at', '<', today())
            ->count();

        $pendingReservations = BookReservation::query()
            ->where('member_id', $member->id)
            ->whereIn('status', ['queued', 'fulfilled'])
            ->count();

        $pendingPenalties = (int) CirculationLog::query()
            ->where('member_id', $member->id)
            ->where('fine_status', 'pending')
            ->sum('fine_amount');

        $dueSoon = BookCopy::query()
            ->with('book:id,title,author,isbn,shelf')
            ->where('borrower_id', $member->id)
            ->whereIn('status', ['issued', 'on_loan'])
            ->whereNotNull('due_at')
            ->orderBy('due_at')
            ->limit(5)
            ->get()
            ->map(fn (BookCopy $copy) => [
                'id' => $copy->id,
                'title' => $copy->book?->title,
                'author' => $copy->book?->author,
                'isbn' => $copy->book?->isbn,
                'accession_number' => $copy->accession_number,
                'due_date' => optional($copy->due_at)->toDateString(),
                'is_overdue' => $copy->due_at ? Carbon::parse($copy->due_at)->startOfDay()->isPast() : false,
            ])
            ->values();

        $recentHistory = CirculationLog::query()
            ->with('book:id,title,author,isbn')
            ->where('member_id', $member->id)
            ->whereNotNull('returned_at')
            ->latest('returned_at')
            ->limit(5)
            ->get()
            ->map(fn (CirculationLog $log) => [
                'id' => $log->id,
                'title' => $log->book?->title,
                'author' => $log->book?->author,
                'isbn' => $log->book?->isbn,
                'borrowed_at' => optional($log->borrowed_at)->toDateTimeString(),
                'returned_at' => optional($log->returned_at)->toDateTimeString(),
                'fine_amount' => (int) $log->fine_amount,
            ])
            ->values();

        return Inertia::render('member/dashboard', [
            'cards' => [
                ['label' => 'Books Currently Borrowed', 'value' => (string) $currentLoans],
                ['label' => 'Overdue Books', 'value' => (string) $overdueLoans],
                ['label' => 'Active Reservations', 'value' => (string) $pendingReservations],
                ['label' => 'Pending Penalties', 'value' => 'P '.number_format($pendingPenalties, 2)],
            ],
            'dueSoon' => $dueSoon,
            'recentHistory' => $recentHistory,
        ]);
    }

    public function catalog(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $category = trim((string) $request->input('category', ''));
        $genre = trim((string) $request->input('genre', ''));
        $author = trim((string) $request->input('author', ''));

        $memberId = (int) $request->user()->id;

        $shelfLocations = Shelf::query()
            ->with('locationRef:id,name')
            ->get(['id', 'code', 'name', 'location_id', 'location'])
            ->mapWithKeys(fn (Shelf $shelf) => [
                $shelf->code => [
                    'shelf_label' => $shelf->code.' - '.$shelf->name,
                    'location_label' => $shelf->locationRef?->name ?? $shelf->location,
                ],
            ]);

        $books = Book::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('genre', 'like', "%{$search}%");
                });
            })
            ->when($category !== '', fn ($query) => $query->where('category', $category))
            ->when($genre !== '', fn ($query) => $query->where('genre', $genre))
            ->when($author !== '', fn ($query) => $query->where('author', $author))
            ->withCount([
                'bookCopies as available_count' => fn ($query) => $query->where('status', 'available'),
                'bookCopies as checked_out_count' => fn ($query) => $query->whereIn('status', ['issued', 'on_loan']),
                'bookCopies as on_hold_count' => fn ($query) => $query->where('status', 'reserved'),
                'reservations as queued_reservations_count' => fn ($query) => $query->where('status', 'queued'),
            ])
            ->orderBy('title')
            ->paginate(10)
            ->withQueryString();

        $activeReservationsByBook = BookReservation::query()
            ->where('member_id', $memberId)
            ->whereIn('status', ['queued', 'fulfilled'])
            ->pluck('id', 'book_id');

        $bookData = $books->through(function (Book $book) use ($shelfLocations, $activeReservationsByBook) {
            $shelfInfo = $book->shelf ? $shelfLocations->get($book->shelf) : null;
            $availableCount = (int) $book->available_count;
            $checkedOutCount = (int) $book->checked_out_count;
            $onHoldCount = (int) $book->on_hold_count;
            $queuedCount = (int) $book->queued_reservations_count;

            return [
                'id' => $book->id,
                'title' => $book->title,
                'isbn' => $book->isbn,
                'author' => $book->author,
                'category' => $book->category,
                'genre' => $book->genre,
                'shelf' => $book->shelf,
                'shelf_label' => $shelfInfo['shelf_label'] ?? ($book->shelf ?: 'Not assigned'),
                'location_label' => $shelfInfo['location_label'] ?? 'Location unavailable',
                'status' => [
                    'available' => $availableCount,
                    'checked_out' => $checkedOutCount,
                    'on_hold' => max($onHoldCount, $queuedCount),
                ],
                'can_reserve' => ! $activeReservationsByBook->has($book->id),
                'is_reserved_by_member' => $activeReservationsByBook->has($book->id),
                'reservation_id' => $activeReservationsByBook->get($book->id),
            ];
        });

        $categories = Book::query()->whereNotNull('category')->where('category', '!=', '')->distinct()->orderBy('category')->pluck('category')->values();
        $genres = Book::query()->whereNotNull('genre')->where('genre', '!=', '')->distinct()->orderBy('genre')->pluck('genre')->values();
        $authors = Book::query()->whereNotNull('author')->where('author', '!=', '')->distinct()->orderBy('author')->pluck('author')->values();

        return Inertia::render('member/catalog', [
            'books' => $bookData,
            'filters' => [
                'search' => $search,
                'category' => $category,
                'genre' => $genre,
                'author' => $author,
            ],
            'options' => [
                'categories' => $categories,
                'genres' => $genres,
                'authors' => $authors,
            ],
        ]);
    }

    public function reserve(Request $request, Book $book): RedirectResponse
    {
        $member = $request->user();

        $alreadyQueued = BookReservation::query()
            ->where('book_id', $book->id)
            ->where('member_id', $member->id)
            ->whereIn('status', ['queued', 'fulfilled'])
            ->exists();

        if ($alreadyQueued) {
            return back()->with('info', 'You already have an active reservation for this title.');
        }

        $hasCurrentLoan = BookCopy::query()
            ->where('book_id', $book->id)
            ->where('borrower_id', $member->id)
            ->whereIn('status', ['issued', 'on_loan'])
            ->exists();

        if ($hasCurrentLoan) {
            return back()->with('info', 'You already borrowed this title.');
        }

        DB::transaction(function () use ($book, $member): void {
            $nextPosition = (int) BookReservation::query()
                ->where('book_id', $book->id)
                ->where('status', 'queued')
                ->max('queue_position') + 1;

            $reservation = BookReservation::create([
                'book_id' => $book->id,
                'member_id' => $member->id,
                'status' => 'queued',
                'queue_position' => max($nextPosition, 1),
                'queued_at' => now(),
            ]);

            if ($reservation->queue_position === 1) {
                $availableCopy = BookCopy::query()
                    ->where('book_id', $book->id)
                    ->where('status', 'available')
                    ->orderBy('accession_number')
                    ->lockForUpdate()
                    ->first();

                if ($availableCopy) {
                    $availableCopy->update([
                        'status' => 'reserved',
                        'borrower_id' => null,
                        'borrowed_at' => null,
                        'due_at' => null,
                        'returned_at' => null,
                    ]);

                    $reservation->update([
                        'status' => 'fulfilled',
                        'fulfilled_at' => now(),
                    ]);
                }
            }
        });

        $this->syncBookAvailability($book->id);

        app(\App\Services\ActivityNotificationService::class)->notifyPeerRoleChange(
            $member,
            'reservations',
            'requested',
            'a reservation for "'.$book->title.'"',
            route('circulation.borrow.page'),
        );

        return back()->with('success', 'Book reserved successfully. You are now in queue.');
    }

    public function myBooks(Request $request): Response
    {
        $memberId = (int) $request->user()->id;

        $loans = BookCopy::query()
            ->with('book:id,title,author,isbn,shelf')
            ->where('borrower_id', $memberId)
            ->whereIn('status', ['issued', 'on_loan'])
            ->orderByRaw('due_at is null')
            ->orderBy('due_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (BookCopy $copy) => [
                'id' => $copy->id,
                'title' => $copy->book?->title,
                'author' => $copy->book?->author,
                'isbn' => $copy->book?->isbn,
                'accession_number' => $copy->accession_number,
                'shelf' => $copy->book?->shelf,
                'borrowed_at' => optional($copy->borrowed_at)->toDateTimeString(),
                'due_at' => optional($copy->due_at)->toDateString(),
                'is_overdue' => $copy->due_at ? Carbon::parse($copy->due_at)->startOfDay()->isPast() : false,
            ]);

        return Inertia::render('member/my-books', [
            'loans' => $loans,
        ]);
    }

    public function history(Request $request): Response
    {
        $memberId = (int) $request->user()->id;
        $search = trim((string) $request->input('search', ''));

        $history = CirculationLog::query()
            ->with('book:id,title,author,isbn')
            ->where('member_id', $memberId)
            ->whereNotNull('returned_at')
            ->when($search !== '', function ($query) use ($search) {
                $query->whereHas('book', function ($bookQuery) use ($search) {
                    $bookQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%");
                });
            })
            ->latest('returned_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (CirculationLog $log) => [
                'id' => $log->id,
                'title' => $log->book?->title,
                'author' => $log->book?->author,
                'isbn' => $log->book?->isbn,
                'borrowed_at' => optional($log->borrowed_at)->toDateTimeString(),
                'due_at' => optional($log->due_at)->toDateString(),
                'returned_at' => optional($log->returned_at)->toDateTimeString(),
                'fine_amount' => (int) $log->fine_amount,
            ]);

        return Inertia::render('member/history', [
            'history' => $history,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function reservations(Request $request): Response
    {
        $memberId = (int) $request->user()->id;

        $reservations = BookReservation::query()
            ->with('book:id,title,author,isbn,shelf')
            ->where('member_id', $memberId)
            ->latest('queued_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function (BookReservation $reservation) use ($memberId) {
                $claimBy = optional($reservation->claim_at ?? $reservation->fulfilled_at)?->toDateString();

                $returnBy = null;

                if ($reservation->status === 'completed') {
                    $dueDate = CirculationLog::query()
                        ->where('member_id', $memberId)
                        ->where('book_id', $reservation->book_id)
                        ->latest('borrowed_at')
                        ->value('due_at');

                    if ($dueDate) {
                        $returnBy = Carbon::parse($dueDate)->toDateString();
                    }
                }

                return [
                    'id' => $reservation->id,
                    'title' => $reservation->book?->title,
                    'author' => $reservation->book?->author,
                    'isbn' => $reservation->book?->isbn,
                    'shelf' => $reservation->book?->shelf,
                    'status' => $reservation->status,
                    'queue_position' => $reservation->queue_position,
                    'queued_at' => optional($reservation->queued_at)->toDateTimeString(),
                    'claim_by' => $claimBy,
                    'return_by' => $returnBy,
                ];
            });

        return Inertia::render('member/reservations', [
            'reservations' => $reservations,
        ]);
    }

    public function cancelReservation(Request $request, BookReservation $bookReservation): RedirectResponse
    {
        $member = $request->user();

        if ((int) $bookReservation->member_id !== (int) $member->id) {
            abort(403);
        }

        if ($bookReservation->status !== 'queued') {
            return back()->with('info', 'Only queued reservations can be cancelled.');
        }

        $bookId = (int) $bookReservation->book_id;
        $formerPosition = (int) $bookReservation->queue_position;

        $bookReservation->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        BookReservation::query()
            ->where('book_id', $bookId)
            ->where('status', 'queued')
            ->where('queue_position', '>', $formerPosition)
            ->decrement('queue_position');

        return back()->with('success', 'Reservation cancelled.');
    }

    public function claimReservation(Request $request, BookReservation $bookReservation): RedirectResponse
    {
        $member = $request->user();

        if ((int) $bookReservation->member_id !== (int) $member->id) {
            abort(403);
        }

        if ($bookReservation->status !== 'fulfilled') {
            return back()->with('error', 'Only fulfilled reservations can be claimed.');
        }

        $data = $request->validate([
            'claim_at' => ['required', 'date'],
            'due_at' => ['required', 'date', 'after_or_equal:claim_at'],
        ]);

        DB::transaction(function () use ($bookReservation, $data): void {
            $bookReservation->update([
                'claim_at' => Carbon::parse($data['claim_at']),
                'member_due_at' => Carbon::parse($data['due_at'])->toDateString(),
            ]);
        });

        $bookTitle = Book::query()->whereKey((int) $bookReservation->book_id)->value('title') ?? 'book';

        app(\App\Services\ActivityNotificationService::class)->notifyPeerRoleChange(
            $member,
            'reservations',
            'scheduled',
            'a reserved copy of "'.$bookTitle.'" with chosen claim and due dates',
            route('circulation.borrow.page'),
        );

        return back()->with('success', 'Claim and due dates saved. Please wait for staff to process your reservation.');
    }

    private function syncBookAvailability(int $bookId): void
    {
        $availableCount = BookCopy::query()
            ->where('book_id', $bookId)
            ->where('status', 'available')
            ->count();

        Book::query()->whereKey($bookId)->update([
            'copies_available' => $availableCount,
        ]);
    }

    public function penalties(Request $request): Response
    {
        $memberId = (int) $request->user()->id;

        $penalties = CirculationLog::query()
            ->with('book:id,title,author,isbn')
            ->where('member_id', $memberId)
            ->where('fine_status', 'pending')
            ->where('fine_amount', '>', 0)
            ->latest('returned_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (CirculationLog $log) => [
                'id' => $log->id,
                'title' => $log->book?->title,
                'author' => $log->book?->author,
                'isbn' => $log->book?->isbn,
                'returned_at' => optional($log->returned_at)->toDateTimeString(),
                'fine_amount' => (int) $log->fine_amount,
            ]);

        $pendingTotal = (int) CirculationLog::query()
            ->where('member_id', $memberId)
            ->where('fine_status', 'pending')
            ->sum('fine_amount');

        return Inertia::render('member/penalties', [
            'penalties' => $penalties,
            'pendingTotal' => $pendingTotal,
        ]);
    }
}
