<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_members_are_redirected_to_member_dashboard()
    {
        $this->actingAs(User::factory()->create(['role' => 'member']));

        $this->get('/dashboard')->assertRedirect('/member/dashboard');
    }

    public function test_admins_can_visit_the_dashboard()
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']));

        $this->get('/dashboard')->assertOk();
    }
}
