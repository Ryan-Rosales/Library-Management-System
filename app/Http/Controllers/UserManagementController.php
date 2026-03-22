<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ActivityNotificationService;
use App\Services\TransactionalMailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class UserManagementController extends Controller
{
    public function __construct(
        private readonly TransactionalMailService $mailService,
    ) {
    }

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

    public function destroyMember(Request $request, User $user): RedirectResponse
    {
        return $this->destroyByRole($request, $user, 'member');
    }

    public function destroyStaff(Request $request, User $user): RedirectResponse
    {
        return $this->destroyByRole($request, $user, 'staff');
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
            'password' => ['nullable', 'string', 'min:8', 'max:64'],
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

        $normalizedEmail = strtolower((string) $data['email']);

        $emailExists = User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->exists();

        if ($emailExists) {
            return back()->withErrors([
                'email' => 'An account with this email already exists.',
            ]);
        }

        $providedPassword = trim((string) ($data['password'] ?? ''));
        $plainPassword = $providedPassword !== '' ? $providedPassword : Str::password(12);

        $payload = [
            'name' => $data['name'],
            'email' => $normalizedEmail,
            'role' => $role,
            'password' => Hash::make($plainPassword),
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
                'must_change_password' => true,
            ]);
        }

        if ($role === 'staff') {
            $payload['must_change_password'] = true;
        }

        $createdUser = User::create($payload);

        if ($role === 'member') {
            try {
                $this->mailService->sendMemberWelcomeCredentials(
                    $createdUser->email,
                    $createdUser->name,
                    $plainPassword,
                );
            } catch (Throwable $exception) {
                $createdUser->delete();

                return back()->withErrors([
                    'email' => 'Member account was not created because welcome email could not be sent: '.$exception->getMessage(),
                ]);
            }
        }

        if ($role === 'staff') {
            try {
                $this->mailService->sendStaffWelcomeCredentials(
                    $createdUser->email,
                    $createdUser->name,
                    $plainPassword,
                );
            } catch (Throwable $exception) {
                $createdUser->delete();

                return back()->withErrors([
                    'email' => 'Staff account was not created because welcome email could not be sent: '.$exception->getMessage(),
                ]);
            }
        }

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'people',
            'added',
            $role.' account "'.$createdUser->name.'"',
            route('members'),
        );

        $successMessage = $role === 'member'
            ? 'Member account created successfully. Login credentials were sent to member Gmail.'
            : 'Staff account created successfully. Login credentials were sent to staff Gmail.';

        return back()->with('success', $successMessage);
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

        if (filled($data['password'] ?? null)) {
            return back()->withErrors([
                'password' => 'Password cannot be updated from this page.',
            ]);
        }

        $normalizedEmail = strtolower((string) $data['email']);

        $emailExists = User::query()
            ->whereRaw('LOWER(email) = ?', [$normalizedEmail])
            ->where('id', '!=', $user->id)
            ->exists();

        if ($emailExists) {
            return back()->withErrors([
                'email' => 'An account with this email already exists.',
            ]);
        }

        $payload = [
            'name' => $data['name'],
            'email' => $normalizedEmail,
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

        $user->update($payload);

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'people',
            'updated',
            $role.' account "'.$user->name.'"',
            route('members'),
        );

        return back()->with('success', ucfirst($role).' account updated successfully.');
    }

    private function destroyByRole(Request $request, User $user, string $role): RedirectResponse
    {
        if ($user->role !== $role) {
            abort(404);
        }

        $deletedName = $user->name;
        $user->delete();

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'people',
            'deleted',
            $role.' account "'.$deletedName.'"',
            route('members'),
        );

        return back()->with('success', ucfirst($role).' account deleted successfully.');
    }
}
