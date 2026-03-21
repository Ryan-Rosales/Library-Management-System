<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\MembershipRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'contact_number' => 'required|string|max:30',
            'region_code' => 'required|string|max:20',
            'region_name' => 'required|string|max:255',
            'province_code' => 'nullable|string|max:20',
            'province_name' => 'nullable|string|max:255',
            'city_municipality_code' => 'required|string|max:20',
            'city_municipality_name' => 'required|string|max:255',
            'barangay_code' => 'required|string|max:20',
            'barangay_name' => 'required|string|max:255',
            'street_address' => 'nullable|string|max:255',
        ]);

        $alreadyPending = MembershipRequest::query()
            ->where('email', $data['email'])
            ->where('status', 'pending')
            ->exists();

        if ($alreadyPending) {
            return back()->withErrors([
                'email' => 'A membership request with this email is already pending review.',
            ])->withInput();
        }

        MembershipRequest::query()->create($data + [
            'status' => 'pending',
        ]);

        return to_route('login')->with('success', 'Membership request submitted. Staff has been notified.');
    }
}
