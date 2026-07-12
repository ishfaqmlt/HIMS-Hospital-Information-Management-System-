<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        $departments = Department::latest()->get();
        return response()->json($departments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'DepartmentName' => 'required|string|max:50|unique:departments,DepartmentName',
            'ServingBy' => 'required|in:Doctor,Department',
            'isActive' => 'boolean',
        ]);

        $department = Department::create($validated);

        return response()->json($department, 201);
    }

    public function show(Department $department)
    {
        return response()->json($department);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'DepartmentName' => 'required|string|max:50|unique:departments,DepartmentName,' . $department->id,
            'ServingBy' => 'required|in:Doctor,Department',
            'isActive' => 'boolean',
        ]);

        $department->update($validated);

        return response()->json($department);
    }

    public function destroy(Department $department)
    {
        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }
}
