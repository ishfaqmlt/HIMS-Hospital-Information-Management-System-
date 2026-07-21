<?php

namespace App\Http\Controllers;

use App\Models\PatientVisit;
use Illuminate\Http\Request;

class PatientVisitController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientVisit::with(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('mrn', 'like', "%{$search}%")
                  ->orWhere('patientId', 'like', "%{$search}%");
            });
        }

        if ($request->has('mrn') && $request->mrn) {
            $query->where('mrn', $request->mrn);
        }

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('patientTypeId') && $request->patientTypeId) {
            $query->where('patientTypeId', $request->patientTypeId);
        }

        if ($request->has('doctorId') && $request->doctorId) {
            $query->where('doctorId', $request->doctorId);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('created_at', now()->toDateString());
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|string|exists:patients,patientId',
            'patientTypeId' => 'required|string|exists:patient_types,id',
            'InsuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'UserId' => 'required|integer|exists:users,id',
        ]);

        $validated['mrn'] = PatientVisit::generateMrn();

        $visit = PatientVisit::create($validated);

        return response()->json($visit->load(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user']), 201);
    }

    public function show(PatientVisit $patientVisit)
    {
        return response()->json($patientVisit->load(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user']));
    }

    public function update(Request $request, PatientVisit $patientVisit)
    {
        $validated = $request->validate([
            'patientId' => 'required|string|exists:patients,patientId',
            'patientTypeId' => 'required|string|exists:patient_types,id',
            'InsuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'UserId' => 'required|integer|exists:users,id',
        ]);

        $patientVisit->update($validated);

        return response()->json($patientVisit->load(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user']));
    }

    public function destroy(PatientVisit $patientVisit)
    {
        $patientVisit->delete();
        return response()->json(['message' => 'Patient visit deleted successfully']);
    }

    public function getByMrn($mrn)
    {
        $visit = PatientVisit::with(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user'])
            ->where('mrn', $mrn)
            ->first();

        if (!$visit) {
            return response()->json(['message' => 'Patient visit not found'], 404);
        }

        return response()->json($visit);
    }

    public function getByPatientId($patientId)
    {
        $visits = PatientVisit::with(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user'])
            ->where('patientId', $patientId)
            ->latest()
            ->get();

        return response()->json($visits);
    }
}
