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
    $response->assertJsonPath('items.2.href', 'https://curriculum-verification.chedro12.com/');
    $response->assertJsonPath('items.3.href', 'https://cwc.chedro12.com/');

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

    $appHost = parse_url(config('app.url'), PHP_URL_HOST) ?: 'localhost';

    Storage::disk('local')->put('data/appheadMenu.json', json_encode([
        'items' => [
            [
                'id' => '1',
                'title' => 'Online Services',
                'href' => "http://{$appHost}/onlineServices",
                'order' => 0,
            ],
            [
                'id' => '2',
                'title' => 'Resources',
                'href' => "https://{$appHost}/public/resources",
                'order' => 1,
            ],
        ],
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $response = $this->get('/api/app-header-menu');

    $response->assertOk();

    $items = collect($response->json('items'))->keyBy('title');

    expect($items->get('Online Services')['href'] ?? null)->toBe('/onlineServices')
        ->and($items->get('Resources')['href'] ?? null)->toBe('/resources');
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

test('menu items api preserves external absolute urls even when their path matches a local route', function () {
    Storage::fake('local');

    Storage::disk('local')->put('data/menu-hemis.json', json_encode([
        'items' => [
            [
                'id' => '1',
                'title' => 'Check with CHED',
                'href' => 'https://cwc.chedro12.com/',
                'description' => 'Check your records',
            ],
        ],
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $response = $this->get('/api/menu-items/hemis');

    $response->assertOk();
    $response->assertJsonPath('items.0.href', 'https://cwc.chedro12.com/');
});

test('menu items api repairs previously broken external hemis defaults stored as root links', function () {
    Storage::fake('local');

    Storage::disk('local')->put('data/menu-hemis.json', json_encode([
        'items' => [
            [
                'id' => '1',
                'title' => 'Statistics',
                'href' => '/statistics',
                'description' => 'Access higher education statistics, reports, and data insights.',
            ],
            [
                'id' => '2',
                'title' => 'Recognized Programs',
                'href' => '/recognizedprograms',
                'description' => 'View officially recognized programs offered by institutions.',
            ],
            [
                'id' => '3',
                'title' => 'Curriculum Verification',
                'href' => '/',
                'description' => 'Easily verify your curriculum with CHED to ensure it meets official standards.',
            ],
            [
                'id' => '4',
                'title' => 'Check with CHED',
                'href' => '/',
                'description' => 'Check your records',
            ],
        ],
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    $response = $this->get('/api/menu-items/hemis');

    $response->assertOk();
    $response->assertJsonPath('items.2.href', 'https://curriculum-verification.chedro12.com/');
    $response->assertJsonPath('items.3.href', 'https://cwc.chedro12.com/');
});
