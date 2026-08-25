<?php

namespace App\Http\Controllers;

use App\Models\MasterDiagnosis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterDiagnosisController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('master_diagnosis');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $diagnoses = $query->orderBy('name', 'asc')->get();

        return response()->json($diagnoses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:191|unique:master_diagnosis,name',
            'is_active' => 'boolean',
        ]);

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_diagnosis')->insert($data);

        $diagnosis = DB::table('master_diagnosis')->where('id', $id)->first();

        return response()->json($diagnosis, 201);
    }

    public function show($id)
    {
        $diagnosis = DB::table('master_diagnosis')->where('id', $id)->first();

        if (!$diagnosis) {
            return response()->json(['message' => 'Diagnosis record not found'], 404);
        }

        return response()->json($diagnosis);
    }

    public function update(Request $request, $id)
    {
        $diagnosis = DB::table('master_diagnosis')->where('id', $id)->first();

        if (!$diagnosis) {
            return response()->json(['message' => 'Diagnosis record not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:191|unique:master_diagnosis,name,' . $id . ',id',
            'is_active' => 'boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_diagnosis')->where('id', $id)->update($data);

        $updatedDiagnosis = DB::table('master_diagnosis')->where('id', $id)->first();

        return response()->json($updatedDiagnosis);
    }

    public function destroy($id)
    {
        $deleted = DB::table('master_diagnosis')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Diagnosis record not found'], 404);
        }

        return response()->json(['message' => 'Diagnosis deleted successfully']);
    }
}
