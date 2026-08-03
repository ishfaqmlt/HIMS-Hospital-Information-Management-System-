<?php

namespace App\Http\Controllers;

use App\Models\LabSubHeader;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LabSubHeaderController extends Controller
{
    public function index()
    {
        return response()->json(LabSubHeader::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sub_header_name' => 'required|string|max:255|unique:lab_sub_headers,sub_header_name',
        ]);

        $validated['id'] = Str::uuid();
        $item = LabSubHeader::create($validated);

        return response()->json($item, 201);
    }

    public function show(LabSubHeader $labSubHeader)
    {
        return response()->json($labSubHeader);
    }

    public function update(Request $request, LabSubHeader $labSubHeader)
    {
        $validated = $request->validate([
            'sub_header_name' => 'required|string|max:255|unique:lab_sub_headers,sub_header_name,' . $labSubHeader->id,
        ]);

        $labSubHeader->update($validated);

        return response()->json($labSubHeader);
    }

    public function destroy(LabSubHeader $labSubHeader)
    {
        $labSubHeader->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
