<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PasswordChangeRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserAccountControlController extends Controller
{
    public function index(Request $request): Response
    {
        $role = $this->ensureControlRole($request);

        $selectedRequestId = (int) $request->integer('request');

        if ($selectedRequestId > 0) {
            $selectedRequest = $this->buildVisibleRequestsQuery($role)
                ->where('id', $selectedRequestId)
                ->first();

            if ($selectedRequest && $selectedRequest->seen_at === null) {
                $selectedRequest->forceFill([
                    'seen_at' => now(),
                ])->save();
            }
        }

        $manageableRoles = $role === 'admin' ? ['staff', 'member'] : ['member'];

        $users = User::query()
            ->whereIn('role', $manageableRoles)
            ->orderBy('role')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ])
            ->values();

        $pendingRequests = $this->buildVisibleRequestsQuery($role)
            ->latest()
            ->get([
                'id',
                'requester_user_id',
                'requester_name',
                'requester_email',
                'requester_role',
                'target_role',
                'reason',
                'created_at',
                'seen_at',
            ])
            ->map(fn (PasswordChangeRequest $requestItem) => [
                'id' => $requestItem->id,
                'requester_user_id' => $requestItem->requester_user_id,
                'requester_name' => $requestItem->requester_name,
                'requester_email' => $requestItem->requester_email,
                'requester_role' => $requestItem->requester_role,
                'target_role' => $requestItem->target_role,
                'reason' => $requestItem->reason,
                'created_at' => optional($requestItem->created_at)->toDateTimeString(),
                'seen_at' => optional($requestItem->seen_at)->toDateTimeString(),
            ])
            ->values();

        return Inertia::render('settings/user-account-control', [
            'viewerRole' => $role,
            'users' => $users,
            'pendingRequests' => $pendingRequests,
            'selectedRequestId' => $selectedRequestId,
        ]);
    }

    public function updateEmail(Request $request, User $user): RedirectResponse
    {
        $role = $this->ensureControlRole($request);

        if ($role !== 'admin') {
            abort(403);
        }

        $this->ensureManageableUser($user);

        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->forceFill([
            'email' => $validated['email'],
        ])->save();

        return back()->with('success', 'User email updated successfully.');
    }

    public function updatePassword(Request $request, User $user): RedirectResponse
    {
        $role = $this->ensureControlRole($request);

        if ($role === 'staff' && $user->role !== 'member') {
            return back()->withErrors([
                'password' => 'Staff can only process member password requests.',
            ]);
        }

        if ($role === 'admin' && ! in_array($user->role, ['staff', 'member'], true)) {
            return back()->withErrors([
                'password' => 'Only staff and member passwords can be changed from this panel.',
            ]);
        }

        $this->ensureManageableUser($user);

        $validated = $request->validate([
            'request_id' => ['required', 'integer', 'exists:password_change_requests,id'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $pendingRequestQuery = PasswordChangeRequest::query()
            ->where('id', $validated['request_id'])
            ->where('requester_user_id', $user->id)
            ->where('status', 'pending');

        if ($role === 'staff') {
            $pendingRequestQuery
                ->where('target_role', 'staff')
                ->where('requester_role', 'member');
        } else {
            $pendingRequestQuery->where(function ($query) {
                $query
                    ->where(function ($staffQuery) {
                        $staffQuery
                            ->where('target_role', 'admin')
                            ->where('requester_role', 'staff');
                    })
                    ->orWhere(function ($memberQuery) {
                        $memberQuery
                            ->whereIn('target_role', ['admin', 'staff'])
                            ->where('requester_role', 'member');
                    });
            });
        }

        $pendingRequest = $pendingRequestQuery->first();

        if (! $pendingRequest) {
            return back()->withErrors([
                'password' => 'A pending password request is required before changing this password.',
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        $pendingRequest->forceFill([
            'status' => 'reviewed',
            'seen_at' => $pendingRequest->seen_at ?? now(),
            'resolved_at' => now(),
        ])->save();

        return back()->with('success', ucfirst($user->role).' password updated and request marked as reviewed.');
    }

    private function ensureControlRole(Request $request): string
    {
        $role = (string) $request->user()?->role;

        if (! in_array($role, ['admin', 'staff'], true)) {
            abort(403);
        }

        return $role;
    }

    private function ensureManageableUser(User $user): void
    {
        if (! in_array($user->role, ['staff', 'member'], true)) {
            abort(403);
        }
    }

    private function buildVisibleRequestsQuery(string $role)
    {
        $query = PasswordChangeRequest::query()->where('status', 'pending');

        if ($role === 'admin') {
            return $query->where(function ($nested) {
                $nested
                    ->where(function ($staffQuery) {
                        $staffQuery
                            ->where('target_role', 'admin')
                            ->where('requester_role', 'staff');
                    })
                    ->orWhere(function ($memberQuery) {
                        $memberQuery
                            ->whereIn('target_role', ['admin', 'staff'])
                            ->where('requester_role', 'member');
                    });
            });
        }

        return $query
            ->where('target_role', 'staff')
            ->where('requester_role', 'member');
    }
}
