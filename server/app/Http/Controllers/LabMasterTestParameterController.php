<?php

namespace App\Http\Controllers;

use App\Models\LabMasterTestParameter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LabMasterTestParameterController extends Controller
{
    public function index(Request $request)
    {
        $query = LabMasterTestParameter::with(['masterTest', 'subHeader']);

        if ($request->filled('master_test_id')) {
            $query->where('master_test_id', $request->master_test_id);
        }

        $parameters = $query->orderBy('sortNo')->get();

        return response()->json($parameters);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'master_test_id' => 'required|uuid|exists:lab_master_tests,id',
            'sub_headers_id' => 'nullable|uuid|exists:lab_sub_headers,id',
            'parameterName' => 'required|string|max:255',
            'defaultValue' => 'nullable|string',
            'units' => 'nullable|string',
            'decimal' => 'nullable|integer|min:0|max:5',
            'resultTemplets' => 'nullable|string',
            'formula' => 'nullable|string',
            'analyzerCode' => 'nullable|string',
            'sortNo' => 'nullable|integer',
            'printOnReciept' => 'nullable|boolean',
            'isActive' => 'nullable|boolean',
            'normalRange' => 'nullable|string',
        ]);

        $validated['id'] = Str::uuid();

        $parameter = LabMasterTestParameter::create($validated);

        return response()->json([
            'message' => 'Test parameter created successfully',
            'data' => $parameter->load(['masterTest', 'subHeader']),
        ], 201);
    }

    public function show(LabMasterTestParameter $labMasterTestParameter)
    {
        return response()->json(
            $labMasterTestParameter->load(['masterTest', 'subHeader'])
        );
    }

    public function update(Request $request, LabMasterTestParameter $labMasterTestParameter)
    {
        $validated = $request->validate([
            'master_test_id' => 'required|uuid|exists:lab_master_tests,id',
            'sub_headers_id' => 'nullable|uuid|exists:lab_sub_headers,id',
            'parameterName' => 'required|string|max:255',
            'defaultValue' => 'nullable|string',
            'units' => 'nullable|string',
            'decimal' => 'nullable|integer|min:0|max:5',
            'resultTemplets' => 'nullable|string',
            'formula' => 'nullable|string',
            'analyzerCode' => 'nullable|string',
            'sortNo' => 'nullable|integer',
            'printOnReciept' => 'nullable|boolean',
            'isActive' => 'nullable|boolean',
            'normalRange' => 'nullable|string',
        ]);

        $labMasterTestParameter->update($validated);

        return response()->json([
            'message' => 'Test parameter updated successfully',
            'data' => $labMasterTestParameter->load(['masterTest', 'subHeader']),
        ]);
    }

    public function destroy(LabMasterTestParameter $labMasterTestParameter)
    {
        $labMasterTestParameter->delete();

        return response()->json([
            'message' => 'Test parameter deleted successfully',
        ]);
    }
}
