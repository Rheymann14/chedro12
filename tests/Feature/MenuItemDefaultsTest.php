<?php

use Illuminate\Support\Facades\Storage;

test('about menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items/about');

    $response->assertOk();
    $response->assertJsonCount(4, 'items');
    $response->assertJsonPath('items.0.title', 'Historical Background');

    expect(Storage::disk('local')->exists('data/menu-about.json'))->toBeTrue();
});

test('online services menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items/online-services');

    $response->assertOk();
    $response->assertJsonCount(2, 'items');
    $response->assertJsonPath('items.0.title', 'CAV Application');

    expect(Storage::disk('local')->exists('data/menu-online-services.json'))->toBeTrue();
});

test('hemis menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items/hemis');

    $response->assertOk();
    $response->assertJsonCount(4, 'items');
    $response->assertJsonPath('items.0.title', 'Statistics');

    expect(Storage::disk('local')->exists('data/menu-hemis.json'))->toBeTrue();
});

test('resources menu seeds defaults on the local disk when missing', function () {
    Storage::fake('local');

    $response = $this->get('/api/menu-items');

    $response->assertOk();
    $response->assertJsonCount(2, 'items');
    $response->assertJsonPath('items.0.title', 'Issuances');

    expect(Storage::disk('local')->exists('data/menu-items.json'))->toBeTrue();
});
