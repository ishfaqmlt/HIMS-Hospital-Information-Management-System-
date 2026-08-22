<?php

namespace App\Models;

namespace App\Http\Controllers;

use App\Models\PatientVital;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PatientVitalController extends Controller
{
    /**
     * Display a listing of patient vitals.
     */
    public function index(Request $request)
    {
        $query = PatientVital::with(['patient', 'recorder']);

        if ($request->has('patientId')) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('visitId')) {
            $query->where('visitId', $request->visitId);
        }

        $vitals = $query->orderBy('created_at', 'desc')->get();
        return response()->json($vitals);
    }

    /**
     * Store a newly created vital sign record.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'visitId' => 'nullable|exists:patient_visits,id',
            'systolic' => 'nullable|integer',
            'diastolic' => 'nullable|integer',
            'blood_pressure' => 'nullable|string|max:20',
            'pulse_rate' => 'nullable|integer',
            'temperature' => 'nullable|numeric',
            'respiratory_rate' => 'nullable|integer',
            'spo2' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'bmi' => 'nullable|numeric',
            'bsr' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $validated['id'] = (string) Str::uuid();
        $validated['recorded_by'] = auth()->id();
        $validated['recorded_at'] = now();

        // Calculate BMI if height (in cm) and weight (in kg) are provided
        if (empty($validated['bmi']) && !empty($validated['weight']) && !empty($validated['height']) && $validated['height'] > 0) {
            $heightInMeters = $validated['height'] / 100;
            $validated['bmi'] = round($validated['weight'] / ($heightInMeters * $heightInMeters), 1);
        }

        // Auto-generate blood_pressure string if systolic and diastolic are present
        if (empty($validated['blood_pressure']) && !empty($validated['systolic']) && !empty($validated['diastolic'])) {
            $validated['blood_pressure'] = "{$validated['systolic']}/{$validated['diastolic']}";
        }

        $vital = PatientVital::create($validated);

        return response()->json($vital, 201);
    }

    /**
     * Display the specified vital sign record.
     */
    public function show($id)
    {
        $vital = PatientVital::with(['patient', 'recorder'])->findOrFail($id);
        return response()->json($vital);
    }

    /**
     * Update the specified vital sign record.
     */
    public function update(Request $request, $id)
    {
        $vital = PatientVital::findOrFail($id);

        $validated = $request->validate([
            'patientId' => 'sometimes|exists:patients,id',
            'visitId' => 'nullable|exists:patient_visits,id',
            'systolic' => 'nullable|integer',
            'diastolic' => 'nullable|integer',
            'blood_pressure' => 'nullable|string|max:20',
            'pulse_rate' => 'nullable|integer',
            'temperature' => 'nullable|numeric',
            'respiratory_rate' => 'nullable|integer',
            'spo2' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'height' => 'nullable|numeric',
            'bmi' => 'nullable|numeric',
            'bsr' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        if (empty($validated['bmi']) && !empty($validated['weight']) && !empty($validated['height']) && $validated['height'] > 0) {
            $heightInMeters = $validated['height'] / 100;
            $validated['bmi'] = round($validated['weight'] / ($heightInMeters * $heightInMeters), 1);
        }

        if (empty($validated['blood_pressure']) && !empty($validated['systolic']) && !empty($validated['diastolic'])) {
            $validated['blood_pressure'] = "{$validated['systolic']}/{$validated['diastolic']}";
        }

        $vital->update($validated);

        return response()->json($vital);
    }

    /**
     * Remove the specified vital sign record.
     */
    public function destroy($id)
    {
        $vital = PatientVital::findOrFail($id);
        $vital->delete();

        return response()->json(['message' => 'Patient vital record deleted successfully']);
    }
}
