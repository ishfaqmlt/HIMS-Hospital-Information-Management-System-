<?php

namespace App\Http\Controllers;

use App\Models\MasterAllergy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterAllergyController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('master_allergies');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $allergies = $query->orderBy('name', 'asc')->get();

        return response()->json($allergies);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:master_allergies,code',
            'name' => 'required|string|max:191',
            'is_active' => 'boolean',
        ]);

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_allergies')->insert($data);

        $allergy = DB::table('master_allergies')->where('id', $id)->first();

        return response()->json($allergy, 201);
    }

    public function show($id)
    {
        $allergy = DB::table('master_allergies')->where('id', $id)->first();

        if (!$allergy) {
            return response()->json(['message' => 'Allergy not found'], 404);
        }

        return response()->json($allergy);
    }

    public function update(Request $request, $id)
    {
        $allergy = DB::table('master_allergies')->where('id', $id)->first();

        if (!$allergy) {
            return response()->json(['message' => 'Allergy not found'], 404);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:master_allergies,code,' . $id . ',id',
            'name' => 'required|string|max:191',
            'is_active' => 'boolean',
        ]);

        $data = [
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_allergies')->where('id', $id)->update($data);

        $updatedAllergy = DB::table('master_allergies')->where('id', $id)->first();

        return response()->json($updatedAllergy);
    }

    public function destroy($id)
    {
        $deleted = DB::table('master_allergies')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Allergy not found'], 404);
        }

        return response()->json(['message' => 'Allergy deleted successfully']);
    }
}
