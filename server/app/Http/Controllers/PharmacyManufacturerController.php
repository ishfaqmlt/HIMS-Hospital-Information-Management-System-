<?php

namespace App\Http\Controllers;

use App\Models\PharmacyManufacturer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyManufacturerController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('pharmacy_manufacturers');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $manufacturers = $query->orderBy('name', 'asc')->get();

        return response()->json($manufacturers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'contact_number' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'country' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['name']);

        $existing = DB::table('pharmacy_manufacturers')
            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $isActive = isset($validated['is_active']) ? (bool)$validated['is_active'] : true;

        DB::table('pharmacy_manufacturers')->insert([
            'id' => $id,
            'name' => $trimmedName,
            'contact_number' => $validated['contact_number'] ?? null,
            'email' => $validated['email'] ?? null,
            'country' => $validated['country'] ?? 'Pakistan',
            'is_active' => $isActive,
        ]);

        $created = DB::table('pharmacy_manufacturers')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy manufacturer created successfully',
            'data' => $created,
        ], 201);
    }

    public function show(string $id)
    {
        $mfg = DB::table('pharmacy_manufacturers')->where('id', $id)->first();

        if (!$mfg) {
            return response()->json(['message' => 'Pharmacy manufacturer not found'], 404);
        }

        return response()->json($mfg);
    }

    public function update(Request $request, string $id)
    {
        $mfg = DB::table('pharmacy_manufacturers')->where('id', $id)->first();

        if (!$mfg) {
            return response()->json(['message' => 'Pharmacy manufacturer not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'contact_number' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'country' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['name']);

        $duplicate = DB::table('pharmacy_manufacturers')
            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
            ->where('id', '!=', $id)
            ->first();

        if ($duplicate) {
            return response()->json(['message' => 'Pharmacy manufacturer with this name already exists'], 422);
        }

        $updateData = [
            'name' => $trimmedName,
            'contact_number' => $validated['contact_number'] ?? null,
            'email' => $validated['email'] ?? null,
            'country' => $validated['country'] ?? 'Pakistan',
        ];

        if (isset($validated['is_active'])) {
            $updateData['is_active'] = (bool)$validated['is_active'];
        }

        DB::table('pharmacy_manufacturers')->where('id', $id)->update($updateData);

        $updated = DB::table('pharmacy_manufacturers')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy manufacturer updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(string $id)
    {
        $mfg = DB::table('pharmacy_manufacturers')->where('id', $id)->first();

        if (!$mfg) {
            return response()->json(['message' => 'Pharmacy manufacturer not found'], 404);
        }

        DB::table('pharmacy_manufacturers')->where('id', $id)->delete();

        return response()->json(['message' => 'Pharmacy manufacturer deleted successfully']);
    }
}
