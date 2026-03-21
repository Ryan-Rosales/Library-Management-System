<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function members(Request $request): Response
    {
        return $this->renderRolePage($request, 'member', 'Members', [
            'index' => 'members',
            'store' => 'members.store',
            'update' => 'members.update',
            'destroy' => 'members.destroy',
        ]);
    }

    public function staff(Request $request): Response
    {
        return $this->renderRolePage($request, 'staff', 'Staff', [
            'index' => 'staff',
            'store' => 'staff.store',
            'update' => 'staff.update',
            'destroy' => 'staff.destroy',
        ]);
    }

    public function storeMember(Request $request): RedirectResponse
    {
        return $this->storeByRole($request, 'member');
    }

    public function storeStaff(Request $request): RedirectResponse
    {
        return $this->storeByRole($request, 'staff');
    }

    public function updateMember(Request $request, User $user): RedirectResponse
    {
        return $this->updateByRole($request, $user, 'member');
    }

    public function updateStaff(Request $request, User $user): RedirectResponse
    {
        return $this->updateByRole($request, $user, 'staff');
    }

    public function destroyMember(User $user): RedirectResponse
    {
        return $this->destroyByRole($user, 'member');
    }

    public function destroyStaff(User $user): RedirectResponse
    {
        return $this->destroyByRole($user, 'staff');
    }

    private function renderRolePage(Request $request, string $role, string $title, array $routeNames): Response
    {
        $search = trim((string) $request->input('search', ''));

        $prefill = null;

        if ($role === 'member') {
            $prefill = [
                'name' => trim((string) $request->input('prefill_name', '')),
                'email' => trim((string) $request->input('prefill_email', '')),
                'contact_number' => trim((string) $request->input('prefill_contact_number', '')),
                'region_name' => trim((string) $request->input('prefill_region_name', '')),
                'province_name' => trim((string) $request->input('prefill_province_name', '')),
                'city_municipality_name' => trim((string) $request->input('prefill_city_municipality_name', '')),
                'barangay_name' => trim((string) $request->input('prefill_barangay_name', '')),
                'street_address' => trim((string) $request->input('prefill_street_address', '')),
            ];
        }

        $records = User::query()
            ->where('role', $role)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($nested) use ($search) {
                    $nested
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $columns = [
            ['key' => 'name', 'label' => 'Name'],
            ['key' => 'email', 'label' => 'Email'],
        ];

        if ($role === 'member') {
            $columns = array_merge($columns, [
                ['key' => 'contact_number', 'label' => 'Contact'],
                ['key' => 'region_name', 'label' => 'Region'],
                ['key' => 'province_name', 'label' => 'Province'],
                ['key' => 'city_municipality_name', 'label' => 'City/Municipality'],
                ['key' => 'barangay_name', 'label' => 'Barangay'],
                ['key' => 'street_address', 'label' => 'Street'],
            ]);
        }

        $columns[] = ['key' => 'created_at', 'label' => 'Created At'];

        return Inertia::render('people/manage-users', [
            'title' => $title,
            'role' => $role,
            'records' => $records,
            'filters' => ['search' => $search],
            'routes' => $routeNames,
            'prefill' => $prefill,
            'columns' => $columns,
        ]);
    }

    private function storeByRole(Request $request, string $role): RedirectResponse
    {
        $rules = [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ];

        if ($role === 'member') {
            $rules = array_merge($rules, [
                'contact_number' => ['required', 'string', 'max:30'],
                'region_name' => ['required', 'string', 'max:255'],
                'province_name' => ['nullable', 'string', 'max:255'],
                'city_municipality_name' => ['required', 'string', 'max:255'],
                'barangay_name' => ['required', 'string', 'max:255'],
                'street_address' => ['nullable', 'string', 'max:255'],
            ]);
        }

        $data = $request->validate($rules);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $role,
            'password' => Hash::make($data['password']),
            'email_verified_at' => now(),
        ];

        if ($role === 'member') {
            $payload = array_merge($payload, [
                'contact_number' => $data['contact_number'],
                'region_name' => $data['region_name'],
                'province_name' => $data['province_name'] ?? null,
                'city_municipality_name' => $data['city_municipality_name'],
                'barangay_name' => $data['barangay_name'],
                'street_address' => $data['street_address'] ?? null,
            ]);
        }

        User::create($payload);

        return back()->with('success', ucfirst($role).' account created successfully.');
    }

    private function updateByRole(Request $request, User $user, string $role): RedirectResponse
    {
        if ($user->role !== $role) {
            abort(404);
        }

        $rules = [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
        ];

        if ($role === 'member') {
            $rules = array_merge($rules, [
                'contact_number' => ['nullable', 'string', 'max:30'],
                'region_name' => ['nullable', 'string', 'max:255'],
                'province_name' => ['nullable', 'string', 'max:255'],
                'city_municipality_name' => ['nullable', 'string', 'max:255'],
                'barangay_name' => ['nullable', 'string', 'max:255'],
                'street_address' => ['nullable', 'string', 'max:255'],
            ]);
        }

        $data = $request->validate($rules);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
        ];

        if ($role === 'member') {
            $payload = array_merge($payload, [
                'contact_number' => $data['contact_number'] ?? null,
                'region_name' => $data['region_name'] ?? null,
                'province_name' => $data['province_name'] ?? null,
                'city_municipality_name' => $data['city_municipality_name'] ?? null,
                'barangay_name' => $data['barangay_name'] ?? null,
                'street_address' => $data['street_address'] ?? null,
            ]);
        }

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);

        return back()->with('success', ucfirst($role).' account updated successfully.');
    }

    private function destroyByRole(User $user, string $role): RedirectResponse
    {
        if ($user->role !== $role) {
            abort(404);
        }

        $user->delete();

        return back()->with('success', ucfirst($role).' account deleted successfully.');
    }
}
