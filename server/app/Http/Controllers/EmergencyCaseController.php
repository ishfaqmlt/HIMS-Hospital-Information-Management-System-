<?php

namespace App\Http\Controllers;

use App\Models\EmergencyCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class EmergencyCaseController extends Controller
{
    public function index(Request $request)
    {
        $query = EmergencyCase::with(['patient', 'doctor', 'department']);

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

        if ($request->has('priority') && $request->priority && $request->priority !== 'All') {
            $query->where('Priority', $request->priority);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('ArrivalDate', Carbon::today());
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('CaseNo', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($q2) use ($search) {
                      $q2->where('pName', 'like', "%{$search}%")
                         ->orWhere('patientId', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->latest('ArrivalDate')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'nullable|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'CaseNo' => 'required|string|max:20',
            'ArrivalDate' => 'required|date',
            'DischargeDate' => 'nullable|date',
            'Priority' => 'required|in:Critical,Urgent,Standard',
            'Status' => 'required|in:Active,Discharged,Transferred,Deceased,Cancelled',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'Treatment' => 'nullable|string',
            'Notes' => 'nullable|string',
            'TotalCharges' => 'required|numeric|min:0',
            'TotalPaid' => 'required|numeric|min:0',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();
        $validated['Balance'] = $validated['TotalCharges'] - $validated['TotalPaid'];

        $item = EmergencyCase::create($validated);

        return response()->json($item->load(['patient', 'doctor', 'department']), 201);
    }

    public function show(EmergencyCase $emergencyCase)
    {
        return response()->json($emergencyCase->load(['patient', 'doctor', 'department']));
    }

    public function update(Request $request, EmergencyCase $emergencyCase)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'nullable|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'CaseNo' => 'required|string|max:20',
            'ArrivalDate' => 'required|date',
            'DischargeDate' => 'nullable|date',
            'Priority' => 'required|in:Critical,Urgent,Standard',
            'Status' => 'required|in:Active,Discharged,Transferred,Deceased,Cancelled',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'Treatment' => 'nullable|string',
            'Notes' => 'nullable|string',
            'TotalCharges' => 'required|numeric|min:0',
            'TotalPaid' => 'required|numeric|min:0',
            'isSynced' => 'boolean',
        ]);

        $validated['Balance'] = $validated['TotalCharges'] - $validated['TotalPaid'];

        $emergencyCase->update($validated);

        return response()->json($emergencyCase->load(['patient', 'doctor', 'department']));
    }

    public function destroy(EmergencyCase $emergencyCase)
    {
        $emergencyCase->delete();

        return response()->json(['message' => 'Emergency case deleted']);
    }
}
