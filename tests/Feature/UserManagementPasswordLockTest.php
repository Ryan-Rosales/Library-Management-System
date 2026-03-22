<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementPasswordLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_change_member_password_from_manage_users_update(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create([
            'role' => 'member',
            'password' => Hash::make('OldPass123!'),
        ]);

        $response = $this->actingAs($admin)->put(route('members.update', $member), [
            'name' => $member->name,
            'email' => $member->email,
            'password' => 'NewPass123!',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertTrue(Hash::check('OldPass123!', $member->fresh()->password));
    }

    public function test_admin_cannot_change_staff_password_from_manage_users_update(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create([
            'role' => 'staff',
            'password' => Hash::make('OldPass123!'),
        ]);

        $response = $this->actingAs($admin)->put(route('staff.update', $staff), [
            'name' => $staff->name,
            'email' => $staff->email,
            'password' => 'NewPass123!',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertTrue(Hash::check('OldPass123!', $staff->fresh()->password));
    }

    public function test_staff_cannot_change_member_password_from_manage_users_update(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $member = User::factory()->create([
            'role' => 'member',
            'password' => Hash::make('OldPass123!'),
        ]);

        $response = $this->actingAs($staff)->put(route('members.update', $member), [
            'name' => $member->name,
            'email' => $member->email,
            'password' => 'NewPass123!',
        ]);

        $response->assertSessionHasErrors('password');
        $this->assertTrue(Hash::check('OldPass123!', $member->fresh()->password));
    }
}
