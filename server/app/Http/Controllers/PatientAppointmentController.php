<?php

namespace App\Http\Controllers;

use App\Models\PatientAppointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientAppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientAppointment::with(['doctor', 'patient']);

        if ($request->has('DoctorId')) {
            $query->where('DoctorId', $request->DoctorId);
        }

        if ($request->has('patientId')) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('status')) {
            $query->where('Status', $request->status);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('Appointmentat', now()->toDateString());
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('patient', function ($q2) use ($search) {
                    $q2->where('pName', 'like', "%{$search}%")
                       ->orWhere('patientId', 'like', "%{$search}%")
                       ->orWhere('mobile', 'like', "%{$search}%");
                })
                ->orWhere('TokenNo', 'like', "%{$search}%")
                ->orWhere('Remarks', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest('Appointmentat')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'DoctorId' => 'required|exists:doctors,id',
            'patientId' => 'required|exists:patients,id',
            'Appointmentat' => 'required|date',
            'TokenNo' => 'required|integer|min:1',
            'Status' => 'required|in:Pending,Booked,Cancelled,Completed',
            'Remarks' => 'nullable|string|max:255',
            'isReminderSent' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();

        $item = PatientAppointment::create($validated);

        return response()->json($item->load(['doctor', 'patient']), 201);
    }

    public function show(PatientAppointment $patientAppointment)
    {
        return response()->json($patientAppointment->load(['doctor', 'patient']));
    }

    public function update(Request $request, PatientAppointment $patientAppointment)
    {
        $validated = $request->validate([
            'DoctorId' => 'required|exists:doctors,id',
            'patientId' => 'required|exists:patients,id',
            'Appointmentat' => 'required|date',
            'TokenNo' => 'required|integer|min:1',
            'Status' => 'required|in:Pending,Booked,Cancelled,Completed',
            'Remarks' => 'nullable|string|max:255',
            'isReminderSent' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $patientAppointment->update($validated);

        return response()->json($patientAppointment->load(['doctor', 'patient']));
    }

    public function destroy(PatientAppointment $patientAppointment)
    {
        $patientAppointment->delete();

        return response()->json(['message' => 'Appointment deleted']);
    }
}
