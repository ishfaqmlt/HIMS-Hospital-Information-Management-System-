<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patientId', 'like', "%{$search}%")
                  ->orWhere('pName', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%")
                  ->orWhere('cnic', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('cnic') && $request->cnic) {
            $query->where('cnic', 'like', "%{$request->cnic}%");
        }

        if ($request->has('mobile') && $request->mobile) {
            $query->where('mobile', $request->mobile);
        }

        if ($request->has('mrn') && $request->mrn) {
            $query->whereHas('visits', function ($q) use ($request) {
                $q->where('mrn', $request->mrn);
            });
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
        $now = now();
        $prefix = 'pid-' . $now->format('my');

        $count = Patient::where('patientId', 'like', "{$prefix}-%")->count() + 1;

        return $prefix . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
