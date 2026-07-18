<?php

namespace App\Http\Controllers;

use App\Models\RadiologyScan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RadiologyScanController extends Controller
{
    public function index(Request $request)
    {
        $query = RadiologyScan::with(['department']);

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
                $q->where('ScanCode', 'like', "%{$search}%")
                  ->orWhere('ScanName', 'like', "%{$search}%")
                  ->orWhere('Category', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ScanCode' => 'required|string|max:20',
            'ScanName' => 'required|string|max:100',
            'Category' => 'nullable|string|max:50',
            'DepartmentId' => 'nullable|exists:departments,id',
            'Price' => 'required|numeric|min:0',
            'Description' => 'nullable|string',
            'PreparationNotes' => 'nullable|string',
            'DurationMinutes' => 'required|integer|min:1',
            'isActive' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();

        $item = RadiologyScan::create($validated);

        return response()->json($item->load('department'), 201);
    }

    public function show(RadiologyScan $radiologyScan)
    {
        return response()->json($radiologyScan->load('department'));
    }

    public function update(Request $request, RadiologyScan $radiologyScan)
    {
        $validated = $request->validate([
            'ScanCode' => 'required|string|max:20',
            'ScanName' => 'required|string|max:100',
            'Category' => 'nullable|string|max:50',
            'DepartmentId' => 'nullable|exists:departments,id',
            'Price' => 'required|numeric|min:0',
            'Description' => 'nullable|string',
            'PreparationNotes' => 'nullable|string',
            'DurationMinutes' => 'required|integer|min:1',
            'isActive' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $radiologyScan->update($validated);

        return response()->json($radiologyScan->load('department'));
    }

    public function destroy(RadiologyScan $radiologyScan)
    {
        $radiologyScan->delete();

        return response()->json(['message' => 'Radiology scan deleted']);
    }
}
