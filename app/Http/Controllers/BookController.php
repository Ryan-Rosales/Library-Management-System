<?php

namespace App\Http\Controllers;

use App\Models\Author;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\Category;
use App\Models\Genre;
use App\Models\MemberNotification;
use App\Models\Shelf;
use App\Models\User;
use App\Services\ActivityNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BookController extends Controller
{
    /**
     * Display the books table.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $status = trim((string) $request->input('status', ''));
        $category = trim((string) $request->input('category', ''));
        $shelf = trim((string) $request->input('shelf', ''));

        $books = Book::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%")
                        ->orWhere('category', 'like', "%{$search}%")
                        ->orWhere('genre', 'like', "%{$search}%")
                        ->orWhere('shelf', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->when($category !== '', fn ($query) => $query->where('category', $category))
            ->when($shelf !== '', fn ($query) => $query->where('shelf', $shelf))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $authors = Author::query()->orderBy('name')->pluck('name')->values();
        $categories = Category::query()->orderBy('name')->pluck('name')->values();
        $genres = Genre::query()->orderBy('name')->pluck('name')->values();
        $shelves = Shelf::query()->orderBy('code')->get(['code', 'name'])->map(fn (Shelf $shelf) => [
            'value' => $shelf->code,
            'label' => $shelf->code.' - '.$shelf->name,
        ])->values();

        return Inertia::render('catalog/books', [
            'books' => $books,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'category' => $category,
                'shelf' => $shelf,
            ],
            'options' => [
                'authors' => $authors,
                'categories' => $categories,
                'genres' => $genres,
                'shelves' => $shelves,
                'statuses' => [
                    ['value' => 'available', 'label' => 'Available'],
                    ['value' => 'being_processed', 'label' => 'Being Processed'],
                    ['value' => 'reference_only', 'label' => 'Reference only'],
                ],
            ],
        ]);
    }

    /**
     * Store a newly created book.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'max:64', 'unique:books,isbn'],
            'author' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'genre' => ['nullable', 'string', 'max:120'],
            'shelf' => ['nullable', 'string', 'max:80'],
            'published_at' => ['nullable', 'date'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:9999'],
            'status' => ['required', Rule::in(['available', 'being_processed', 'reference_only'])],
        ]);

        if (($data['status'] ?? '') === 'being_processed') {
            $data['shelf'] = null;
        }

        if (! empty($data['published_at'])) {
            $data['published_year'] = (int) date('Y', strtotime((string) $data['published_at']));
        }

        $data['copies_total'] = 0;
        $data['copies_available'] = 0;

        $book = Book::create($data);
        $this->syncBookCopyCounts($book);

        $memberIds = User::query()->where('role', 'member')->pluck('id');

        if ($memberIds->isNotEmpty()) {
            $notifications = $memberIds->map(fn (int $memberId) => [
                'user_id' => $memberId,
                'type' => 'new_book',
                'title' => 'New Book Added',
                'message' => sprintf('"%s" by %s is now in the catalog.', $book->title, $book->author),
                'url' => '/member/catalog',
                'meta' => json_encode([
                    'book_id' => $book->id,
                    'isbn' => $book->isbn,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            MemberNotification::insert($notifications);
        }

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'added',
            'book "'.$book->title.'"',
            route('books'),
        );

        return back()->with('success', 'Book added successfully.');
    }

    /**
     * Update the specified book.
     */
    public function update(Request $request, Book $book): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'isbn' => ['nullable', 'string', 'max:64', Rule::unique('books', 'isbn')->ignore($book->id)],
            'author' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:120'],
            'genre' => ['nullable', 'string', 'max:120'],
            'shelf' => ['nullable', 'string', 'max:80'],
            'published_at' => ['nullable', 'date'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:9999'],
            'status' => ['required', Rule::in(['available', 'being_processed', 'reference_only'])],
        ]);

        if (($data['status'] ?? '') === 'being_processed') {
            $data['shelf'] = null;
        }

        if (! empty($data['published_at'])) {
            $data['published_year'] = (int) date('Y', strtotime((string) $data['published_at']));
        }

        $book->update($data);
        $this->syncBookCopyCounts($book);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'updated',
            'book "'.$book->title.'"',
            route('books'),
        );

        return back()->with('success', 'Book updated successfully.');
    }

    /**
     * Remove the specified book.
     */
    public function destroy(Request $request, Book $book): RedirectResponse
    {
        $bookTitle = $book->title;
        $book->delete();

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'catalog',
            'deleted',
            'book "'.$bookTitle.'"',
            route('books'),
        );

        return back()->with('success', 'Book deleted successfully.');
    }

    private function syncBookCopyCounts(Book $book): void
    {
        $total = BookCopy::query()->where('book_id', $book->id)->count();
        $available = BookCopy::query()->where('book_id', $book->id)->where('status', 'available')->count();

        $book->updateQuietly([
            'copies_total' => $total,
            'copies_available' => $available,
        ]);
    }
}
