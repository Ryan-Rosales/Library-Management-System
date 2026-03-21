<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'contact_number' => '09171234567',
            'region_code' => '130000000',
            'region_name' => 'National Capital Region (NCR)',
            'province_code' => null,
            'province_name' => null,
            'city_municipality_code' => '137404000',
            'city_municipality_name' => 'Quezon City',
            'barangay_code' => '137404001',
            'barangay_name' => 'Bagong Silangan',
            'street_address' => 'Sample Street',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('login', absolute: false));
        $this->assertDatabaseHas('membership_requests', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'status' => 'pending',
        ]);
    }
}
