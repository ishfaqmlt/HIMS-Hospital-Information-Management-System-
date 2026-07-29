<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        if ($request->has('hasVisit') && $request->hasVisit) {
            $query->whereIn('id', function ($q) {
                $q->select('patientId')->from('patient_visits');
            });
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('mrn', 'like', "%{$search}%")
                  ->orWhere('pName', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('cnic', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('mrn') && $request->mrn) {
            $query->where('mrn', $request->mrn);
        }

        if ($request->has('cnic') && $request->cnic) {
            $query->where('cnic', $request->cnic);
        }

        if ($request->has('mobile') && $request->mobile) {
            $query->where('mobile', $request->mobile);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('created_at', now()->toDateString());
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cnic' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'pName' => 'required|string|max:100',
            'gName' => 'nullable|string|max:100',
            'gender' => 'nullable|in:Male,Female,Other',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'allergy' => 'nullable|string',
            'isActive' => 'boolean',
        ]);

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
            'pName' => 'required|string|max:100',
            'gName' => 'nullable|string|max:100',
            'gender' => 'nullable|in:Male,Female,Other',
            'dob' => 'nullable|date',
            'address' => 'nullable|string',
            'allergy' => 'nullable|string',
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
}
