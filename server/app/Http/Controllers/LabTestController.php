<?php

namespace App\Http\Controllers;

use App\Models\LabTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LabTestController extends Controller
{
    public function index(Request $request)
    {
        $query = LabTest::with(['department']);

        if ($request->has('category') && $request->category && $request->category !== 'All') {
            $query->where('Category', $request->category);
        }

        if ($request->has('DepartmentId') && $request->DepartmentId) {
            $query->where('DepartmentId', $request->DepartmentId);
        }

        if ($request->has('isActive') && $request->isActive !== null) {
            $query->where('isActive', $request->isActive);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('TestCode', 'like', "%{$search}%")
                  ->orWhere('TestName', 'like', "%{$search}%")
                  ->orWhere('Category', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'TestCode' => 'required|string|max:20',
            'TestName' => 'required|string|max:100',
            'Category' => 'nullable|string|max:50',
            'DepartmentId' => 'nullable|exists:departments,id',
            'Price' => 'required|numeric|min:0',
            'Description' => 'nullable|string',
            'NormalRange' => 'nullable|string',
            'Unit' => 'nullable|string|max:20',
            'isActive' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();

        $item = LabTest::create($validated);

        return response()->json($item->load('department'), 201);
    }

    public function show(LabTest $labTest)
    {
        return response()->json($labTest->load('department'));
    }

    public function update(Request $request, LabTest $labTest)
    {
        $validated = $request->validate([
            'TestCode' => 'required|string|max:20',
            'TestName' => 'required|string|max:100',
            'Category' => 'nullable|string|max:50',
            'DepartmentId' => 'nullable|exists:departments,id',
            'Price' => 'required|numeric|min:0',
            'Description' => 'nullable|string',
            'NormalRange' => 'nullable|string',
            'Unit' => 'nullable|string|max:20',
            'isActive' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $labTest->update($validated);

        return response()->json($labTest->load('department'));
    }

    public function destroy(LabTest $labTest)
    {
        $labTest->delete();

        return response()->json(['message' => 'Lab test deleted']);
    }
}
