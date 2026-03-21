<?php

namespace App\Http\Controllers;

use App\Models\BookCopy;
use App\Models\MembershipRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $selectedRange = (string) $request->input('range', '7d');

        if (! in_array($selectedRange, ['today', '7d', '30d'], true)) {
            $selectedRange = '7d';
        }

        $periodStart = match ($selectedRange) {
            'today' => now()->startOfDay(),
            '30d' => now()->subDays(29)->startOfDay(),
            default => now()->subDays(6)->startOfDay(),
        };

        $periodEnd = now()->endOfDay();
        $dueWindowEnd = match ($selectedRange) {
            'today' => today(),
            '30d' => today()->addDays(29),
            default => today()->addDays(6),
        };

        $pendingMembershipRequests = MembershipRequest::query()
            ->where('status', 'pending')
            ->count();

        $approvedInRange = MembershipRequest::query()
            ->where('status', 'reviewed')
            ->where('review_outcome', 'approved')
            ->whereBetween('resolved_at', [$periodStart, $periodEnd])
            ->count();

        $borrowedInRange = BookCopy::query()
            ->whereNotNull('borrowed_at')
            ->whereBetween('borrowed_at', [$periodStart, $periodEnd])
            ->count();

        $returnedInRange = BookCopy::query()
            ->whereNotNull('returned_at')
            ->whereBetween('returned_at', [$periodStart, $periodEnd])
            ->count();

        $overdueLoans = BookCopy::query()
            ->whereIn('status', ['issued', 'on_loan'])
            ->whereDate('due_at', '<', today())
            ->count();

        $newMembersInRange = User::query()
            ->where('role', 'member')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->count();

        $dueInRange = BookCopy::query()
            ->whereIn('status', ['issued', 'on_loan'])
            ->whereDate('due_at', '>=', today())
            ->whereDate('due_at', '<=', $dueWindowEnd)
            ->count();

        $availableCopiesNow = BookCopy::query()
            ->where('status', 'available')
            ->count();

        $cards = [
            [
                'label' => 'Pending Membership Requests',
                'value' => number_format($pendingMembershipRequests),
                'hint' => 'Needs staff review',
                'tone' => 'amber',
            ],
            [
                'label' => 'Approved In Range',
                'value' => number_format($approvedInRange),
                'hint' => 'Membership approvals',
                'tone' => 'blue',
            ],
            [
                'label' => 'Borrowed In Range',
                'value' => number_format($borrowedInRange),
                'hint' => 'Issued during range',
                'tone' => 'violet',
            ],
            [
                'label' => 'Returned In Range',
                'value' => number_format($returnedInRange),
                'hint' => 'Completed returns',
                'tone' => 'rose',
            ],
            [
                'label' => 'New Members In Range',
                'value' => number_format($newMembersInRange),
                'hint' => 'Recently added members',
                'tone' => 'emerald',
            ],
            [
                'label' => 'Due In Range / Overdue',
                'value' => number_format($dueInRange).' / '.number_format($overdueLoans),
                'hint' => 'Upcoming due and late',
                'tone' => 'teal',
            ],
        ];

        $recentMembers = User::query()
            ->where('role', 'member')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->latest()
            ->limit(6)
            ->get(['name', 'email', 'created_at'])
            ->map(fn (User $member) => [
                'name' => $member->name,
                'meta' => $member->email,
                'timestamp' => optional($member->created_at)?->diffForHumans() ?? 'just now',
            ])
            ->values();

        $dueSoonLoans = BookCopy::query()
            ->with(['book:id,title', 'borrower:id,name'])
            ->whereIn('status', ['issued', 'on_loan'])
            ->whereDate('due_at', '>=', today())
            ->whereDate('due_at', '<=', $dueWindowEnd)
            ->orderBy('due_at')
            ->limit(6)
            ->get(['id', 'book_id', 'borrower_id', 'accession_number', 'due_at'])
            ->map(function (BookCopy $copy) {
                $bookTitle = optional($copy->book)->title ?? 'Unknown title';
                $borrowerName = optional($copy->borrower)->name ?? 'Unknown member';

                return [
                    'title' => $bookTitle,
                    'meta' => 'Borrower: '.$borrowerName.' | Copy: '.$copy->accession_number,
                    'timestamp' => optional($copy->due_at)?->format('M d, Y') ?? '-',
                ];
            })
            ->values();

        $quickActions = [
            ['label' => 'Review Membership Requests', 'url' => '/membership-requests'],
            ['label' => 'Issue Books', 'url' => '/borrow'],
            ['label' => 'Process Returns', 'url' => '/return'],
            ['label' => 'Open Member Directory', 'url' => '/members'],
            ['label' => 'View Loan History', 'url' => '/history'],
            ['label' => 'Browse Book Catalog', 'url' => '/books'],
        ];

        return Inertia::render('staff/dashboard', [
            'cards' => $cards,
            'recentMembers' => $recentMembers,
            'dueSoonLoans' => $dueSoonLoans,
            'quickActions' => $quickActions,
            'selectedRange' => $selectedRange,
            'rangeSummary' => match ($selectedRange) {
                'today' => 'Today',
                '30d' => 'Last 30 days',
                default => 'Last 7 days',
            },
            'availableCopiesNow' => number_format($availableCopiesNow),
        ]);
    }
}
