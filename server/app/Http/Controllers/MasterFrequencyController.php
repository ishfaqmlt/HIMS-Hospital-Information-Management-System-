<?php

namespace App\Http\Controllers;

use App\Models\MasterFrequency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterFrequencyController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('master_frequency');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('frequency', 'like', "%{$search}%");
        }

        if ($request->has('isActive') && $request->isActive !== null) {
            $query->where('isActive', filter_var($request->isActive, FILTER_VALIDATE_BOOLEAN));
        }

        $frequencies = $query->orderBy('frequency', 'asc')->get();

        return response()->json($frequencies);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'frequency' => 'required|string|max:191',
            'isActive' => 'nullable|boolean',
        ]);

        $trimmed = trim($validated['frequency']);

        $existing = DB::table('master_frequency')
            ->whereRaw('LOWER(frequency) = ?', [mb_strtolower($trimmed, 'UTF-8')])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'frequency' => $trimmed,
            'isSynced' => false,
            'isActive' => $validated['isActive'] ?? true,
        ];

        DB::table('master_frequency')->insert($data);

        $frequency = DB::table('master_frequency')->where('id', $id)->first();

        return response()->json($frequency, 201);
    }

    public function show($id)
    {
        $frequency = DB::table('master_frequency')->where('id', $id)->first();

        if (!$frequency) {
            return response()->json(['message' => 'Frequency record not found'], 404);
        }

        return response()->json($frequency);
    }

    public function update(Request $request, $id)
    {
        $frequency = DB::table('master_frequency')->where('id', $id)->first();

        if (!$frequency) {
            return response()->json(['message' => 'Frequency record not found'], 404);
        }

        $validated = $request->validate([
            'frequency' => 'required|string|max:191',
            'isActive' => 'boolean',
        ]);

        $data = [
            'frequency' => trim($validated['frequency']),
            'isActive' => $validated['isActive'] ?? true,
        ];

        DB::table('master_frequency')->where('id', $id)->update($data);

        $updated = DB::table('master_frequency')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        $deleted = DB::table('master_frequency')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Frequency record not found'], 404);
        }

        return response()->json(['message' => 'Frequency record deleted successfully']);
    }
}
