<?php

namespace App\Http\Controllers;

use App\Models\PharmacyDosageForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyDosageFormController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('pharmacy_dosage_forms');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $forms = $query->orderBy('name', 'asc')->get();

        return response()->json($forms);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['name']);

        $existing = DB::table('pharmacy_dosage_forms')
            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $isActive = isset($validated['is_active']) ? (bool)$validated['is_active'] : true;

        DB::table('pharmacy_dosage_forms')->insert([
            'id' => $id,
            'name' => $trimmedName,
            'is_active' => $isActive,
        ]);

        $created = DB::table('pharmacy_dosage_forms')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy dosage form created successfully',
            'data' => $created,
        ], 201);
    }

    public function show(string $id)
    {
        $form = DB::table('pharmacy_dosage_forms')->where('id', $id)->first();

        if (!$form) {
            return response()->json(['message' => 'Pharmacy dosage form not found'], 404);
        }

        return response()->json($form);
    }

    public function update(Request $request, string $id)
    {
        $form = DB::table('pharmacy_dosage_forms')->where('id', $id)->first();

        if (!$form) {
            return response()->json(['message' => 'Pharmacy dosage form not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['name']);

        $duplicate = DB::table('pharmacy_dosage_forms')
            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
            ->where('id', '!=', $id)
            ->first();

        if ($duplicate) {
            return response()->json(['message' => 'Pharmacy dosage form with this name already exists'], 422);
        }

        $updateData = [
            'name' => $trimmedName,
        ];

        if (isset($validated['is_active'])) {
            $updateData['is_active'] = (bool)$validated['is_active'];
        }

        DB::table('pharmacy_dosage_forms')->where('id', $id)->update($updateData);

        $updated = DB::table('pharmacy_dosage_forms')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy dosage form updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(string $id)
    {
        $form = DB::table('pharmacy_dosage_forms')->where('id', $id)->first();

        if (!$form) {
            return response()->json(['message' => 'Pharmacy dosage form not found'], 404);
        }

        DB::table('pharmacy_dosage_forms')->where('id', $id)->delete();

        return response()->json(['message' => 'Pharmacy dosage form deleted successfully']);
    }
}
