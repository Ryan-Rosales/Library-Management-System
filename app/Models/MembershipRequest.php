<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MembershipRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'contact_number',
        'region_code',
        'region_name',
        'province_code',
        'province_name',
        'city_municipality_code',
        'city_municipality_name',
        'barangay_code',
        'barangay_name',
        'street_address',
        'status',
        'review_outcome',
        'review_notes',
        'reviewed_by_user_id',
        'email_delivery_status',
        'email_delivery_message',
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
}
