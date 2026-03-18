<?php

use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    Cache::flush();
});

it('increments page views on each track request and maintains a global total', function () {
    $this->postJson('/views/track', ['page' => 'career-post'])
        ->assertOk()
        ->assertJson([
            'page' => 'career-post',
            'count' => 1,
            'total' => 1,
        ]);

    $this->postJson('/views/track', ['page' => 'career-post'])
        ->assertOk()
        ->assertJson([
            'page' => 'career-post',
            'count' => 2,
            'total' => 2,
        ]);

    $this->postJson('/views/track', ['page' => 'postings'])
        ->assertOk()
        ->assertJson([
            'page' => 'postings',
            'count' => 1,
            'total' => 3,
        ]);
});

it('returns the per-page count when a page is provided', function () {
    $this->postJson('/views/track', ['page' => 'about']);
    $this->postJson('/views/track', ['page' => 'about']);

    $this->getJson('/views/count?page=about')
        ->assertOk()
        ->assertJson([
            'page' => 'about',
            'count' => 2,
        ]);
});

it('returns the aggregated total when no page is provided', function () {
    $this->postJson('/views/track', ['page' => 'about']);
    $this->postJson('/views/track', ['page' => 'career-post']);
    $this->postJson('/views/track', ['page' => 'career-post']);

    $this->getJson('/views/count')
        ->assertOk()
        ->assertJson([
            'page' => null,
            'count' => 3,
        ]);
});
