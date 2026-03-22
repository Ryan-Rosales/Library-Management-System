<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Book;
use App\Models\BookCopy;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        $booksCount = Schema::hasTable('books') ? Book::query()->count() : 0;
        $membersCount = Schema::hasTable('users') ? User::query()->where('role', 'member')->count() : 0;
        $onLoanCount = Schema::hasTable('book_copies') ? BookCopy::query()->whereIn('status', ['borrowed', 'issued', 'on_loan'])->count() : 0;

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'loginStats' => [
                'books' => number_format($booksCount),
                'members' => number_format($membersCount),
                'onLoan' => number_format($onLoanCount),
            ],
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();
        $selectedRole = $request->string('role')->toString();
        $actualRole = $user?->role ?? '';

        if ($selectedRole && $actualRole && $selectedRole !== $actualRole) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()
                ->withErrors(['email' => 'Selected role does not match this account.'])
                ->withInput($request->only('email', 'remember'));
        }

        if ($actualRole === 'staff') {
            return redirect()->intended(route('staff.dashboard', absolute: false))
                ->with('success', 'Welcome back. You are now signed in.');
        }

        return redirect()->intended(route('dashboard', absolute: false))->with('success', 'Welcome back. You are now signed in.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'You have been signed out successfully.');
    }
}
