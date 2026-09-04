<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabProfileController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('lab_profiles')
            ->leftJoin('users', 'lab_profiles.createdBy', '=', 'users.id')
            ->select(
                'lab_profiles.*',
                'users.name as creator_name'
            );

        if ($request->has('type') && $request->type) {
            $query->where('lab_profiles.type', $request->type);
        }

        if ($request->has('isActive')) {
            $query->where('lab_profiles.isActive', filter_var($request->isActive, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lab_profiles.name', 'like', "%{$search}%")
                  ->orWhere('lab_profiles.code', 'like', "%{$search}%")
                  ->orWhere('lab_profiles.city', 'like', "%{$search}%");
            });
        }

        $profiles = $query->orderBy('lab_profiles.created_at', 'desc')->get()->map(function ($item) {
            $item->isActive = (bool) $item->isActive;
            return $item;
        });

        return response()->json([
            'data' => $profiles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:lab_profiles,code',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $id = (string) Str::uuid();
        $now = now();

        $data = [
            'id' => $id,
            'type' => $validated['type'],
            'code' => $validated['code'],
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'city' => $validated['city'] ?? null,
            'address' => $validated['address'] ?? null,
            'isActive' => isset($validated['isActive']) ? (bool) $validated['isActive'] : true,
            'createdBy' => Auth::id(),
            'created_at' => $now,
            'updated_at' => $now,
        ];

        DB::table('lab_profiles')->insert($data);

        $profile = DB::table('lab_profiles')->where('id', $id)->first();
        if ($profile) {
            $profile->isActive = (bool) $profile->isActive;
        }

        return response()->json([
            'message' => 'Lab profile created successfully',
            'data' => $profile,
        ], 201);
    }

    public function show($id)
    {
        $profile = DB::table('lab_profiles')->where('id', $id)->first();

        if (!$profile) {
            return response()->json(['message' => 'Lab profile not found'], 404);
        }

        $profile->isActive = (bool) $profile->isActive;

        return response()->json([
            'data' => $profile,
        ]);
    }

    public function update(Request $request, $id)
    {
        $profile = DB::table('lab_profiles')->where('id', $id)->first();

        if (!$profile) {
            return response()->json(['message' => 'Lab profile not found'], 404);
        }

        $validated = $request->validate([
            'type' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:lab_profiles,code,' . $id,
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'city' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $updateData = [
            'type' => $validated['type'],
            'code' => $validated['code'],
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'city' => $validated['city'] ?? null,
            'address' => $validated['address'] ?? null,
            'isActive' => isset($validated['isActive']) ? (bool) $validated['isActive'] : true,
            'updated_at' => now(),
        ];

        DB::table('lab_profiles')->where('id', $id)->update($updateData);

        $updated = DB::table('lab_profiles')->where('id', $id)->first();
        if ($updated) {
            $updated->isActive = (bool) $updated->isActive;
        }

        return response()->json([
            'message' => 'Lab profile updated successfully',
            'data' => $updated,
        ]);
    }

    public function destroy($id)
    {
        $deleted = DB::table('lab_profiles')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Lab profile not found'], 404);
        }

        return response()->json([
            'message' => 'Lab profile deleted successfully',
        ]);
    }
}
