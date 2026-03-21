<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PasswordChangeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_user_id',
        'requester_name',
        'requester_email',
        'requester_role',
        'target_role',
        'reason',
        'status',
        'verified_by_user_id',
        'verified_at',
        'processed_by_user_id',
        'review_action',
        'seen_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'seen_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }
}
