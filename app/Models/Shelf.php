<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Shelf extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'location_id',
        'location',
        'notes',
    ];

    public function locationRef(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'location_id');
    }
}
