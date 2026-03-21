<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $booksInCatalog = Book::count();
        $activeMembers = User::where('role', 'member')->count();
        $borrowedToday = BookCopy::where('status', 'borrowed')->whereDate('updated_at', today())->count();
        $overdueReturns = BookCopy::where('status', 'overdue')->count();

        $cards = [
            [
                'label' => 'Books In Catalog',
                'value' => number_format($booksInCatalog),
                'trend' => $this->formatTrend(
                    Book::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    Book::whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])->count(),
                ),
                'icon' => 'BookCopy',
            ],
            [
                'label' => 'Active Members',
                'value' => number_format($activeMembers),
                'trend' => $this->formatTrend(
                    User::where('role', 'member')->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    User::where('role', 'member')->whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])->count(),
                ),
                'icon' => 'UserRoundPlus',
            ],
            [
                'label' => 'Borrowed Today',
                'value' => number_format($borrowedToday),
                'trend' => $this->formatTrend(
                    $borrowedToday,
                    BookCopy::where('status', 'borrowed')->whereDate('updated_at', today()->subDay())->count(),
                ),
                'icon' => 'BookOpenCheck',
            ],
            [
                'label' => 'Overdue Returns',
                'value' => number_format($overdueReturns),
                'trend' => $this->formatTrend(
                    $overdueReturns,
                    BookCopy::where('status', 'overdue')->whereDate('updated_at', today()->subDay())->count(),
                ),
                'icon' => 'CalendarClock',
            ],
        ];

        $activities = $this->buildActivityFeed();

        $quickActions = [
            ['label' => 'Issue a Book', 'url' => '/book-copies'],
            ['label' => 'Register Member', 'url' => '/members'],
            ['label' => 'Manage Returns', 'url' => '/book-copies'],
            ['label' => 'Inventory Audit', 'url' => '/books'],
        ];

        return Inertia::render('dashboard', [
            'cards' => $cards,
            'activities' => $activities,
            'quickActions' => $quickActions,
        ]);
    }

    private function buildActivityFeed(): array
    {
        $memberEvents = User::query()
            ->where('role', 'member')
            ->latest()
            ->limit(4)
            ->get(['name', 'created_at'])
            ->map(fn (User $user) => [
                'title' => 'New member registration',
                'meta' => sprintf('%s - %s', $user->name, $this->toRelativeTime($user->created_at)),
                'ts' => optional($user->created_at)?->timestamp ?? 0,
            ]);

        $bookEvents = Book::query()
            ->latest()
            ->limit(4)
            ->get(['title', 'created_at'])
            ->map(fn (Book $book) => [
                'title' => 'Book added to catalog',
                'meta' => sprintf('%s - %s', $book->title, $this->toRelativeTime($book->created_at)),
                'ts' => optional($book->created_at)?->timestamp ?? 0,
            ]);

        $copyEvents = BookCopy::query()
            ->with('book:id,title')
            ->latest()
            ->limit(5)
            ->get(['book_id', 'status', 'updated_at'])
            ->map(function (BookCopy $copy) {
                $bookTitle = optional($copy->book)->title ?? 'Book copy';
                $title = match ($copy->status) {
                    'borrowed' => 'Book borrowed',
                    'overdue' => 'Overdue return detected',
                    'maintenance' => 'Copy in maintenance',
                    default => 'Book copy updated',
                };

                return [
                    'title' => $title,
                    'meta' => sprintf('%s - %s', $bookTitle, $this->toRelativeTime($copy->updated_at)),
                    'ts' => optional($copy->updated_at)?->timestamp ?? 0,
                ];
            });

        return $memberEvents
            ->concat($bookEvents)
            ->concat($copyEvents)
            ->sortByDesc('ts')
            ->take(6)
            ->values()
            ->map(fn ($item) => [
                'title' => $item['title'],
                'meta' => $item['meta'],
            ])
            ->all();
    }

    private function toRelativeTime(?Carbon $date): string
    {
        return $date ? $date->diffForHumans() : 'just now';
    }

    private function formatTrend(int|float $current, int|float $previous): string
    {
        if ($previous <= 0) {
            return $current > 0 ? '+100.0%' : '+0.0%';
        }

        $change = (($current - $previous) / $previous) * 100;
        $prefix = $change >= 0 ? '+' : '';

        return $prefix.number_format($change, 1).'%';
    }
}
