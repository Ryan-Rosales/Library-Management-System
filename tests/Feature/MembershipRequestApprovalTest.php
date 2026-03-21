<?php

namespace Tests\Feature;

use App\Models\MembershipRequest;
use App\Models\User;
use App\Services\TransactionalMailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class MembershipRequestApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_account_is_created_when_welcome_email_is_sent(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
        ]);

        $membershipRequest = $this->createPendingMembershipRequest('member.one@example.com');

        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendMemberWelcomeCredentials')
            ->once()
            ->with($membershipRequest->email, $membershipRequest->name, 'TempPass123!');
        $this->app->instance(TransactionalMailService::class, $mailService);

        $response = $this->actingAs($staff)->post(route('membership-requests.approve', $membershipRequest), [
            'member_password' => 'TempPass123!',
            'review_notes' => 'Approved by staff.',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'email' => $membershipRequest->email,
            'role' => 'member',
        ]);

        $this->assertDatabaseHas('membership_requests', [
            'id' => $membershipRequest->id,
            'status' => 'reviewed',
            'review_outcome' => 'approved',
            'email_delivery_status' => 'sent',
            'email_delivery_message' => null,
        ]);
    }

    public function test_account_is_not_created_when_welcome_email_fails(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
        ]);

        $membershipRequest = $this->createPendingMembershipRequest('member.two@example.com');

        $mailService = Mockery::mock(TransactionalMailService::class);
        $mailService->shouldReceive('sendMemberWelcomeCredentials')
            ->once()
            ->andThrow(new RuntimeException('Email delivery service error'));
        $this->app->instance(TransactionalMailService::class, $mailService);

        $response = $this->actingAs($staff)->post(route('membership-requests.approve', $membershipRequest), [
            'member_password' => 'TempPass123!',
            'review_notes' => 'Approved by staff.',
        ]);

        $response->assertSessionHasErrors('review_notes');

        $this->assertDatabaseMissing('users', [
            'email' => $membershipRequest->email,
        ]);

        $this->assertDatabaseHas('membership_requests', [
            'id' => $membershipRequest->id,
            'status' => 'pending',
            'review_outcome' => null,
            'email_delivery_status' => 'failed',
            'email_delivery_message' => 'Email delivery service error',
        ]);
    }

    private function createPendingMembershipRequest(string $email): MembershipRequest
    {
        return MembershipRequest::query()->create([
            'name' => 'Pending Member',
            'email' => $email,
            'contact_number' => '09171234567',
            'region_code' => '130000000',
            'region_name' => 'National Capital Region',
            'province_code' => null,
            'province_name' => null,
            'city_municipality_code' => '137404000',
            'city_municipality_name' => 'Quezon City',
            'barangay_code' => '137404001',
            'barangay_name' => 'Bagong Silangan',
            'street_address' => 'Sample Street',
            'status' => 'pending',
        ]);
    }
}
