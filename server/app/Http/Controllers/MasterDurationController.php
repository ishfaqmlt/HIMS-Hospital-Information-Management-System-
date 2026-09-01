<?php

namespace App\Http\Controllers;

use App\Models\MasterDuration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MasterDurationController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('master_durations');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('duration', 'like', "%{$search}%");
        }

        if ($request->has('isActive') && $request->isActive !== null) {
            $query->where('isActive', filter_var($request->isActive, FILTER_VALIDATE_BOOLEAN));
        }

        $durations = $query->orderBy('duration', 'asc')->get();

        return response()->json($durations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'duration' => 'required|string|max:191',
            'isActive' => 'nullable|boolean',
        ]);

        $trimmed = trim($validated['duration']);

        $existing = DB::table('master_durations')
            ->whereRaw('LOWER(duration) = ?', [mb_strtolower($trimmed, 'UTF-8')])
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $data = [
            'id' => $id,
            'duration' => $trimmed,
            'isSynced' => false,
            'isActive' => $validated['isActive'] ?? true,
        ];

        DB::table('master_durations')->insert($data);

        $duration = DB::table('master_durations')->where('id', $id)->first();

        return response()->json($duration, 201);
    }

    public function show($id)
    {
        $duration = DB::table('master_durations')->where('id', $id)->first();

        if (!$duration) {
            return response()->json(['message' => 'Duration record not found'], 404);
        }

        return response()->json($duration);
    }

    public function update(Request $request, $id)
    {
        $duration = DB::table('master_durations')->where('id', $id)->first();

        if (!$duration) {
            return response()->json(['message' => 'Duration record not found'], 404);
        }

        $validated = $request->validate([
            'duration' => 'required|string|max:191',
            'isActive' => 'boolean',
        ]);

        $data = [
            'duration' => trim($validated['duration']),
            'isActive' => $validated['isActive'] ?? true,
        ];

        DB::table('master_durations')->where('id', $id)->update($data);

        $updated = DB::table('master_durations')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        $deleted = DB::table('master_durations')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Duration record not found'], 404);
        }

        return response()->json(['message' => 'Duration record deleted successfully']);
    }
}
