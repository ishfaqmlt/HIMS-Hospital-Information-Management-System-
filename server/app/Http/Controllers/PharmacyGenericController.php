<?php

namespace App\Http\Controllers;

use App\Models\PharmacyGeneric;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyGenericController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('pharmacy_generics');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('generic_name', 'like', "%{$search}%")
                  ->orWhere('therapeutic_class', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $generics = $query->orderBy('generic_name', 'asc')->get();

        return response()->json($generics);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'therapeutic_class' => 'nullable|string|max:150',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['generic_name']);

        $existing = DB::table('pharmacy_generics')
            ->whereRaw('LOWER(generic_name) = ?', [strtolower($trimmedName)])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $isActive = isset($validated['is_active']) ? (bool)$validated['is_active'] : true;

        DB::table('pharmacy_generics')->insert([
            'id' => $id,
            'generic_name' => $trimmedName,
            'therapeutic_class' => $validated['therapeutic_class'] ?? null,
            'is_active' => $isActive,
        ]);

        $created = DB::table('pharmacy_generics')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy generic created successfully',
            'data' => $created,
        ], 201);
    }

    public function show(string $id)
    {
        $generic = DB::table('pharmacy_generics')->where('id', $id)->first();

        if (!$generic) {
            return response()->json(['message' => 'Pharmacy generic not found'], 404);
        }

        return response()->json($generic);
    }

    public function update(Request $request, string $id)
    {
        $generic = DB::table('pharmacy_generics')->where('id', $id)->first();

        if (!$generic) {
            return response()->json(['message' => 'Pharmacy generic not found'], 404);
        }

        $validated = $request->validate([
            'generic_name' => 'required|string|max:255',
            'therapeutic_class' => 'nullable|string|max:150',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['generic_name']);

        $duplicate = DB::table('pharmacy_generics')
            ->whereRaw('LOWER(generic_name) = ?', [strtolower($trimmedName)])
            ->where('id', '!=', $id)
            ->first();

        if ($duplicate) {
            return response()->json(['message' => 'Pharmacy generic with this name already exists'], 422);
        }

        $updateData = [
            'generic_name' => $trimmedName,
            'therapeutic_class' => $validated['therapeutic_class'] ?? null,
        ];

        if (isset($validated['is_active'])) {
            $updateData['is_active'] = (bool)$validated['is_active'];
        }

        DB::table('pharmacy_generics')->where('id', $id)->update($updateData);

        $updated = DB::table('pharmacy_generics')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy generic updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(string $id)
    {
        $generic = DB::table('pharmacy_generics')->where('id', $id)->first();

        if (!$generic) {
            return response()->json(['message' => 'Pharmacy generic not found'], 404);
        }

        DB::table('pharmacy_generics')->where('id', $id)->delete();

        return response()->json(['message' => 'Pharmacy generic deleted successfully']);
    }
}
