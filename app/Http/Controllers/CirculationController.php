<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookReservation;
use App\Models\CirculationLog;
use App\Models\MemberNotification;
use App\Models\User;
use App\Services\ActivityNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CirculationController extends Controller
{
    public function borrowPage(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $allAvailableCopies = BookCopy::query()
            ->with('book:id,title,author')
            ->where('status', 'available')
            ->orderBy('accession_number')
            ->get();

        $availableCopies = BookCopy::query()
            ->with('book:id,title,author')
            ->where('status', 'available')
            ->when($search !== '', function ($query) use ($search) {
                $query
                    ->where('accession_number', 'like', "%{$search}%")
                    ->orWhereHas('book', function ($bookQuery) use ($search) {
                        $bookQuery
                            ->where('title', 'like', "%{$search}%")
                            ->orWhere('author', 'like', "%{$search}%");
                    });
            })
            ->orderBy('accession_number')
            ->paginate(10)
            ->withQueryString();

        $copyOptions = $allAvailableCopies->map(fn (BookCopy $copy) => [
            'value' => $copy->id,
            'book_id' => $copy->book_id,
            'label' => $copy->accession_number.' - '.$copy->book?->title.' ('.$copy->book?->author.')',
        ])->values();

        $bookOptions = $allAvailableCopies
            ->filter(fn (BookCopy $copy) => $copy->book)
            ->unique('book_id')
            ->map(fn (BookCopy $copy) => [
                'value' => $copy->book_id,
                'label' => $copy->book?->title.' ('.$copy->book?->author.')',
            ])
            ->values();

        $memberOptions = User::query()
            ->where('role', 'member')
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $member) => [
                'value' => $member->id,
                'label' => $member->name.' ('.$member->email.')',
            ])
            ->values();

        $readyReservations = BookReservation::query()
            ->with(['book:id,title,author', 'member:id,name,email'])
            ->where('status', 'fulfilled')
            ->whereNotNull('claim_at')
            ->whereNotNull('member_due_at')
            ->orderBy('queued_at')
            ->get()
            ->map(fn (BookReservation $reservation) => [
                'id' => $reservation->id,
                'book_title' => $reservation->book?->title,
                'book_author' => $reservation->book?->author,
                'member_name' => $reservation->member?->name,
                'member_email' => $reservation->member?->email,
                'status' => $reservation->status,
                'claim_at' => optional($reservation->claim_at)->toDateString(),
                'due_at' => optional($reservation->member_due_at)->toDateString(),
                'queued_at' => optional($reservation->queued_at)->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('circulation/borrow', [
            'filters' => [
                'search' => $search,
            ],
            'availableCopies' => $availableCopies,
            'options' => [
                'availableBooks' => $bookOptions,
                'availableCopies' => $copyOptions,
                'members' => $memberOptions,
            ],
            'reservations' => $readyReservations,
        ]);
    }

    public function returnPage(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $dueDate = trim((string) $request->input('due_date', ''));
        $loanStatus = trim((string) $request->input('loan_status', ''));

        if (! $this->hasCirculationColumns()) {
            return Inertia::render('circulation/return', [
                'filters' => [
                    'search' => $search,
                    'due_date' => $dueDate,
                    'loan_status' => $loanStatus,
                ],
                'activeLoans' => $this->emptyPagination($request),
                'options' => [
                    'loanCopies' => [],
                ],
                'schemaReady' => false,
            ]);
        }

        $activeLoans = BookCopy::query()
            ->with(['book:id,title,author', 'borrower:id,name,email'])
            ->whereIn('status', ['issued', 'on_loan'])
            ->when($search !== '', function ($query) use ($search) {
                $query
                    ->where('accession_number', 'like', "%{$search}%")
                    ->orWhereHas('book', function ($bookQuery) use ($search) {
                        $bookQuery
                            ->where('title', 'like', "%{$search}%")
                            ->orWhere('author', 'like', "%{$search}%");
                    })
                    ->orWhereHas('borrower', function ($borrowerQuery) use ($search) {
                        $borrowerQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            })
                    ->when($dueDate !== '', fn ($query) => $query->whereDate('due_at', $dueDate))
                    ->when($loanStatus !== '', function ($query) use ($loanStatus) {
                        if ($loanStatus === 'overdue') {
                            $query->whereDate('due_at', '<', today());
                            return;
                        }

                        if ($loanStatus === 'on_time') {
                            $query->where(function ($nested) {
                                $nested
                                    ->whereNull('due_at')
                                    ->orWhereDate('due_at', '>=', today());
                            });
                        }
                    })
            ->orderByRaw('due_at is null')
            ->orderBy('due_at')
            ->paginate(10)
            ->withQueryString();

        $loanOptions = $activeLoans->getCollection()->map(fn (BookCopy $copy) => [
            'value' => $copy->id,
            'label' => $copy->accession_number.' - '.$copy->book?->title.' ('.$copy->borrower?->name.')',
        ])->values();

        return Inertia::render('circulation/return', [
            'filters' => [
                'search' => $search,
                'due_date' => $dueDate,
                'loan_status' => $loanStatus,
            ],
            'activeLoans' => $activeLoans,
            'options' => [
                'loanCopies' => $loanOptions,
            ],
            'schemaReady' => true,
        ]);
    }

    public function historyPage(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $returnedDate = trim((string) $request->input('returned_date', ''));
        $returnStatus = trim((string) $request->input('return_status', ''));

        if (! $this->hasCirculationColumns()) {
            return Inertia::render('circulation/history', [
                'filters' => [
                    'search' => $search,
                    'returned_date' => $returnedDate,
                    'return_status' => $returnStatus,
                ],
                'returns' => $this->emptyPagination($request),
                'schemaReady' => false,
            ]);
        }

        $returns = BookCopy::query()
            ->with(['book:id,title,author'])
            ->whereNotNull('returned_at')
            ->when($search !== '', function ($query) use ($search) {
                $query
                    ->where('accession_number', 'like', "%{$search}%")
                    ->orWhere('condition', 'like', "%{$search}%")
                    ->orWhereHas('book', function ($bookQuery) use ($search) {
                        $bookQuery
                            ->where('title', 'like', "%{$search}%")
                            ->orWhere('author', 'like', "%{$search}%");
                    });
            })
                    ->when($returnedDate !== '', fn ($query) => $query->whereDate('returned_at', $returnedDate))
            ->when($returnStatus !== '', function ($query) use ($returnStatus) {
                if ($returnStatus === 'overdue') {
                    $query->whereNotNull('due_at')->whereColumn('returned_at', '>', 'due_at');
                    return;
                }

                if ($returnStatus === 'on_time') {
                    $query->where(function ($nested) {
                        $nested
                            ->whereNull('due_at')
                            ->orWhereColumn('returned_at', '<=', 'due_at');
                    });
                }
            })
            ->latest('returned_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('circulation/history', [
            'filters' => [
                'search' => $search,
                'returned_date' => $returnedDate,
                'return_status' => $returnStatus,
            ],
            'returns' => $returns,
            'schemaReady' => true,
        ]);
    }

    public function borrow(Request $request): RedirectResponse
    {
        if (! $this->hasCirculationColumns()) {
            return back()->with('error', 'Circulation columns are missing. Please run database migrations.');
        }

        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'borrow_quantity' => ['required', 'integer', 'min:1'],
            'borrower_id' => ['required', Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'member'))],
            'due_at' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $availableCopies = BookCopy::query()
            ->where('book_id', $data['book_id'])
            ->where('status', 'available')
            ->orderBy('accession_number')
            ->get();

        if ($availableCopies->isEmpty()) {
            return back()->with('error', 'No available copies found for the selected book.');
        }

        if ($availableCopies->count() < (int) $data['borrow_quantity']) {
            return back()->with('error', 'Requested quantity exceeds available copies for this book.');
        }

        $copiesToBorrow = $availableCopies->take((int) $data['borrow_quantity']);
        $borrowedAt = now();

        DB::transaction(function () use ($copiesToBorrow, $data, $borrowedAt): void {
            foreach ($copiesToBorrow as $copy) {
                $copy->update([
                    'status' => 'issued',
                    'borrower_id' => $data['borrower_id'],
                    'borrowed_at' => $borrowedAt,
                    'due_at' => $data['due_at'],
                    'returned_at' => null,
                ]);

                CirculationLog::create([
                    'book_id' => $copy->book_id,
                    'book_copy_id' => $copy->id,
                    'member_id' => $data['borrower_id'],
                    'borrowed_at' => $borrowedAt,
                    'due_at' => $data['due_at'],
                    'fine_amount' => 0,
                    'fine_status' => 'none',
                ]);
            }
        });

        $this->syncBookAvailability((int) $data['book_id']);

        $quantity = (int) $data['borrow_quantity'];
        $bookTitle = Book::query()->whereKey((int) $data['book_id'])->value('title') ?? 'book';

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'circulation',
            'borrowed',
            $quantity.' copy/copies of "'.$bookTitle.'"',
            route('circulation.borrow.page'),
        );

        return back()->with('success', "{$quantity} book copy/copies borrowed successfully.");
    }

    public function issueReservation(Request $request): RedirectResponse
    {
        if (! $this->hasCirculationColumns()) {
            return back()->with('error', 'Circulation columns are missing. Please run database migrations.');
        }

        $data = $request->validate([
            'reservation_id' => ['required', 'exists:book_reservations,id'],
        ]);

        $reservation = BookReservation::query()->whereKey((int) $data['reservation_id'])->first();

        if (! $reservation || $reservation->status !== 'fulfilled') {
            return back()->with('error', 'Selected reservation is not ready to be issued.');
        }

        if (! $reservation->claim_at || ! $reservation->member_due_at) {
            return back()->with('error', 'Selected reservation does not have member-chosen claim and due dates.');
        }

        $error = null;
        $borrowedAt = $reservation->claim_at ?? now();
        $dueAt = $reservation->member_due_at;

        DB::transaction(function () use ($reservation, $borrowedAt, $dueAt, &$error): void {
            $bookCopy = BookCopy::query()
                ->where('book_id', $reservation->book_id)
                ->where('status', 'reserved')
                ->orderBy('returned_at')
                ->lockForUpdate()
                ->first();

            if (! $bookCopy) {
                $error = 'No reserved copy is currently available for this reservation.';
                return;
            }

            $bookCopy->update([
                'status' => 'issued',
                'borrower_id' => $reservation->member_id,
                'borrowed_at' => $borrowedAt,
                'due_at' => $dueAt,
                'returned_at' => null,
            ]);

            CirculationLog::create([
                'book_id' => $bookCopy->book_id,
                'book_copy_id' => $bookCopy->id,
                'member_id' => $reservation->member_id,
                'borrowed_at' => $borrowedAt,
                'due_at' => $dueAt,
                'fine_amount' => 0,
                'fine_status' => 'none',
            ]);

            $reservation->update([
                'status' => 'completed',
            ]);
        });

        if ($error) {
            return back()->with('error', $error);
        }

        $this->syncBookAvailability((int) $reservation->book_id);

        $bookTitle = Book::query()->whereKey((int) $reservation->book_id)->value('title') ?? 'book';

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'circulation',
            'borrowed',
            '1 reserved copy of "'.$bookTitle.'"',
            route('circulation.borrow.page'),
        );

        return back()->with('success', 'Reserved copy issued successfully.');
    }

    public function rejectReservation(Request $request): RedirectResponse
    {
        if (! $this->hasCirculationColumns()) {
            return back()->with('error', 'Circulation columns are missing. Please run database migrations.');
        }

        $data = $request->validate([
            'reservation_id' => ['required', 'exists:book_reservations,id'],
        ]);

        $reservation = BookReservation::query()->whereKey((int) $data['reservation_id'])->first();

        if (! $reservation || $reservation->status !== 'fulfilled') {
            return back()->with('error', 'Selected reservation is not ready to be rejected.');
        }

        $bookId = (int) $reservation->book_id;

        DB::transaction(function () use ($reservation, $bookId): void {
            $reservation->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);

            $reservedCopy = BookCopy::query()
                ->where('book_id', $bookId)
                ->where('status', 'reserved')
                ->orderBy('returned_at')
                ->lockForUpdate()
                ->first();

            if ($reservedCopy) {
                $reservedCopy->update([
                    'status' => 'available',
                    'borrower_id' => null,
                    'borrowed_at' => null,
                    'due_at' => null,
                ]);
            }
        });

        $this->syncBookAvailability($bookId);

        $bookTitle = Book::query()->whereKey($bookId)->value('title') ?? 'book';

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'circulation',
            'rejected',
            'reservation for "'.$bookTitle.'"',
            route('circulation.borrow.page'),
        );

        return back()->with('success', 'Reservation rejected and copy returned to available pool.');
    }

    public function returnBook(Request $request): RedirectResponse
    {
        if (! $this->hasCirculationColumns()) {
            return back()->with('error', 'Circulation columns are missing. Please run database migrations.');
        }

        $data = $request->validate([
            'book_copy_ids' => ['required', 'array', 'min:1'],
            'book_copy_ids.*' => ['integer', 'exists:book_copies,id'],
            'condition' => ['required', Rule::in(['good', 'fair', 'damaged'])],
        ]);

        $selectedIds = collect($data['book_copy_ids'])->map(fn ($id) => (int) $id)->unique()->values();

        $bookCopies = BookCopy::query()->findMany($selectedIds->all());

        if ($bookCopies->count() !== $selectedIds->count()) {
            return back()->with('error', 'One or more selected book copies are invalid.');
        }

        if ($bookCopies->contains(fn (BookCopy $copy) => ! in_array($copy->status, ['issued', 'on_loan'], true))) {
            return back()->with('error', 'Only borrowed copies can be returned.');
        }

        $returnedAt = now();
        $today = $returnedAt->copy()->startOfDay();
        $finePerDay = 50;
        $totalFine = 0;

        DB::transaction(function () use ($bookCopies, $data, $returnedAt, $today, $finePerDay, &$totalFine): void {
            foreach ($bookCopies as $bookCopy) {
                $overdueDays = 0;
                $fineAmount = 0;

                if ($bookCopy->due_at) {
                    $dueDate = Carbon::parse($bookCopy->due_at)->startOfDay();
                    if ($today->gt($dueDate)) {
                        $overdueDays = $dueDate->diffInDays($today);
                    }
                }

                $fineAmount = $overdueDays * $finePerDay;
                $totalFine += $fineAmount;

                CirculationLog::query()
                    ->where('book_copy_id', $bookCopy->id)
                    ->where('member_id', $bookCopy->borrower_id)
                    ->whereNull('returned_at')
                    ->latest('borrowed_at')
                    ->limit(1)
                    ->update([
                        'returned_at' => $returnedAt,
                        'fine_amount' => $fineAmount,
                        'fine_status' => $fineAmount > 0 ? 'pending' : 'none',
                    ]);

                $nextReservation = BookReservation::query()
                    ->where('book_id', $bookCopy->book_id)
                    ->where('status', 'queued')
                    ->orderBy('queue_position')
                    ->orderBy('queued_at')
                    ->lockForUpdate()
                    ->first();

                if ($nextReservation) {
                    $nextReservation->update([
                        'status' => 'fulfilled',
                        'fulfilled_at' => $returnedAt,
                    ]);

                    // Reserve this returned copy for the next queued member until staff issues it.
                    $bookCopy->update([
                        'status' => 'reserved',
                        'condition' => $data['condition'],
                        'borrower_id' => null,
                        'borrowed_at' => null,
                        'due_at' => null,
                        'returned_at' => $returnedAt,
                    ]);

                    MemberNotification::create([
                        'user_id' => $nextReservation->member_id,
                        'type' => 'reservation_fulfilled',
                        'title' => 'Reserved Book Is Ready',
                        'message' => 'A copy of your reserved title is now available for pickup/issuance.',
                        'url' => '/member/reservations',
                        'meta' => [
                            'book_id' => $bookCopy->book_id,
                            'book_copy_id' => $bookCopy->id,
                            'reservation_id' => $nextReservation->id,
                        ],
                    ]);
                } else {
                    $bookCopy->update([
                        'status' => 'available',
                        'condition' => $data['condition'],
                        'borrower_id' => null,
                        'borrowed_at' => null,
                        'due_at' => null,
                        'returned_at' => $returnedAt,
                    ]);
                }
            }
        });

        $bookCopies->pluck('book_id')->unique()->each(fn (int $bookId) => $this->syncBookAvailability($bookId));

        $returnedCount = $bookCopies->count();
        $bookCount = $bookCopies->pluck('book_id')->unique()->count();
        $message = "{$returnedCount} book copy/copies returned successfully.";

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'circulation',
            'returned',
            $returnedCount.' copy/copies across '.$bookCount.' title(s)',
            route('circulation.return.page'),
        );

        if ($totalFine > 0) {
            $message .= " Total overdue fine: P {$totalFine}.00.";
        }

        return back()->with('success', $message);
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

    private function hasCirculationColumns(): bool
    {
        return Schema::hasColumns('book_copies', ['borrower_id', 'borrowed_at', 'due_at', 'returned_at']);
    }

    private function emptyPagination(Request $request): LengthAwarePaginator
    {
        return new LengthAwarePaginator(
            collect(),
            0,
            10,
            1,
            [
                'path' => $request->url(),
                'pageName' => 'page',
            ],
        );
    }
}
