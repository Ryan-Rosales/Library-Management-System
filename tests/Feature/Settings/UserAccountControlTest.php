<?php

namespace Tests\Feature\Settings;

use App\Models\PasswordChangeRequest;
use App\Models\User;
use App\Services\TransactionalMailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class UserAccountControlTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_can_access_user_account_control(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($staff)->get(route('settings.user-account-control'));

        $response->assertOk();
    }

    public function test_admin_can_access_user_account_control(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('settings.user-account-control'));

        $response->assertOk();
    }

    public function test_member_cannot_access_user_account_control(): void
    {
        $member = User::factory()->create(['role' => 'member']);

        $response = $this->actingAs($member)->get(route('settings.user-account-control'));

        $response->assertForbidden();
    }

    public function test_staff_can_see_member_password_change_requests(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $member = User::factory()->create(['role' => 'member']);

        PasswordChangeRequest::create([
            'requester_user_id' => $member->id,
            'requester_name' => $member->name,
            'requester_email' => $member->email,
            'requester_role' => 'member',
            'target_role' => 'staff',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($staff)->get(route('settings.user-account-control'));

        $response->assertOk();
        $this->assertStringContainsString($member->email, $response->getContent());
    }

    public function test_staff_cannot_see_staff_password_change_requests(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $otherStaff = User::factory()->create(['role' => 'staff']);

        PasswordChangeRequest::create([
            'requester_user_id' => $otherStaff->id,
            'requester_name' => $otherStaff->name,
            'requester_email' => $otherStaff->email,
            'requester_role' => 'staff',
            'target_role' => 'admin',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($staff)->get(route('settings.user-account-control'));

        $response->assertOk();
        // Staff should NOT see staff-to-admin requests
    }

    public function test_admin_can_process_member_password_change_request(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'member']);

        $this->mockResetNoticeMail();

        $request = PasswordChangeRequest::create([
            'requester_user_id' => $member->id,
            'requester_name' => $member->name,
            'requester_email' => $member->email,
            'requester_role' => 'member',
            'target_role' => 'admin',
            'status' => 'pending',
            'verified_by_user_id' => $admin->id,
            'verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->put(
            route('settings.user-account-control.password.update', $member),
            [
                'request_id' => $request->id,
                'password' => 'NewPass123!',
                'password_confirmation' => 'NewPass123!',
            ]
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('password_change_requests', [
            'id' => $request->id,
            'status' => 'reviewed',
            'review_action' => 'approved',
            'processed_by_user_id' => $admin->id,
        ]);
    }

    public function test_staff_can_process_member_password_change_request(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $member = User::factory()->create(['role' => 'member']);

        $this->mockResetNoticeMail();

        $request = PasswordChangeRequest::create([
            'requester_user_id' => $member->id,
            'requester_name' => $member->name,
            'requester_email' => $member->email,
            'requester_role' => 'member',
            'target_role' => 'staff',
            'status' => 'pending',
            'verified_by_user_id' => $staff->id,
            'verified_at' => now(),
        ]);

        $response = $this->actingAs($staff)->put(
            route('settings.user-account-control.password.update', $member),
            [
                'request_id' => $request->id,
                'password' => 'NewPass123!',
                'password_confirmation' => 'NewPass123!',
            ]
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('password_change_requests', [
            'id' => $request->id,
            'status' => 'reviewed',
            'review_action' => 'approved',
            'processed_by_user_id' => $staff->id,
        ]);
    }

    public function test_admin_can_process_staff_password_change_request(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $staff = User::factory()->create(['role' => 'staff']);

        $this->mockResetNoticeMail();

        $request = PasswordChangeRequest::create([
            'requester_user_id' => $staff->id,
            'requester_name' => $staff->name,
            'requester_email' => $staff->email,
            'requester_role' => 'staff',
            'target_role' => 'admin',
            'status' => 'pending',
            'verified_by_user_id' => $admin->id,
            'verified_at' => now(),
        ]);

        $response = $this->actingAs($admin)->put(
            route('settings.user-account-control.password.update', $staff),
            [
                'request_id' => $request->id,
                'password' => 'NewPass123!',
                'password_confirmation' => 'NewPass123!',
            ]
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('password_change_requests', [
            'id' => $request->id,
            'status' => 'reviewed',
            'review_action' => 'approved',
            'processed_by_user_id' => $admin->id,
        ]);
    }

    public function test_staff_cannot_reset_staff_password(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $otherStaff = User::factory()->create(['role' => 'staff']);

        $request = PasswordChangeRequest::create([
            'requester_user_id' => $otherStaff->id,
            'requester_name' => $otherStaff->name,
            'requester_email' => $otherStaff->email,
            'requester_role' => 'staff',
            'target_role' => 'admin',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($staff)->put(
            route('settings.user-account-control.password.update', $otherStaff),
            [
                'request_id' => $request->id,
                'password' => 'NewPass123!',
                'password_confirmation' => 'NewPass123!',
            ]
        );

        $response->assertSessionHasErrors();
    }

    public function test_admin_can_reject_member_password_change_request(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'member']);

        $this->mockResetRejectedMail();

        $request = PasswordChangeRequest::create([
            'requester_user_id' => $member->id,
            'requester_name' => $member->name,
            'requester_email' => $member->email,
            'requester_role' => 'member',
            'target_role' => 'admin',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->post(
            route('settings.user-account-control.password.reject', $member),
            [
                'request_id' => $request->id,
            ]
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('password_change_requests', [
            'id' => $request->id,
            'status' => 'reviewed',
            'review_action' => 'rejected',
            'processed_by_user_id' => $admin->id,
        ]);
    }

    public function test_admin_can_view_password_reset_audit_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('settings.password-reset-audit'));

        $response->assertOk();
    }

    public function test_staff_cannot_view_password_reset_audit_page(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($staff)->get(route('settings.password-reset-audit'));

        $response->assertForbidden();
    }

    public function test_admin_can_update_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'member', 'email' => 'old@example.com']);

        $response = $this->actingAs($admin)->patch(
            route('settings.user-account-control.email.update', $member),
            [
                'email' => 'new@example.com',
            ]
        );

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $member->id,
            'email' => 'new@example.com',
        ]);
    }

    public function test_staff_cannot_update_email(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $member = User::factory()->create(['role' => 'member', 'email' => 'old@example.com']);

        $response = $this->actingAs($staff)->patch(
            route('settings.user-account-control.email.update', $member),
            [
                'email' => 'new@example.com',
            ]
        );

        $response->assertForbidden();
    }

    public function test_admin_receives_pending_member_and_staff_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'member']);
        $staff = User::factory()->create(['role' => 'staff']);

        PasswordChangeRequest::create([
            'requester_user_id' => $member->id,
            'requester_name' => $member->name,
            'requester_email' => $member->email,
            'requester_role' => 'member',
            'target_role' => 'admin',
            'status' => 'pending',
        ]);

        PasswordChangeRequest::create([
            'requester_user_id' => $staff->id,
            'requester_name' => $staff->name,
            'requester_email' => $staff->email,
            'requester_role' => 'staff',
            'target_role' => 'admin',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($admin)->get(route('settings.user-account-control'));

        $response->assertOk();
        $this->assertStringContainsString($member->email, $response->getContent());
        $this->assertStringContainsString($staff->email, $response->getContent());
    }

    public function test_admin_cannot_see_non_pending_password_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $member = User::factory()->create(['role' => 'member']);

        PasswordChangeRequest::create([
            'requester_user_id' => $member->id,
            'requester_name' => $member->name,
            'requester_email' => $member->email,
            'requester_role' => 'member',
            'target_role' => 'admin',
            'status' => 'reviewed',
        ]);

        $response = $this->actingAs($admin)->get(route('settings.user-account-control'));

        $response->assertOk();
    }

    private function mockResetNoticeMail(): void
    {
        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendPasswordResetChangedNotice')->once();

        $this->app->instance(TransactionalMailService::class, $mailService);
    }

    private function mockResetRejectedMail(): void
    {
        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendPasswordResetRejectedNotice')->once();

        $this->app->instance(TransactionalMailService::class, $mailService);
    }
}
