<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::latest()->get();
        return response()->json($patients);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cnic' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'pName' => 'required|string|max:50',
            'gName' => 'nullable|string|max:50',
            'gender' => 'nullable|in:Male,Female,Other',
            'dob' => 'nullable|date',
            'address' => 'nullable|string|max:150',
            'allergy' => 'nullable|string|max:150',
            'isActive' => 'boolean',
        ]);

        $validated['patientId'] = $this->generatePatientId();

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    public function show(Patient $patient)
    {
        return response()->json($patient);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'cnic' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'pName' => 'required|string|max:50',
            'gName' => 'nullable|string|max:50',
            'gender' => 'nullable|in:Male,Female,Other',
            'dob' => 'nullable|date',
            'address' => 'nullable|string|max:150',
            'allergy' => 'nullable|string|max:150',
            'isActive' => 'boolean',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully']);
    }

    private function generatePatientId(): string
    {
        $today = now();
        $datePart = $today->format('dmY'); // e.g., 090726

        // Get today's count (including this new record)
        $count = Patient::whereDate('created_at', $today->toDateString())->count() + 1;

        return 'pid-' . str_pad($count, 2, '0', STR_PAD_LEFT) . '-' . $datePart;
    }
}
