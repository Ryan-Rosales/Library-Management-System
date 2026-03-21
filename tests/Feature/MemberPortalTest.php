<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookCopy;
use App\Models\BookReservation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberPortalTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_reserve_unavailable_book(): void
    {
        $member = User::factory()->create(['role' => 'member']);

        $book = Book::query()->create([
            'title' => 'Distributed Systems',
            'isbn' => '9780001112223',
            'author' => 'A. Tanenbaum',
            'category' => 'Computing',
            'genre' => 'Technology',
            'status' => 'available',
            'copies_total' => 1,
            'copies_available' => 0,
        ]);

        BookCopy::query()->create([
            'book_id' => $book->id,
            'accession_number' => 'ACC-1001',
            'status' => 'issued',
            'condition' => 'good',
            'borrower_id' => User::factory()->create(['role' => 'member'])->id,
            'borrowed_at' => now()->subDays(2),
            'due_at' => now()->addDays(5)->toDateString(),
        ]);

        $response = $this->actingAs($member)
            ->post(route('member.catalog.reserve', $book));

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('book_reservations', [
            'book_id' => $book->id,
            'member_id' => $member->id,
            'status' => 'queued',
            'queue_position' => 1,
        ]);
    }

    public function test_member_can_cancel_queued_reservation(): void
    {
        $member = User::factory()->create(['role' => 'member']);

        $book = Book::query()->create([
            'title' => 'Clean Architecture',
            'isbn' => '9780134494166',
            'author' => 'Robert C. Martin',
            'category' => 'Computing',
            'genre' => 'Software',
            'status' => 'available',
            'copies_total' => 1,
            'copies_available' => 0,
        ]);

        $reservation = BookReservation::query()->create([
            'book_id' => $book->id,
            'member_id' => $member->id,
            'status' => 'queued',
            'queue_position' => 1,
            'queued_at' => now()->subHour(),
        ]);

        $response = $this->actingAs($member)
            ->patch(route('member.reservations.cancel', $reservation));

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('book_reservations', [
            'id' => $reservation->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_member_cannot_access_staff_admin_modules(): void
    {
        $member = User::factory()->create(['role' => 'member']);

        $this->actingAs($member)->get('/books')->assertForbidden();
        $this->actingAs($member)->get('/reports')->assertForbidden();
        $this->actingAs($member)->get('/staff/dashboard')->assertForbidden();
    }
}
