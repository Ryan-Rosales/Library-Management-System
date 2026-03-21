<?php

namespace App\Http\Controllers;

use App\Models\MembershipRequest;
use App\Models\PasswordChangeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PasswordChangeRequestController extends Controller
{
    public function markRead(Request $request, PasswordChangeRequest $passwordChangeRequest): RedirectResponse
    {
        $role = $request->user()?->role;

        if (! in_array($role, ['admin', 'staff'], true)) {
            abort(403);
        }

        if ($passwordChangeRequest->target_role !== $role) {
            abort(403);
        }

        if ($passwordChangeRequest->seen_at === null) {
            $passwordChangeRequest->forceFill([
                'seen_at' => now(),
            ])->save();
        }

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $role = $request->user()?->role;

        if (! in_array($role, ['admin', 'staff'], true)) {
            abort(403);
        }

        PasswordChangeRequest::query()
            ->where('target_role', $role)
            ->where('status', 'pending')
            ->whereNull('seen_at')
            ->update([
                'seen_at' => now(),
            ]);

        if ($role === 'staff') {
            MembershipRequest::query()
                ->where('status', 'pending')
                ->whereNull('seen_at')
                ->update([
                    'seen_at' => now(),
                ]);
        }

        return back();
    }
}
