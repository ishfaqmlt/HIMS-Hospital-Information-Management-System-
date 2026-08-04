<?php

namespace App\Http\Controllers;

use App\Models\LabHeader;
use Illuminate\Http\Request;

class LabHeaderController extends Controller
{
    public function index()
    {
        return response()->json(LabHeader::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'header_name' => 'required|string|max:255|unique:lab_headers,header_name',
        ]);

        $validated['id'] = \Illuminate\Support\Str::uuid();
        $item = LabHeader::create($validated);

        return response()->json($item, 201);
    }

    public function show(LabHeader $labHeader)
    {
        return response()->json($labHeader);
    }

    public function update(Request $request, LabHeader $labHeader)
    {
        $validated = $request->validate([
            'header_name' => 'required|string|max:255|unique:lab_headers,header_name,' . $labHeader->id,
        ]);

        $labHeader->update($validated);

        return response()->json($labHeader);
    }

    public function destroy(LabHeader $labHeader)
    {
        $labHeader->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
