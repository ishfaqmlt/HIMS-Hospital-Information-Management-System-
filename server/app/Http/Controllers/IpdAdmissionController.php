<?php

namespace App\Http\Controllers;

use App\Models\IpdAdmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class IpdAdmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = IpdAdmission::with(['patientVisit.patient', 'doctor', 'floor', 'roomWard', 'bed']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('AdmissionNo', 'like', "%{$search}%")
                  ->orWhereHas('patientVisit', function ($q2) use ($search) {
                      $q2->where('visitNo', 'like', "%{$search}%");
                  })
                  ->orWhereHas('patientVisit.patient', function ($q2) use ($search) {
                      $q2->where('pName', 'like', "%{$search}%")
                         ->orWhere('mrn', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('visitId') && $request->visitId) {
            $query->where('visitId', $request->visitId);
        }

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('Status', $request->status);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('AdmissionDate', Carbon::today());
        }

        return response()->json($query->latest('AdmissionDate')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitId' => 'required|string|exists:patient_visits,id',
            'DoctorId' => 'required|exists:doctors,id',
            'AdmissionNo' => 'required|string|max:20',
            'AdmissionDate' => 'required|date',
            'DischargeDate' => 'nullable|date',
            'FloorId' => 'required|exists:floor_master,id',
            'RoomWardId' => 'required|exists:rooms_wards_master,id',
            'bedId' => 'required|exists:bed_master,id',
            'AdmissionType' => 'required|in:Elective,Emergency,Transfer',
            'Status' => 'required|in:Admitted,Discharged,Transferred,Cancelled',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'TreatmentPlan' => 'nullable|string',
            'DischargeSummary' => 'nullable|string',
            'TotalCharges' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'PayableAmount' => 'required|numeric|min:0',
            'TotalPaid' => 'required|numeric|min:0',
            'Balance' => 'required|numeric',
            'isSynced' => 'boolean',
        ]);

        $validated['createdBy'] = Auth::id();
        $validated['Balance'] = $validated['PayableAmount'] - $validated['TotalPaid'];

        $item = IpdAdmission::create($validated);

        return response()->json($item->load(['patientVisit.patient', 'doctor', 'floor', 'roomWard', 'bed']), 201);
    }

    public function show(IpdAdmission $ipdAdmission)
    {
        return response()->json($ipdAdmission->load(['patientVisit.patient', 'doctor', 'floor', 'roomWard', 'bed']));
    }

    public function update(Request $request, IpdAdmission $ipdAdmission)
    {
        $validated = $request->validate([
            'visitId' => 'required|string|exists:patient_visits,id',
            'DoctorId' => 'required|exists:doctors,id',
            'AdmissionNo' => 'required|string|max:20',
            'AdmissionDate' => 'required|date',
            'DischargeDate' => 'nullable|date',
            'FloorId' => 'required|exists:floor_master,id',
            'RoomWardId' => 'required|exists:rooms_wards_master,id',
            'bedId' => 'required|exists:bed_master,id',
            'AdmissionType' => 'required|in:Elective,Emergency,Transfer',
            'Status' => 'required|in:Admitted,Discharged,Transferred,Cancelled',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'TreatmentPlan' => 'nullable|string',
            'DischargeSummary' => 'nullable|string',
            'TotalCharges' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'PayableAmount' => 'required|numeric|min:0',
            'TotalPaid' => 'required|numeric|min:0',
            'Balance' => 'required|numeric',
            'isSynced' => 'boolean',
        ]);

        $validated['Balance'] = $validated['PayableAmount'] - $validated['TotalPaid'];

        $ipdAdmission->update($validated);

        return response()->json($ipdAdmission->load(['patientVisit.patient', 'doctor', 'floor', 'roomWard', 'bed']));
    }

    public function destroy(IpdAdmission $ipdAdmission)
    {
        $ipdAdmission->delete();

        return response()->json(['message' => 'IPD admission deleted']);
    }
}
