<?php

namespace App\Http\Controllers;

use App\Models\MasterPhysicalExam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterPhysicalExamController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('master_physical_exam');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->has('is_active') && $request->is_active !== null) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $exams = $query->orderBy('name', 'asc')->get();

        return response()->json($exams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:191|unique:master_physical_exam,name',
            'is_active' => 'boolean',
        ]);

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_physical_exam')->insert($data);

        $exam = DB::table('master_physical_exam')->where('id', $id)->first();

        return response()->json($exam, 201);
    }

    public function show($id)
    {
        $exam = DB::table('master_physical_exam')->where('id', $id)->first();

        if (!$exam) {
            return response()->json(['message' => 'Physical Exam record not found'], 404);
        }

        return response()->json($exam);
    }

    public function update(Request $request, $id)
    {
        $exam = DB::table('master_physical_exam')->where('id', $id)->first();

        if (!$exam) {
            return response()->json(['message' => 'Physical Exam record not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:191|unique:master_physical_exam,name,' . $id . ',id',
            'is_active' => 'boolean',
        ]);

        $data = [
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        DB::table('master_physical_exam')->where('id', $id)->update($data);

        $updatedExam = DB::table('master_physical_exam')->where('id', $id)->first();

        return response()->json($updatedExam);
    }

    public function destroy($id)
    {
        $deleted = DB::table('master_physical_exam')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Physical Exam record not found'], 404);
        }

        return response()->json(['message' => 'Physical Exam deleted successfully']);
    }
}
