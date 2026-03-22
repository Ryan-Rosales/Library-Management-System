<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TransactionalMailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class UserManagementMemberCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_member_with_auto_generated_password_and_email_notice(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendMemberWelcomeCredentials')
            ->once()
            ->withArgs(function (string $email, string $name, string $password): bool {
                return $email === 'newmember@example.com'
                    && $name === 'New Member'
                    && strlen($password) >= 8;
            });

        $this->app->instance(TransactionalMailService::class, $mailService);

        $response = $this->actingAs($admin)->post(route('members.store'), [
            'name' => 'New Member',
            'email' => 'newmember@example.com',
            'contact_number' => '09171234567',
            'region_name' => 'Region X',
            'province_name' => 'Province Y',
            'city_municipality_name' => 'City Z',
            'barangay_name' => 'Barangay A',
            'street_address' => 'Street 1',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'email' => 'newmember@example.com',
            'role' => 'member',
            'must_change_password' => true,
        ]);
    }

    public function test_member_account_is_created_even_when_welcome_email_fails(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendMemberWelcomeCredentials')
            ->once()
            ->andThrow(new RuntimeException('SMTP failed'));

        $this->app->instance(TransactionalMailService::class, $mailService);

        $response = $this->actingAs($admin)->post(route('members.store'), [
            'name' => 'Failed Member',
            'email' => 'failedmember@example.com',
            'contact_number' => '09171234567',
            'region_name' => 'Region X',
            'province_name' => 'Province Y',
            'city_municipality_name' => 'City Z',
            'barangay_name' => 'Barangay A',
            'street_address' => 'Street 1',
        ]);

        $response->assertSessionHas('warning');

        $this->assertDatabaseHas('users', [
            'email' => 'failedmember@example.com',
            'role' => 'member',
        ]);
    }
}
