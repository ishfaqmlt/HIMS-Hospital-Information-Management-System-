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

        if ($request->has('fromDate') && $request->fromDate) {
            $query->where('created_at', '>=', $request->fromDate);
        }

        if ($request->has('toDate') && $request->toDate) {
            $query->where('created_at', '<=', $request->toDate);
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
            'isActive' => 'boolean',
        ]);

        $sanitized = $this->sanitizePatientData($validated);
        $patient = Patient::create($sanitized);

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
            'isActive' => 'boolean',
        ]);

        $sanitized = $this->sanitizePatientData($validated);
        $patient->update($sanitized);

        return response()->json($patient);
    }

    private function sanitizePatientData(array $data): array
    {
        if (array_key_exists('pName', $data) && $data['pName'] !== null) {
            $data['pName'] = Patient::toProperCase($data['pName']);
        }
        if (array_key_exists('gName', $data) && $data['gName'] !== null) {
            $data['gName'] = Patient::toProperCase($data['gName']);
        }
        if (array_key_exists('address', $data) && $data['address'] !== null) {
            $data['address'] = Patient::toProperCase($data['address']);
        }
        if (array_key_exists('email', $data) && $data['email'] !== null) {
            $trimmed = trim($data['email']);
            $data['email'] = $trimmed === '' ? null : strtolower($trimmed);
        }
        return $data;
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json(['message' => 'Patient deleted successfully']);
    }
}
