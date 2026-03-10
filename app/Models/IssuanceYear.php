<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IssuanceYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'issuance_id',
        'year',
    ];

    protected $casts = [
        'year' => 'integer',
    ];

    public function issuance(): BelongsTo
    {
        return $this->belongsTo(Issuance::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(IssuanceDocument::class);
    }
}