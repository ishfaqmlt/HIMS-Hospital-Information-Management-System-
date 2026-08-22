<?php

namespace App\Http\Controllers;

use App\Models\HospitalProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HospitalProfileController extends Controller
{
    public function index()
    {
        $profile = HospitalProfile::first();
        if ($profile && $profile->logo) {
            $profile->logo_url = asset('storage/' . $profile->logo);
        }
        return response()->json($profile);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'hospital_name' => 'required|string|max:255',
            'logo' => $request->hasFile('logo') ? 'image|mimes:jpeg,png,jpg,gif,webp|max:2048' : 'nullable',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'registration_number' => 'nullable|string|max:100',
            'tax_number' => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:255',
            'contact_person_phone' => 'nullable|string|max:50',
            'footer_text' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('hospital', 'public');
        } else {
            unset($validated['logo']);
        }

        $profile = HospitalProfile::create($validated);
        if ($profile->logo) {
            $profile->logo_url = asset('storage/' . $profile->logo);
        }

        return response()->json($profile, 201);
    }

    public function update(Request $request)
    {
        $profile = HospitalProfile::first();

        if (!$profile) {
            $profile = new HospitalProfile();
        }

        $validated = $request->validate([
            'hospital_name' => 'sometimes|required|string|max:255',
            'logo' => $request->hasFile('logo') ? 'image|mimes:jpeg,png,jpg,gif,webp|max:2048' : 'nullable',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'registration_number' => 'nullable|string|max:100',
            'tax_number' => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:255',
            'contact_person_phone' => 'nullable|string|max:50',
            'footer_text' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
        ]);

        if ($request->hasFile('logo')) {
            if ($profile->logo) {
                Storage::disk('public')->delete($profile->logo);
            }
            $validated['logo'] = $request->file('logo')->store('hospital', 'public');
        } else {
            unset($validated['logo']);
        }

        $profile->fill($validated);
        $profile->save();
        if ($profile->logo) {
            $profile->logo_url = asset('storage/' . $profile->logo);
        }

        return response()->json($profile);
    }

    public function destroy()
    {
        $profile = HospitalProfile::first();

        if ($profile) {
            if ($profile->logo) {
                Storage::disk('public')->delete($profile->logo);
            }
            $profile->delete();
        }

        return response()->json(['message' => 'Hospital profile deleted']);
    }
}
