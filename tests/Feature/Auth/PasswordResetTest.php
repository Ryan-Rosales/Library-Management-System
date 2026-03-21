<?php

namespace Tests\Feature\Auth;

use App\Models\PasswordChangeRequest;
use App\Models\User;
use App\Services\TransactionalMailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered()
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested()
    {
        $user = User::factory()->create([
            'role' => 'member',
        ]);

        $this->mockVerificationMail();

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
            'requester_role' => 'member',
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('password_change_requests', [
            'requester_user_id' => $user->id,
            'requester_email' => $user->email,
            'requester_role' => 'member',
            'target_role' => 'staff',
            'status' => 'pending',
        ]);
    }

    public function test_reset_password_screen_can_be_rendered()
    {
        $user = User::factory()->create();

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
            'requester_role' => 'staff',
        ]);

        $response->assertSessionHasErrors('reason');
        $this->assertDatabaseCount('password_change_requests', 0);
    }

    public function test_password_can_be_reset_with_valid_token()
    {
        $user = User::factory()->create([
            'role' => 'staff',
        ]);

        $this->mockVerificationMail();

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
            'requester_role' => 'staff',
            'reason' => 'Need admin assistance to update my password.',
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('password_change_requests', [
            'requester_user_id' => $user->id,
            'requester_role' => 'staff',
            'target_role' => 'admin',
            'status' => 'pending',
        ]);
    }

    public function test_duplicate_pending_request_is_not_created()
    {
        $user = User::factory()->create([
            'role' => 'member',
        ]);

        $this->mockVerificationMail();

        PasswordChangeRequest::query()->create([
            'requester_user_id' => $user->id,
            'requester_name' => $user->name,
            'requester_email' => $user->email,
            'requester_role' => 'member',
            'target_role' => 'staff',
            'status' => 'pending',
        ]);

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
            'requester_role' => 'member',
        ]);

        $response->assertSessionHas('status');
        $this->assertDatabaseCount('password_change_requests', 1);
    }

    private function mockVerificationMail(): void
    {
        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendPasswordResetVerificationLink')->once();

        $this->app->instance(TransactionalMailService::class, $mailService);
    }
}
