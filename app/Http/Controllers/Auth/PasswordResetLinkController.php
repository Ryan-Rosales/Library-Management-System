<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordChangeRequest;
use App\Models\User;
use App\Services\TransactionalMailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PasswordResetLinkController extends Controller
{
    public function __construct(
        private readonly TransactionalMailService $mailService,
    ) {
    }

    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'requester_role' => ['required', 'in:staff,member'],
            'reason' => ['nullable', 'string', 'max:700', 'required_if:requester_role,staff'],
        ]);

        $normalizedEmail = strtolower((string) $data['email']);

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->where('role', $data['requester_role'])
            ->first();

        if (! $user) {
            return back()
                ->withErrors([
                    'email' => 'No account found for this role and email combination.',
                ])
                ->withInput();
        }

        $existingPendingRequest = PasswordChangeRequest::query()
            ->where('requester_user_id', $user->id)
            ->where('requester_role', $data['requester_role'])
            ->where('status', 'pending')
            ->latest('id')
            ->first();

        if ($existingPendingRequest) {
            try {
                $this->dispatchVerificationLink($user, $data['requester_role'], $existingPendingRequest);
            } catch (Throwable) {
                return back()->withErrors([
                    'email' => 'A pending request exists, but the verification email could not be sent right now. Please try again shortly.',
                ]);
            }

            return back()->with('status', 'A password change request is already pending review. A new verification link was sent to your email.');
        }

        $targetRoles = $data['requester_role'] === 'staff'
            ? ['admin']
            : ['staff', 'admin'];

        $now = now();

        $rows = collect($targetRoles)->map(fn (string $targetRole) => [
            'requester_user_id' => $user->id,
            'requester_name' => $user->name,
            'requester_email' => $user->email,
            'requester_role' => $data['requester_role'],
            'target_role' => $targetRole,
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        PasswordChangeRequest::query()->insert($rows);

        $createdRequests = PasswordChangeRequest::query()
            ->where('requester_user_id', $user->id)
            ->where('status', 'pending')
            ->whereIn('target_role', $targetRoles)
            ->where('created_at', '>=', $now->copy()->subSecond())
            ->latest('id')
            ->take(count($targetRoles))
            ->get();

        $referenceRequest = $createdRequests->first();

        if ($referenceRequest) {
            try {
                $this->dispatchVerificationLink($user, $data['requester_role'], $referenceRequest);
            } catch (Throwable) {
                return back()->withErrors([
                    'email' => 'Password request was created, but the verification email could not be sent right now. Please submit again to resend the link.',
                ]);
            }
        }

        return redirect()
            ->route('login')
            ->with('success', 'Password change request sent successfully. Check your email and click the verification link to continue.');
    }

    private function dispatchVerificationLink(User $user, string $requesterRole, PasswordChangeRequest $passwordRequest): void
    {
        $verificationUrl = URL::temporarySignedRoute(
            'password-change-requests.verify',
            now()->addHours(24),
            [
                'passwordChangeRequest' => $passwordRequest->id,
            ],
        );

        $this->mailService->sendPasswordResetVerificationLink(
            recipientEmail: $user->email,
            recipientName: $user->name,
            requesterName: $user->name,
            requesterEmail: $user->email,
            requesterRole: $requesterRole,
            verificationUrl: $verificationUrl,
        );
    }
}
