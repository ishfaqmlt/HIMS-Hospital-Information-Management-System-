<?php

namespace App\Http\Controllers;

use App\Models\PatientType;
use Illuminate\Http\Request;

class PatientTypeController extends Controller
{
    public function index()
    {
        $patientTypes = PatientType::latest()->get();
        return response()->json($patientTypes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientType' => 'required|string',
        ]);

        $patientType = PatientType::create($validated);

        return response()->json($patientType, 201);
    }

    public function show(PatientType $patientType)
    {
        return response()->json($patientType);
    }

    public function update(Request $request, PatientType $patientType)
    {
        $validated = $request->validate([
            'patientType' => 'required|string',
        ]);

        $patientType->update($validated);

        return response()->json($patientType);
    }

    public function destroy(PatientType $patientType)
    {
        $patientType->delete();

        return response()->json(['message' => 'Patient type deleted successfully']);
    }
}
