<?php

namespace App\Http\Controllers;

use App\Models\OpdVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class OpdVisitController extends Controller
{
    public function index(Request $request)
    {
        $query = OpdVisit::with(['patient', 'doctor', 'department']);

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
            $query->whereDate('VisitDate', Carbon::today());
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('VisitNo', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($q2) use ($search) {
                      $q2->where('pName', 'like', "%{$search}%")
                         ->orWhere('patientId', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->latest('VisitDate')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'required|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'VisitDate' => 'required|date',
            'VisitNo' => 'required|string|max:20',
            'VisitType' => 'required|in:OPD,Followup,Emergency',
            'ConsultationFee' => 'required|numeric|min:0',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'Notes' => 'nullable|string',
            'Status' => 'required|in:Waiting,In Progress,Completed,Cancelled',
            'isPrescriptionGiven' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();

        $item = OpdVisit::create($validated);

        return response()->json($item->load(['patient', 'doctor', 'department']), 201);
    }

    public function show(OpdVisit $opdVisit)
    {
        return response()->json($opdVisit->load(['patient', 'doctor', 'department']));
    }

    public function update(Request $request, OpdVisit $opdVisit)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'required|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'VisitDate' => 'required|date',
            'VisitNo' => 'required|string|max:20',
            'VisitType' => 'required|in:OPD,Followup,Emergency',
            'ConsultationFee' => 'required|numeric|min:0',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'Notes' => 'nullable|string',
            'Status' => 'required|in:Waiting,In Progress,Completed,Cancelled',
            'isPrescriptionGiven' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $opdVisit->update($validated);

        return response()->json($opdVisit->load(['patient', 'doctor', 'department']));
    }

    public function destroy(OpdVisit $opdVisit)
    {
        $opdVisit->delete();

        return response()->json(['message' => 'OPD visit deleted']);
    }
}
