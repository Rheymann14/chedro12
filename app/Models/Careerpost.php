<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Careerpost extends Model
{
    protected $table = 'careerpost';
    public $timestamps = false;
    protected $fillable = [
        'headline',
        'description',
        'posted_date',
        'closing_date',
        'career',
        'Poster',
        'placeholder_images',
        'blurhash',
        'Video',
        'entry_type',
    ];

    protected $casts = [
        'Poster' => 'array',
        'placeholder_images' => 'array',
        'blurhash' => 'array',
    ];
    
    // Local scopes to separate postings vs career posts
    public function scopePostings($query)
    {
        return $query->where('entry_type', 'posting');
    }

    public function scopeCareerPosts($query)
    {
        return $query->where('entry_type', 'career_post');
    }

    public function scopeAwardsCommendations($query)
    {
        return $query->where('entry_type', 'awards_commendation');
    }

    /**
     * Scope to filter only published posts (posted_date <= today)
     * This ensures future-dated posts are not visible to the public
     */
    public function scopePublished($query)
    {
        return $query->whereDate('posted_date', '<=', now()->toDateString());
    }
    
}
