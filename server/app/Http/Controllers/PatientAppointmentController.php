<?php

namespace App\Http\Controllers;

use App\Models\PatientAppointment;
use App\Models\AppointmentMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class PatientAppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientAppointment::with(['doctor', 'patient']);

        if ($request->has('DoctorId') && $request->DoctorId) {
            $query->where('DoctorId', $request->DoctorId);
        }

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('Status', $request->status);
        }

        if ($request->has('date') && $request->date) {
            $query->whereDate('Appointmentat', $request->date);
        }

        return response()->json($query->latest('Appointmentat')->get());
    }

    public function getSlots(Request $request)
    {
        $request->validate([
            'DoctorId' => 'required|exists:doctors,id',
            'date' => 'required|date',
        ]);

        $dayOfWeek = Carbon::parse($request->date)->format('l');

        $schedule = AppointmentMaster::where('DoctorId', $request->DoctorId)
            ->where('DayOfWeek', $dayOfWeek)
            ->first();

        if (!$schedule) {
            return response()->json([
                'schedule' => null,
                'bookedCount' => 0,
                'maxBookings' => 0,
                'availableSlots' => 0,
            ]);
        }

        $bookedCount = PatientAppointment::where('DoctorId', $request->DoctorId)
            ->whereDate('Appointmentat', $request->date)
            ->whereNotIn('Status', ['Cancelled'])
            ->count();

        return response()->json([
            'schedule' => $schedule,
            'bookedCount' => $bookedCount,
            'maxBookings' => $schedule->MaxBookings,
            'availableSlots' => max(0, $schedule->MaxBookings - $bookedCount),
        ]);
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
