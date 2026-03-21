<?php

namespace App\Http\Controllers;

use App\Models\MemberNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! in_array($user?->role, ['admin', 'staff'], true)) {
            abort(403);
        }

        $search = trim((string) $request->input('search', ''));

        $activities = MemberNotification::query()
            ->where('user_id', $user->id)
            ->where('type', 'role_activity')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (MemberNotification $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'message' => $item->message,
                'url' => $item->url,
                'meta' => $item->meta,
                'created_at' => optional($item->created_at)->toDateTimeString(),
                'seen_at' => optional($item->seen_at)->toDateTimeString(),
            ]);

        return Inertia::render('activity/team-activity', [
            'activities' => $activities,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! in_array($user?->role, ['admin', 'staff'], true)) {
            abort(403);
        }

        MemberNotification::query()
            ->where('user_id', $user->id)
            ->where('type', 'role_activity')
            ->whereNull('seen_at')
            ->update([
                'seen_at' => now(),
            ]);

        return back()->with('success', 'Team activity notifications marked as read.');
    }
}
