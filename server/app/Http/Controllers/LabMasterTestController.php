<?php

namespace App\Http\Controllers;

use App\Models\LabMasterTest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LabMasterTestController extends Controller
{
    public function index(Request $request)
    {
        $query = LabMasterTest::with('requiredSample');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('testCode', 'like', "%{$search}%")
                  ->orWhere('testName', 'like', "%{$search}%");
            });
        }

        if ($request->has('isActive') && $request->isActive !== '') {
            $query->where('isActive', $request->isActive === 'true');
        }

        return response()->json($query->orderBy('testSort')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'testCode' => 'required|string|max:255|unique:lab_master_tests,testCode',
            'testName' => 'required|string|max:255|unique:lab_master_tests,testName',
            'lab_required_sample_id' => 'nullable|exists:lab_required_samples,id',
            'testSort' => 'nullable|integer',
            'expectedTime' => 'nullable|string',
            'interpretation' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $validated['id'] = Str::uuid();
        $item = LabMasterTest::create($validated);

        return response()->json($item->load('requiredSample'), 201);
    }

    public function show(LabMasterTest $labMasterTest)
    {
        return response()->json($labMasterTest->load('requiredSample'));
    }

    public function update(Request $request, LabMasterTest $labMasterTest)
    {
        $validated = $request->validate([
            'testCode' => 'required|string|max:255|unique:lab_master_tests,testCode,' . $labMasterTest->id,
            'testName' => 'required|string|max:255|unique:lab_master_tests,testName,' . $labMasterTest->id,
            'lab_required_sample_id' => 'nullable|exists:lab_required_samples,id',
            'testSort' => 'nullable|integer',
            'expectedTime' => 'nullable|string',
            'interpretation' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $labMasterTest->update($validated);

        return response()->json($labMasterTest->load('requiredSample'));
    }

    public function destroy(LabMasterTest $labMasterTest)
    {
        $labMasterTest->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
