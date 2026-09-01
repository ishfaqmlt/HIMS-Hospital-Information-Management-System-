<?php

namespace App\Http\Controllers;

use App\Models\MasterInstruction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterInstructionController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('master_instructions');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('instruction', 'like', "%{$search}%");
        }

        if ($request->has('isActive') && $request->isActive !== null) {
            $query->where('isActive', filter_var($request->isActive, FILTER_VALIDATE_BOOLEAN));
        }

        $instructions = $query->orderBy('instruction', 'asc')->get();

        return response()->json($instructions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'instruction' => 'required|string|max:191',
            'isActive' => 'nullable|boolean',
        ]);

        $trimmed = trim($validated['instruction']);

        $existing = DB::table('master_instructions')
            ->whereRaw('LOWER(instruction) = ?', [mb_strtolower($trimmed, 'UTF-8')])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'instruction' => $trimmed,
            'isSynced' => false,
            'isActive' => $validated['isActive'] ?? true,
        ];

        DB::table('master_instructions')->insert($data);

        $instruction = DB::table('master_instructions')->where('id', $id)->first();

        return response()->json($instruction, 201);
    }

    public function show($id)
    {
        $instruction = DB::table('master_instructions')->where('id', $id)->first();

        if (!$instruction) {
            return response()->json(['message' => 'Instruction record not found'], 404);
        }

        return response()->json($instruction);
    }

    public function update(Request $request, $id)
    {
        $instruction = DB::table('master_instructions')->where('id', $id)->first();

        if (!$instruction) {
            return response()->json(['message' => 'Instruction record not found'], 404);
        }

        $validated = $request->validate([
            'instruction' => 'required|string|max:191',
            'isActive' => 'boolean',
        ]);

        $data = [
            'instruction' => trim($validated['instruction']),
            'isActive' => $validated['isActive'] ?? true,
        ];

        DB::table('master_instructions')->where('id', $id)->update($data);

        $updated = DB::table('master_instructions')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        $deleted = DB::table('master_instructions')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Instruction record not found'], 404);
        }

        return response()->json(['message' => 'Instruction record deleted successfully']);
    }
}
