<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookCopyController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $copies = BookCopy::query()
            ->with('book:id,title,author')
            ->when($search !== '', function ($query) use ($search) {
                $query
                    ->where('accession_number', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('condition', 'like', "%{$search}%")
                    ->orWhereHas('book', function ($bookQuery) use ($search) {
                        $bookQuery->where('title', 'like', "%{$search}%")->orWhere('author', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $bookOptions = Book::query()
            ->orderBy('title')
            ->get(['id', 'title', 'author'])
            ->map(fn (Book $book) => [
                'value' => $book->id,
                'label' => $book->title.' - '.$book->author,
            ])
            ->values();

        return Inertia::render('catalog/manage', [
            'title' => 'Book Copies',
            'records' => $copies,
            'filters' => ['search' => $search],
            'routes' => [
                'index' => 'book.copies',
                'store' => 'book.copies.store',
                'update' => 'book.copies.update',
                'destroy' => 'book.copies.destroy',
            ],
            'fields' => [
                ['name' => 'book_id', 'label' => 'BOOK', 'type' => 'select', 'required' => true, 'options' => $bookOptions],
                ['name' => 'copies_count', 'label' => 'NUMBER OF COPIES', 'type' => 'number', 'required' => true],
                [
                    'name' => 'condition',
                    'label' => 'CONDITION',
                    'type' => 'select',
                    'required' => true,
                    'options' => [
                        ['value' => 'good', 'label' => 'Good'],
                        ['value' => 'fair', 'label' => 'Fair'],
                        ['value' => 'damaged', 'label' => 'Damaged'],
                    ],
                ],
                [
                    'name' => 'status',
                    'label' => 'STATUS',
                    'type' => 'select',
                    'required' => true,
                    'options' => [
                        ['value' => 'available', 'label' => 'Available'],
                        ['value' => 'issued', 'label' => 'Issued'],
                        ['value' => 'reserved', 'label' => 'Reserved'],
                    ],
                ],
                ['name' => 'acquired_at', 'label' => 'ACQUIRED DATE', 'type' => 'date'],
            ],
            'columns' => [
                ['key' => 'book.title', 'label' => 'Book'],
                ['key' => 'accession_number', 'label' => 'Accession #'],
                ['key' => 'condition', 'label' => 'Condition'],
                ['key' => 'status', 'label' => 'Status'],
                ['key' => 'acquired_at', 'label' => 'Acquired Date'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'copies_count' => ['required', 'integer', 'min:1', 'max:500'],
            'condition' => ['required', Rule::in(['good', 'fair', 'damaged'])],
            'status' => ['required', Rule::in(['available', 'issued', 'reserved'])],
            'acquired_at' => ['nullable', 'date'],
        ]);

        DB::transaction(function () use ($data) {
            $copiesCount = (int) $data['copies_count'];

            for ($i = 0; $i < $copiesCount; $i++) {
                BookCopy::create([
                    'book_id' => $data['book_id'],
                    'accession_number' => $this->generateAccessionNumber((int) $data['book_id']),
                    'condition' => $data['condition'],
                    'status' => $data['status'],
                    'acquired_at' => $data['acquired_at'] ?? null,
                ]);
            }

            $this->syncBookCopyCounts((int) $data['book_id']);
        });

        return back();
    }

    public function update(Request $request, BookCopy $bookCopy): RedirectResponse
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'condition' => ['required', Rule::in(['good', 'fair', 'damaged'])],
            'status' => ['required', Rule::in(['available', 'issued', 'reserved'])],
            'acquired_at' => ['nullable', 'date'],
        ]);

        $oldBookId = (int) $bookCopy->book_id;

        $bookCopy->update($data);

        $this->syncBookCopyCounts((int) $bookCopy->book_id);
        if ($oldBookId !== (int) $bookCopy->book_id) {
            $this->syncBookCopyCounts($oldBookId);
        }

        return back();
    }

    public function destroy(BookCopy $bookCopy): RedirectResponse
    {
        $bookId = (int) $bookCopy->book_id;
        $bookCopy->delete();
        $this->syncBookCopyCounts($bookId);

        return back();
    }

    private function generateAccessionNumber(int $bookId): string
    {
        $sequence = BookCopy::query()->where('book_id', $bookId)->count() + 1;

        do {
            $candidate = sprintf('BK-%04d-%05d', $bookId, $sequence);
            $exists = BookCopy::query()->where('accession_number', $candidate)->exists();
            $sequence++;
        } while ($exists);

        return $candidate;
    }

    private function syncBookCopyCounts(int $bookId): void
    {
        $total = BookCopy::query()->where('book_id', $bookId)->count();
        $available = BookCopy::query()->where('book_id', $bookId)->where('status', 'available')->count();

        Book::query()->whereKey($bookId)->update([
            'copies_total' => $total,
            'copies_available' => $available,
        ]);
    }
}
