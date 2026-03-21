<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $booksTotal = Book::count();
        $categoriesTotal = Category::count();
        $membersTotal = User::where('role', 'member')->count();
        $staffTotal = User::where('role', 'staff')->count();

        $copiesTotal = (int) Book::sum('copies_total');
        $copiesAvailable = (int) Book::sum('copies_available');
        $utilizationRate = $copiesTotal > 0 ? round((($copiesTotal - $copiesAvailable) / $copiesTotal) * 100, 1) : 0;

        $topCategories = Book::query()
            ->selectRaw('category, COUNT(*) as books_count, SUM(copies_total) as copies_total, SUM(copies_available) as copies_available')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->groupBy('category')
            ->orderByDesc('books_count')
            ->limit(6)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->category,
                'books_count' => (int) $row->books_count,
                'copies_total' => (int) $row->copies_total,
                'copies_available' => (int) $row->copies_available,
                'checked_out' => max((int) $row->copies_total - (int) $row->copies_available, 0),
            ])
            ->values();

        $recentBooks = Book::query()
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'category', 'copies_available', 'copies_total', 'created_at'])
            ->map(fn ($book) => [
                'id' => $book->id,
                'title' => $book->title,
                'category' => $book->category,
                'copies_available' => (int) $book->copies_available,
                'copies_total' => (int) $book->copies_total,
                'created_at' => optional($book->created_at)->toDateString(),
            ])
            ->values();

        return Inertia::render('analytics/reports', [
            'summary' => [
                'books_total' => $booksTotal,
                'categories_total' => $categoriesTotal,
                'members_total' => $membersTotal,
                'staff_total' => $staffTotal,
                'copies_total' => $copiesTotal,
                'copies_available' => $copiesAvailable,
                'utilization_rate' => $utilizationRate,
            ],
            'topCategories' => $topCategories,
            'recentBooks' => $recentBooks,
        ]);
    }
}
