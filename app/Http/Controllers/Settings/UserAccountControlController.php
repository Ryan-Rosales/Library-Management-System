<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PasswordChangeRequest;
use App\Models\User;
use App\Services\TransactionalMailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserAccountControlController extends Controller
{
    public function __construct(
        private readonly TransactionalMailService $mailService,
    ) {
    }

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
                'verified_by_user_id',
                'verified_at',
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
                'verified_by_user_id' => $requestItem->verified_by_user_id,
                'verified_at' => optional($requestItem->verified_at)->toDateTimeString(),
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

    public function audit(Request $request): Response
    {
        $role = $this->ensureControlRole($request);

        if ($role !== 'admin') {
            abort(403);
        }

        $search = trim((string) $request->string('search', ''));

        $records = PasswordChangeRequest::query()
            ->with(['processedBy:id,name,role'])
            ->where('status', 'reviewed')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('requester_name', 'like', "%{$search}%")
                        ->orWhere('requester_email', 'like', "%{$search}%")
                        ->orWhere('requester_role', 'like', "%{$search}%");
                });
            })
            ->latest('resolved_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (PasswordChangeRequest $item) => [
                'id' => $item->id,
                'requester_name' => $item->requester_name,
                'requester_email' => $item->requester_email,
                'requester_role' => $item->requester_role,
                'target_role' => $item->target_role,
                'review_action' => $item->review_action,
                'verified_at' => optional($item->verified_at)->toDateTimeString(),
                'resolved_at' => optional($item->resolved_at)->toDateTimeString(),
                'processed_by' => $item->processedBy ? [
                    'id' => $item->processedBy->id,
                    'name' => $item->processedBy->name,
                    'role' => $item->processedBy->role,
                ] : null,
            ]);

        return Inertia::render('settings/password-reset-audit', [
            'records' => $records,
            'filters' => [
                'search' => $search,
            ],
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
            'password' => ['nullable', Password::defaults(), 'confirmed'],
        ]);

        $pendingRequest = $this->resolvePendingRequestForRole($role, $validated['request_id'], $user->id);

        if (! $pendingRequest) {
            return back()->withErrors([
                'password' => 'A pending password request is required before changing this password.',
            ]);
        }

        if ($pendingRequest->verified_at === null) {
            return back()->withErrors([
                'password' => 'This request must be verified from the email link before password can be changed.',
            ]);
        }

        $providedPassword = (string) ($validated['password'] ?? '');
        $isMemberRequester = $pendingRequest->requester_role === 'member';

        if (! $isMemberRequester && $providedPassword === '') {
            return back()->withErrors([
                'password' => 'A new password is required for staff requester accounts.',
            ]);
        }

        $plainPassword = $isMemberRequester
            ? ($providedPassword !== '' ? $providedPassword : Str::password(12))
            : $providedPassword;

        $user->forceFill([
            'password' => Hash::make($plainPassword),
            'must_change_password' => true,
        ])->save();

        $pendingRequest->forceFill([
            'status' => 'reviewed',
            'review_action' => 'approved',
            'processed_by_user_id' => $request->user()?->id,
            'seen_at' => $pendingRequest->seen_at ?? now(),
            'resolved_at' => now(),
        ])->save();

        $this->resolveSiblingPendingRequests(
            requestItem: $pendingRequest,
            reviewAction: 'approved',
            processedByUserId: $request->user()?->id,
        );

        $this->mailService->sendPasswordResetChangedNotice(
            recipientEmail: $user->email,
            recipientName: $user->name,
            newPassword: $plainPassword,
            changedByName: (string) $request->user()?->name,
            changedByRole: (string) $request->user()?->role,
        );

        return back()->with('success', ucfirst($user->role).' password updated and request marked as reviewed.');
    }

    public function rejectPassword(Request $request, User $user): RedirectResponse
    {
        $role = $this->ensureControlRole($request);

        if ($role === 'staff' && $user->role !== 'member') {
            return back()->withErrors([
                'password' => 'Staff can only process member password requests.',
            ]);
        }

        if ($role === 'admin' && ! in_array($user->role, ['staff', 'member'], true)) {
            return back()->withErrors([
                'password' => 'Only staff and member requests can be processed from this panel.',
            ]);
        }

        $this->ensureManageableUser($user);

        $validated = $request->validate([
            'request_id' => ['required', 'integer', 'exists:password_change_requests,id'],
        ]);

        $pendingRequest = $this->resolvePendingRequestForRole($role, $validated['request_id'], $user->id);

        if (! $pendingRequest) {
            return back()->withErrors([
                'password' => 'A pending password request is required before rejecting this request.',
            ]);
        }

        $pendingRequest->forceFill([
            'status' => 'reviewed',
            'review_action' => 'rejected',
            'processed_by_user_id' => $request->user()?->id,
            'seen_at' => $pendingRequest->seen_at ?? now(),
            'resolved_at' => now(),
        ])->save();

        $this->resolveSiblingPendingRequests(
            requestItem: $pendingRequest,
            reviewAction: 'rejected',
            processedByUserId: $request->user()?->id,
        );

        $this->mailService->sendPasswordResetRejectedNotice(
            recipientEmail: $user->email,
            recipientName: $user->name,
            requesterRole: (string) $pendingRequest->requester_role,
            rejectedByName: (string) $request->user()?->name,
            rejectedByRole: (string) $request->user()?->role,
        );

        return back()->with('success', ucfirst($user->role).' forgot-password request was rejected and requester was notified by email.');
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

    private function resolvePendingRequestForRole(string $role, int $requestId, int $requesterUserId): ?PasswordChangeRequest
    {
        $pendingRequestQuery = PasswordChangeRequest::query()
            ->where('id', $requestId)
            ->where('requester_user_id', $requesterUserId)
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

        return $pendingRequestQuery->first();
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

    private function resolveSiblingPendingRequests(PasswordChangeRequest $requestItem, string $reviewAction, ?int $processedByUserId): void
    {
        PasswordChangeRequest::query()
            ->where('requester_user_id', $requestItem->requester_user_id)
            ->where('requester_role', $requestItem->requester_role)
            ->where('status', 'pending')
            ->where('id', '!=', $requestItem->id)
            ->update([
                'status' => 'reviewed',
                'review_action' => $reviewAction,
                'processed_by_user_id' => $processedByUserId,
                'seen_at' => now(),
                'resolved_at' => now(),
                'updated_at' => now(),
            ]);
    }

}
