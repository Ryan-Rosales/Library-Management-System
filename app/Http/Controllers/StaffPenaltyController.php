<?php

namespace App\Http\Controllers;

use App\Models\CirculationLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffPenaltyController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $penalties = CirculationLog::query()
            ->with(['book:id,title,author,isbn', 'member:id,name,email'])
            ->where('fine_amount', '>', 0)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->whereHas('book', function ($bookQuery) use ($search) {
                            $bookQuery
                                ->where('title', 'like', "%{$search}%")
                                ->orWhere('author', 'like', "%{$search}%")
                                ->orWhere('isbn', 'like', "%{$search}%");
                        })
                        ->orWhereHas('member', function ($memberQuery) use ($search) {
                            $memberQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('returned_at')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (CirculationLog $log) => [
                'id' => $log->id,
                'title' => $log->book?->title,
                'author' => $log->book?->author,
                'isbn' => $log->book?->isbn,
                'member_name' => $log->member?->name,
                'member_email' => $log->member?->email,
                'returned_at' => optional($log->returned_at)->toDateTimeString(),
                'fine_amount' => (int) $log->fine_amount,
                'fine_status' => $log->fine_status,
            ]);

        $pendingTotal = (int) CirculationLog::query()
            ->where('fine_status', 'pending')
            ->sum('fine_amount');

        return Inertia::render('circulation/penalties', [
            'penalties' => $penalties,
            'filters' => [
                'search' => $search,
            ],
            'pendingTotal' => $pendingTotal,
        ]);
    }

    public function markCleared(Request $request, CirculationLog $circulationLog): RedirectResponse
    {
        if ((int) $circulationLog->fine_amount <= 0) {
            return back()->with('info', 'This record has no penalty amount.');
        }

        $circulationLog->update([
            'fine_status' => 'cleared',
        ]);

        return back()->with('success', 'Penalty marked as cleared.');
    }
}
