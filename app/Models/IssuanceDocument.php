<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssuanceDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'issuance_year_id',
        'title',
        'path',
    ];

    public function issuanceYear(): BelongsTo
    {
        return $this->belongsTo(IssuanceYear::class);
    }

    public function issuance(): BelongsTo
    {
        return $this->belongsTo(Issuance::class, 'issuance_id', 'id');
    }
}


