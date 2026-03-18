<?php

use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

it('includes awards and commendations in the default app header menu', function () {
    $response = $this->getJson('/api/app-header-menu');

    $response->assertOk();

    $items = $response->json('items');

    expect($items)->toBeArray()
        ->and(collect($items)->pluck('title')->contains('Awards & Commendations'))->toBeTrue()
        ->and(collect($items)->pluck('href')->contains('/awardsCommendation'))->toBeTrue();
});

it('backfills missing default header items into older stored menus', function () {
    Storage::disk('local')->put('data/appheadMenu.json', json_encode([
        'items' => [
            ['id' => '1', 'title' => 'Home', 'href' => '/', 'order' => 0],
            ['id' => '2', 'title' => 'About us', 'href' => '/about', 'order' => 1],
            ['id' => '3', 'title' => 'Online Services', 'href' => '/onlineServices', 'order' => 2],
            ['id' => '4', 'title' => 'HEMIS', 'href' => '/hemis', 'order' => 3],
            ['id' => '5', 'title' => 'Resources', 'href' => '/resources', 'order' => 4],
            ['id' => '6', 'title' => 'Postings', 'href' => '/postings', 'order' => 5],
            ['id' => '7', 'title' => 'Career Postings', 'href' => '/careerPost', 'order' => 6],
            ['id' => '8', 'title' => 'Contact us', 'href' => '/contactUs', 'order' => 7],
        ],
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $response = $this->getJson('/api/app-header-menu');

    $response->assertOk();

    $items = $response->json('items');
    $awardsItems = collect($items)->filter(fn ($item) => ($item['href'] ?? null) === '/awardsCommendation');

    expect($awardsItems)->toHaveCount(1)
        ->and($awardsItems->first()['title'])->toBe('Awards & Commendations');
});
