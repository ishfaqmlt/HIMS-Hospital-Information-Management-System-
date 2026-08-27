<?php

namespace App\Http\Controllers;

use App\Models\PharmacyCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PharmacyCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('pharmacy_categories');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $categories = $query->orderBy('name', 'asc')->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50|unique:pharmacy_categories,code',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['name']);

        $existing = DB::table('pharmacy_categories')
            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $code = !empty($validated['code'])
            ? strtoupper(trim($validated['code']))
            : 'CAT-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $trimmedName), 0, 4)) . '-' . rand(100, 999);

        $isActive = isset($validated['is_active']) ? (bool)$validated['is_active'] : true;

        DB::table('pharmacy_categories')->insert([
            'id' => $id,
            'name' => $trimmedName,
            'code' => $code,
            'description' => $validated['description'] ?? null,
            'is_active' => $isActive,
        ]);

        $created = DB::table('pharmacy_categories')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy category created successfully',
            'data' => $created,
        ], 201);
    }

    public function show(string $id)
    {
        $category = DB::table('pharmacy_categories')->where('id', $id)->first();

        if (!$category) {
            return response()->json(['message' => 'Pharmacy category not found'], 404);
        }

        return response()->json($category);
    }

    public function update(Request $request, string $id)
    {
        $category = DB::table('pharmacy_categories')->where('id', $id)->first();

        if (!$category) {
            return response()->json(['message' => 'Pharmacy category not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'code' => 'nullable|string|max:50|unique:pharmacy_categories,code,' . $id,
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['name']);

        $duplicate = DB::table('pharmacy_categories')
            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
            ->where('id', '!=', $id)
            ->first();

        if ($duplicate) {
            return response()->json(['message' => 'Pharmacy category with this name already exists'], 422);
        }

        $updateData = [
            'name' => $trimmedName,
            'code' => !empty($validated['code']) ? strtoupper(trim($validated['code'])) : $category->code,
            'description' => $validated['description'] ?? null,
        ];

        if (isset($validated['is_active'])) {
            $updateData['is_active'] = (bool)$validated['is_active'];
        }

        DB::table('pharmacy_categories')->where('id', $id)->update($updateData);

        $updated = DB::table('pharmacy_categories')->where('id', $id)->first();

        return response()->json([
            'message' => 'Pharmacy category updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(string $id)
    {
        $category = DB::table('pharmacy_categories')->where('id', $id)->first();

        if (!$category) {
            return response()->json(['message' => 'Pharmacy category not found'], 404);
        }

        DB::table('pharmacy_categories')->where('id', $id)->delete();

        return response()->json(['message' => 'Pharmacy category deleted successfully']);
    }
}
