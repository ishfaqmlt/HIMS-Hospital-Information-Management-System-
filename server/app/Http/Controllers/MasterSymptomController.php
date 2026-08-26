<?php

namespace App\Http\Controllers;

use App\Models\MasterSymptom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterSymptomController extends Controller
{
    /**
     * Display a listing of the symptoms.
     */
    public function index(Request $request)
    {
        $query = DB::table('master_symptoms');

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

        $symptoms = $query->orderBy('name', 'asc')->get();

        return response()->json($symptoms);
    }

    /**
     * Store a newly created symptom in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50|unique:master_symptoms,code',
            'name' => 'required|string|max:191',
            'is_active' => 'nullable|boolean',
        ]);

        $trimmedName = trim($validated['name']);

        // Check if symptom with same name already exists
        $existing = DB::table('master_symptoms')
            ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $code = !empty($validated['code'])
            ? strtoupper($validated['code'])
            : 'SYM-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $trimmedName), 0, 6)) . '-' . rand(100, 999);

        // Ensure unique code
        while (DB::table('master_symptoms')->where('code', $code)->exists()) {
            $code = 'SYM-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $trimmedName), 0, 6)) . '-' . rand(1000, 9999);
        }

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'code' => $code,
            'name' => $trimmedName,
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_symptoms')->insert($data);

        $symptom = DB::table('master_symptoms')->where('id', $id)->first();

        return response()->json($symptom, 201);
    }

    /**
     * Display the specified symptom.
     */
    public function show($id)
    {
        $symptom = DB::table('master_symptoms')->where('id', $id)->first();

        if (!$symptom) {
            return response()->json(['message' => 'Symptom not found'], 404);
        }

        return response()->json($symptom);
    }

    /**
     * Update the specified symptom in storage.
     */
    public function update(Request $request, $id)
    {
        $symptom = DB::table('master_symptoms')->where('id', $id)->first();

        if (!$symptom) {
            return response()->json(['message' => 'Symptom not found'], 404);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:master_symptoms,code,' . $id . ',id',
            'name' => 'required|string|max:191',
            'is_active' => 'boolean',
        ]);

        $data = [
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_symptoms')->where('id', $id)->update($data);

        $updatedSymptom = DB::table('master_symptoms')->where('id', $id)->first();

        return response()->json($updatedSymptom);
    }

    /**
     * Remove the specified symptom from storage.
     */
    public function destroy($id)
    {
        $deleted = DB::table('master_symptoms')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Symptom not found'], 404);
        }

        return response()->json(['message' => 'Symptom deleted successfully']);
    }
}
