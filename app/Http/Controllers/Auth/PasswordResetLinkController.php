<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordChangeRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
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

        $user = User::query()
            ->where('email', $data['email'])
            ->where('role', $data['requester_role'])
            ->first();

        if (! $user) {
            return back()
                ->withErrors([
                    'email' => 'No account found for this role and email combination.',
                ])
                ->withInput();
        }

        $targetRole = $data['requester_role'] === 'staff' ? 'admin' : 'staff';

        $alreadyPending = PasswordChangeRequest::query()
            ->where('requester_email', $user->email)
            ->where('requester_role', $data['requester_role'])
            ->where('status', 'pending')
            ->exists();

        if ($alreadyPending) {
            return back()->with('status', 'A password change request is already pending review.');
        }

        PasswordChangeRequest::query()->create([
            'requester_user_id' => $user->id,
            'requester_name' => $user->name,
            'requester_email' => $user->email,
            'requester_role' => $data['requester_role'],
            'target_role' => $targetRole,
            'reason' => $data['reason'] ?? null,
            'status' => 'pending',
        ]);

        $targetLabel = $targetRole === 'admin' ? 'admin' : 'staff';

        return redirect()
            ->route('login')
            ->with('success', "Password change request sent successfully. {$targetLabel} has been notified.");
    }
}
