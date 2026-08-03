<?php

namespace App\Http\Controllers;

use App\Models\LabRequiredSample;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LabRequiredSampleController extends Controller
{
    public function index()
    {
        return response()->json(LabRequiredSample::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'required_sample_name' => 'required|string|max:255|unique:lab_required_samples,required_sample_name',
        ]);

        $validated['id'] = Str::uuid();
        $item = LabRequiredSample::create($validated);

        return response()->json($item, 201);
    }

    public function show(LabRequiredSample $labRequiredSample)
    {
        return response()->json($labRequiredSample);
    }

    public function update(Request $request, LabRequiredSample $labRequiredSample)
    {
        $validated = $request->validate([
            'required_sample_name' => 'required|string|max:255|unique:lab_required_samples,required_sample_name,' . $labRequiredSample->id,
        ]);

        $labRequiredSample->update($validated);

        return response()->json($labRequiredSample);
    }

    public function destroy(LabRequiredSample $labRequiredSample)
    {
        $labRequiredSample->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
