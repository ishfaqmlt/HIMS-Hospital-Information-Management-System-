<?php

namespace App\Http\Controllers;

use App\Models\AppointmentMaster;
use Illuminate\Http\Request;

class AppointmentMasterController extends Controller
{
    public function index(Request $request)
    {
        $query = AppointmentMaster::with('doctor');

        if ($request->has('DoctorId')) {
            $query->where('DoctorId', $request->DoctorId);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'DoctorId' => 'required|exists:doctors,id',
            'DayOfWeek' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'StartTime' => 'required',
            'EndTime' => 'required|after:StartTime',
            'SlotTime' => 'required|integer|min:1',
            'BookingType' => 'required|in:same day,advance',
            'SilentSlots' => 'integer|min:0',
            'MaxBookings' => 'integer|min:0',
            'isSynced' => 'boolean',
        ]);

        $item = AppointmentMaster::create($validated);

        return response()->json($item->load('doctor'), 201);
    }

    public function show(AppointmentMaster $appointmentMaster)
    {
        return response()->json($appointmentMaster->load('doctor'));
    }

    public function update(Request $request, AppointmentMaster $appointmentMaster)
    {
        $validated = $request->validate([
            'DoctorId' => 'required|exists:doctors,id',
            'DayOfWeek' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'StartTime' => 'required',
            'EndTime' => 'required|after:StartTime',
            'SlotTime' => 'required|integer|min:1',
            'BookingType' => 'required|in:same day,advance',
            'SilentSlots' => 'integer|min:0',
            'MaxBookings' => 'integer|min:0',
            'isSynced' => 'boolean',
        ]);

        $appointmentMaster->update($validated);

        return response()->json($appointmentMaster->load('doctor'));
    }

    public function destroy(AppointmentMaster $appointmentMaster)
    {
        $appointmentMaster->delete();

        return response()->json(['message' => 'Appointment schedule deleted']);
    }
}
