<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TransactionalMailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class UserManagementStaffCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_staff_with_auto_generated_password_and_email_notice(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $recipientStaff = User::factory()->create(['role' => 'staff']);

        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendStaffWelcomeCredentials')
            ->once()
            ->withArgs(function (string $email, string $name, string $password): bool {
                return $email === 'newstaff@example.com'
                    && $name === 'New Staff'
                    && strlen($password) >= 8;
            });

        $this->app->instance(TransactionalMailService::class, $mailService);

        $response = $this->actingAs($admin)->post(route('staff.store'), [
            'name' => 'New Staff',
            'email' => 'newstaff@example.com',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'newstaff@example.com',
            'role' => 'staff',
            'must_change_password' => true,
        ]);

        $this->assertDatabaseHas('member_notifications', [
            'user_id' => $recipientStaff->id,
            'type' => 'role_activity',
            'url' => route('members'),
        ]);
    }

    public function test_staff_account_is_not_created_when_welcome_email_fails(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendStaffWelcomeCredentials')
            ->once()
            ->andThrow(new RuntimeException('SMTP failed'));

        $this->app->instance(TransactionalMailService::class, $mailService);

        $response = $this->actingAs($admin)->post(route('staff.store'), [
            'name' => 'Failed Staff',
            'email' => 'failedstaff@example.com',
        ]);

        $response->assertSessionHasErrors('email');

        $this->assertDatabaseMissing('users', [
            'email' => 'failedstaff@example.com',
        ]);
    }
}
