<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InstitutionContact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactSettingsController extends Controller
{
    public function edit()
    {
        return Inertia::render('admin/contact-settings', [
            'contactSettings' => InstitutionContact::current()->toContactSettings(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'official_email' => ['required', 'string', 'email', 'max:255'],
            'facebook_page' => ['required', 'string', 'max:255'],
            'office_address' => ['required', 'string', 'max:1000'],
            'director_name' => ['required', 'string', 'max:255'],
            'director_position' => ['required', 'string', 'max:255'],
            'director_office' => ['required', 'string', 'max:255'],
            'director_address' => ['required', 'string', 'max:1000'],
        ]);

        InstitutionContact::singleton()->update($validated);

        return to_route('admin.contact-settings');
    }
}
