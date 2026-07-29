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
                $q->where('visitNo', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($q2) use ($search) {
                      $q2->where('mrn', 'like', "%{$search}%")
                         ->orWhere('pName', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('visitNo') && $request->visitNo) {
            $query->where('visitNo', $request->visitNo);
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

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('visitDate', now()->toDateString());
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|string|exists:patients,id',
            'patientTypeId' => 'required|string|exists:patient_types,id',
            'insuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'userId' => 'required|integer|exists:users,id',
            'visitDate' => 'required|date',
            'status' => 'nullable|in:Waiting,In Progress,Completed,Cancelled',
        ]);

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
            'patientId' => 'required|string|exists:patients,id',
            'patientTypeId' => 'required|string|exists:patient_types,id',
            'insuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'userId' => 'required|integer|exists:users,id',
            'visitDate' => 'required|date',
            'status' => 'nullable|in:Waiting,In Progress,Completed,Cancelled',
        ]);

        $patientVisit->update($validated);

        return response()->json($patientVisit->load(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user']));
    }

    public function destroy(PatientVisit $patientVisit)
    {
        $patientVisit->delete();
        return response()->json(['message' => 'Patient visit deleted successfully']);
    }

    public function getByVisitNo($visitNo)
    {
        $visit = PatientVisit::with(['patient', 'patientType', 'insuranceCompany', 'doctor', 'user'])
            ->where('visitNo', $visitNo)
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
