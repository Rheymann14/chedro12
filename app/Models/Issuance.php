<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Issuance extends Model
{
    use HasFactory;

    protected $fillable = [
        'issuance_type',
        'view_type',
    ];

    protected $casts = [
        'view_type' => 'string',
    ];

    public function years(): HasMany
    {
        return $this->hasMany(IssuanceYear::class);
    }

    public function documents(): HasManyThrough
    {
        return $this->hasManyThrough(IssuanceDocument::class, IssuanceYear::class);
    }
}


