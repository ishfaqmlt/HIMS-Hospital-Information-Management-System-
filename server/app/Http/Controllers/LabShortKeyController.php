<?php

namespace App\Http\Controllers;

use App\Models\LabShortKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabShortKeyController extends Controller
{
    /**
     * List all lab short keys
     */
    public function index(Request $request)
    {
        $query = DB::table('lab_short_keys');

        if ($request->has('search') && !empty($request->search)) {
            $search = trim($request->search);
            $query->where('sKey', 'like', "%{$search}%")
                  ->orWhere('correctedKey', 'like', "%{$search}%");
        }

        $items = $query->orderBy('sKey', 'asc')->get();

        return response()->json($items);
    }

    /**
     * Store a new short key
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sKey' => 'required|string|max:10',
            'correctedKey' => 'required|string|max:100',
        ]);

        $sKey = trim($validated['sKey']);
        $existing = DB::table('lab_short_keys')->where('sKey', $sKey)->first();
        if ($existing) {
            return response()->json(['message' => 'Short key already exists.'], 422);
        }

        $id = (string) Str::uuid();
        DB::table('lab_short_keys')->insert([
            'id' => $id,
            'sKey' => $sKey,
            'correctedKey' => trim($validated['correctedKey']),
            'isSynced' => false,
        ]);

        $created = DB::table('lab_short_keys')->where('id', $id)->first();

        return response()->json([
            'message' => 'Short key created successfully',
            'data' => $created,
        ], 201);
    }

    /**
     * Update an existing short key
     */
    public function update(Request $request, $id)
    {
        $existing = DB::table('lab_short_keys')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['message' => 'Short key not found'], 404);
        }

        $validated = $request->validate([
            'sKey' => 'required|string|max:10',
            'correctedKey' => 'required|string|max:100',
        ]);

        $sKey = trim($validated['sKey']);
        $duplicate = DB::table('lab_short_keys')
            ->where('sKey', $sKey)
            ->where('id', '!=', $id)
            ->first();

        if ($duplicate) {
            return response()->json(['message' => 'Short key code already used by another record.'], 422);
        }

        DB::table('lab_short_keys')->where('id', $id)->update([
            'sKey' => $sKey,
            'correctedKey' => trim($validated['correctedKey']),
            'isSynced' => false,
        ]);

        $updated = DB::table('lab_short_keys')->where('id', $id)->first();

        return response()->json([
            'message' => 'Short key updated successfully',
            'data' => $updated,
        ]);
    }

    /**
     * Delete a short key
     */
    public function destroy($id)
    {
        $existing = DB::table('lab_short_keys')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['message' => 'Short key not found'], 404);
        }

        DB::table('lab_short_keys')->where('id', $id)->delete();

        return response()->json(['message' => 'Short key deleted successfully']);
    }
}
