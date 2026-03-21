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
        'seen_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'seen_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }
}
