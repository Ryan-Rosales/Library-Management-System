<?php

namespace Tests\Feature;

use App\Models\MemberNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityNotificationRoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_activity_notification_redirects_to_members_when_url_points_to_admin_staff_module(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $notification = MemberNotification::create([
            'user_id' => $staff->id,
            'type' => 'role_activity',
            'title' => 'People update',
            'message' => 'Admin added a staff account.',
            'url' => route('staff'),
            'meta' => [
                'module' => 'people',
                'action' => 'added',
                'actor_role' => 'admin',
            ],
        ]);

        $response = $this->actingAs($staff)->post(route('activity.notifications.read', $notification));

        $response->assertRedirect(route('members'));

        $this->assertNotNull($notification->fresh()->seen_at);
    }
}
