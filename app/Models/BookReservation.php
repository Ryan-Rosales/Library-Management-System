<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookReservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'book_id',
        'member_id',
        'status',
        'queue_position',
        'queued_at',
        'fulfilled_at',
        'claim_at',
        'member_due_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'queued_at' => 'datetime',
            'fulfilled_at' => 'datetime',
            'claim_at' => 'datetime',
            'member_due_at' => 'date',
            'cancelled_at' => 'datetime',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
