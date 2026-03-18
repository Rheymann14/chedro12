<?php

use Illuminate\Support\Facades\Storage;

test('about menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items/about');

    $response->assertOk();
    $response->assertJsonCount(4, 'items');
    $response->assertJsonPath('items.0.title', 'Historical Background');
    $response->assertJsonPath('items.0.href', '/historicalBackground');

    expect(Storage::disk('local')->exists('data/menu-about.json'))->toBeTrue();
});

test('online services menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items/online-services');

    $response->assertOk();
    $response->assertJsonCount(2, 'items');
    $response->assertJsonPath('items.0.title', 'CAV Application');
    $response->assertJsonPath('items.0.href', '/cavApplication');

    expect(Storage::disk('local')->exists('data/menu-online-services.json'))->toBeTrue();
});

test('hemis menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items/hemis');

    $response->assertOk();
    $response->assertJsonCount(4, 'items');
    $response->assertJsonPath('items.0.title', 'Statistics');
    $response->assertJsonPath('items.0.href', '/statistics');

    expect(Storage::disk('local')->exists('data/menu-hemis.json'))->toBeTrue();
});

test('resources menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items');

    $response->assertOk();
    $response->assertJsonCount(2, 'items');
    $response->assertJsonPath('items.0.title', 'Issuances');
    $response->assertJsonPath('items.1.href', '/regionalMemo');

    expect(Storage::disk('local')->exists('data/menu-items.json'))->toBeTrue();
});

test('app header menu normalizes absolute internal urls to root relative paths', function () {
    Storage::fake('local');

    Storage::disk('local')->put('data/appheadMenu.json', json_encode([
        'items' => [
            [
                'id' => '1',
                'title' => 'Online Services',
                'href' => 'http://206.189.32.111/onlineServices',
                'order' => 0,
            ],
            [
                'id' => '2',
                'title' => 'Resources',
                'href' => 'https://region12.ched.gov.ph/public/resources',
                'order' => 1,
            ],
        ],
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $response = $this->get('/api/app-header-menu');

    $response->assertOk();
    $response->assertJsonPath('items.0.href', '/onlineServices');
    $response->assertJsonPath('items.1.href', '/resources');
});

test('menu items api normalizes bare internal hrefs to root relative paths', function () {
    Storage::fake('local');

    Storage::disk('local')->put('data/menu-about.json', json_encode([
        'items' => [
            [
                'id' => '1',
                'title' => 'Historical Background',
                'href' => 'historicalBackground',
                'description' => 'History',
            ],
        ],
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $response = $this->get('/api/menu-items/about');

    $response->assertOk();
    $response->assertJsonPath('items.0.href', '/historicalBackground');
});
