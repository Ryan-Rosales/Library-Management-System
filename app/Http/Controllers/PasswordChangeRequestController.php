<?php

namespace App\Http\Controllers;

use App\Models\MemberNotification;
use App\Models\MembershipRequest;
use App\Models\PasswordChangeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PasswordChangeRequestController extends Controller
{
    public function verify(Request $request, PasswordChangeRequest $passwordChangeRequest): Response
    {
        if (! $request->hasValidSignature(false)) {
            return Inertia::render('auth/password-request-verification', [
                'status' => 'invalid',
                'message' => 'This verification link is invalid or has expired.',
            ]);
        }

        if ($passwordChangeRequest->status !== 'pending') {
            return Inertia::render('auth/password-request-verification', [
                'status' => 'invalid',
                'message' => 'This password request is no longer eligible for verification.',
            ]);
        }

        PasswordChangeRequest::query()
            ->where('requester_user_id', $passwordChangeRequest->requester_user_id)
            ->where('requester_role', $passwordChangeRequest->requester_role)
            ->where('status', 'pending')
            ->update([
                'verified_by_user_id' => $passwordChangeRequest->requester_user_id,
                'verified_at' => now(),
                'seen_at' => now(),
            ]);

        return Inertia::render('auth/password-request-verification', [
            'status' => 'verified',
            'message' => 'Email verified. Your password request is now ready for admin/staff processing.',
        ]);
    }

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

        MemberNotification::query()
            ->where('user_id', $request->user()?->id)
            ->where('type', 'role_activity')
            ->whereNull('seen_at')
            ->update([
                'seen_at' => now(),
            ]);

        return back();
    }
}
