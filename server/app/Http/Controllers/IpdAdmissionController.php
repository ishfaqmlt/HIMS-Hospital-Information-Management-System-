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
        $query = IpdAdmission::with(['patient', 'doctor', 'department']);

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('DoctorId') && $request->DoctorId) {
            $query->where('DoctorId', $request->DoctorId);
        }

        if ($request->has('DepartmentId') && $request->DepartmentId) {
            $query->where('DepartmentId', $request->DepartmentId);
        }

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('Status', $request->status);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('AdmissionDate', Carbon::today());
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('AdmissionNo', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($q2) use ($search) {
                      $q2->where('pName', 'like', "%{$search}%")
                         ->orWhere('patientId', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->latest('AdmissionDate')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'required|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'AdmissionNo' => 'required|string|max:20',
            'AdmissionDate' => 'required|date',
            'DischargeDate' => 'nullable|date',
            'RoomNo' => 'nullable|string|max:20',
            'BedNo' => 'nullable|string|max:20',
            'AdmissionType' => 'required|in:Elective,Emergency,Transfer',
            'Status' => 'required|in:Admitted,Discharged,Transferred,Cancelled',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'TreatmentPlan' => 'nullable|string',
            'DischargeSummary' => 'nullable|string',
            'TotalCharges' => 'required|numeric|min:0',
            'TotalPaid' => 'required|numeric|min:0',
            'Balance' => 'required|numeric',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();
        $validated['Balance'] = $validated['TotalCharges'] - $validated['TotalPaid'];

        $item = IpdAdmission::create($validated);

        return response()->json($item->load(['patient', 'doctor', 'department']), 201);
    }

    public function show(IpdAdmission $ipdAdmission)
    {
        return response()->json($ipdAdmission->load(['patient', 'doctor', 'department']));
    }

    public function update(Request $request, IpdAdmission $ipdAdmission)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'required|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'AdmissionNo' => 'required|string|max:20',
            'AdmissionDate' => 'required|date',
            'DischargeDate' => 'nullable|date',
            'RoomNo' => 'nullable|string|max:20',
            'BedNo' => 'nullable|string|max:20',
            'AdmissionType' => 'required|in:Elective,Emergency,Transfer',
            'Status' => 'required|in:Admitted,Discharged,Transferred,Cancelled',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'TreatmentPlan' => 'nullable|string',
            'DischargeSummary' => 'nullable|string',
            'TotalCharges' => 'required|numeric|min:0',
            'TotalPaid' => 'required|numeric|min:0',
            'Balance' => 'required|numeric',
            'isSynced' => 'boolean',
        ]);

        $validated['Balance'] = $validated['TotalCharges'] - $validated['TotalPaid'];

        $ipdAdmission->update($validated);

        return response()->json($ipdAdmission->load(['patient', 'doctor', 'department']));
    }

    public function destroy(IpdAdmission $ipdAdmission)
    {
        $ipdAdmission->delete();

        return response()->json(['message' => 'IPD admission deleted']);
    }
}
