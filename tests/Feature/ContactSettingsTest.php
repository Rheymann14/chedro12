<?php

use App\Models\InstitutionContact;
use App\Models\User;

test('contact us page shows default contact settings when database is empty', function () {
    $response = $this->get('/contactUs');

    $response->assertOk();
    $response->assertSee('chedro12@ched.gov.ph');
    $response->assertSee('Regional Center, Brgy. Carpenter Hill, Koronadal, Philippines');
    $response->assertSee('Rody P. Garcia, MDM, JD, EdD');
    expect(InstitutionContact::count())->toBe(0);
});

test('admin can update contact settings', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $payload = [
        'official_email' => 'contact@example.org',
        'facebook_page' => 'https://facebook.com/chedregion12',
        'office_address' => 'New Office Address, Koronadal City',
        'director_name' => 'Jane Q. Director',
        'director_position' => 'Officer-in-Charge',
        'director_office' => 'CHED Region 12 Office',
        'director_address' => 'Director Office Address, Koronadal City',
    ];

    $response = $this->actingAs($admin)->put('/admin/contact-settings', $payload);

    $response->assertRedirect('/admin/contact-settings');
    $this->assertDatabaseHas('institution_contacts', $payload);

    $publicResponse = $this->get('/contactUs');
    $publicResponse->assertOk();
    $publicResponse->assertSee('contact@example.org');
    $publicResponse->assertSee('Jane Q. Director');
    $publicResponse->assertSee('CHED Region 12 Office');
});

test('non admin user cannot update contact settings', function () {
    $user = User::factory()->create([
        'role' => 'user',
    ]);

    $response = $this->actingAs($user)->put('/admin/contact-settings', [
        'official_email' => 'user@example.org',
        'facebook_page' => 'N/A',
        'office_address' => 'Address',
        'director_name' => 'Name',
        'director_position' => 'Position',
        'director_office' => 'Office',
        'director_address' => 'Address',
    ]);

    $response->assertForbidden();
    expect(InstitutionContact::count())->toBe(0);
});
