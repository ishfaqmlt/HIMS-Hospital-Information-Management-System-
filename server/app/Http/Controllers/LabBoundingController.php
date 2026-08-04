<?php

namespace App\Http\Controllers;

use App\Models\LabBounding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabBoundingController extends Controller
{
    public function index(Request $request)
    {
        $query = LabBounding::with('parameter');

        if ($request->filled('parameterId')) {
            $query->where('parameterId', $request->parameterId);
        }

        $boundings = $query->orderBy('fromAge')->get();

        return response()->json($boundings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parameterId' => 'required|uuid|exists:lab_master_test_parameters,id',
            'gender' => 'nullable|string|max:20',
            'fromAge' => 'required|integer|min:0',
            'toAge' => 'required|integer|min:0',
            'ageType' => 'required|string|max:20',
            'lowerBound' => 'required|numeric',
            'upperBound' => 'required|numeric',
            'lowerCritical' => 'required|numeric',
            'upperCritical' => 'required|numeric',
            'fromAgeDays' => 'required|integer|min:0',
            'toAgeDays' => 'required|integer|min:0',
        ]);

        $validated['id'] = Str::uuid();
        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        DB::table('lab_boundings')->insert($validated);

        return response()->json([
            'message' => 'Bounding created successfully',
            'data' => $validated,
        ], 201);
    }

    public function show(LabBounding $labBounding)
    {
        return response()->json(
            $labBounding->load('parameter')
        );
    }

    public function update(Request $request, LabBounding $labBounding)
    {
        $validated = $request->validate([
            'parameterId' => 'required|uuid|exists:lab_master_test_parameters,id',
            'gender' => 'nullable|string|max:20',
            'fromAge' => 'required|integer|min:0',
            'toAge' => 'required|integer|min:0',
            'ageType' => 'required|string|max:20',
            'lowerBound' => 'required|numeric',
            'upperBound' => 'required|numeric',
            'lowerCritical' => 'required|numeric',
            'upperCritical' => 'required|numeric',
            'fromAgeDays' => 'required|integer|min:0',
            'toAgeDays' => 'required|integer|min:0',
        ]);

        $validated['updated_at'] = now();

        DB::table('lab_boundings')->where('id', $labBounding->id)->update($validated);

        return response()->json([
            'message' => 'Bounding updated successfully',
            'data' => $labBounding->load('parameter'),
        ]);
    }

    public function destroy(LabBounding $labBounding)
    {
        DB::table('lab_boundings')->where('id', $labBounding->id)->delete();

        return response()->json([
            'message' => 'Bounding deleted successfully',
        ]);
    }
}
