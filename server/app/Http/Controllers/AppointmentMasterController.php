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
            'Days' => 'required|array|min:1',
            'Days.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'StartTime' => 'required',
            'EndTime' => 'required',
            'SlotTime' => 'required|integer|min:1',
            'BookingType' => 'required|in:same day,advance',
            'SilentSlots' => 'integer|min:0',
            'MaxBookings' => 'integer|min:0',
            'isSynced' => 'boolean',
        ]);

        $created = null;
        foreach ($validated['Days'] as $day) {
            $item = AppointmentMaster::create([
                'DoctorId' => $validated['DoctorId'],
                'DayOfWeek' => $day,
                'StartTime' => $validated['StartTime'],
                'EndTime' => $validated['EndTime'],
                'SlotTime' => $validated['SlotTime'],
                'BookingType' => $validated['BookingType'],
                'SilentSlots' => $validated['SilentSlots'] ?? 0,
                'MaxBookings' => $validated['MaxBookings'] ?? 0,
                'isSynced' => $validated['isSynced'] ?? false,
            ]);
            if (!$created) {
                $created = $item;
            }
        }

        return response()->json($created->load('doctor'), 201);
    }

    public function show(AppointmentMaster $appointmentMaster)
    {
        return response()->json($appointmentMaster->load('doctor'));
    }

    public function update(Request $request, AppointmentMaster $appointmentMaster)
    {
        $validated = $request->validate([
            'DoctorId' => 'required|exists:doctors,id',
            'Days' => 'required|array|min:1',
            'Days.*' => 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'StartTime' => 'required',
            'EndTime' => 'required',
            'SlotTime' => 'required|integer|min:1',
            'BookingType' => 'required|in:same day,advance',
            'SilentSlots' => 'integer|min:0',
            'MaxBookings' => 'integer|min:0',
            'isSynced' => 'boolean',
        ]);

        AppointmentMaster::where('DoctorId', $appointmentMaster->DoctorId)
            ->where('StartTime', $appointmentMaster->StartTime)
            ->where('EndTime', $appointmentMaster->EndTime)
            ->delete();

        $created = null;
        foreach ($validated['Days'] as $day) {
            $item = AppointmentMaster::create([
                'DoctorId' => $validated['DoctorId'],
                'DayOfWeek' => $day,
                'StartTime' => $validated['StartTime'],
                'EndTime' => $validated['EndTime'],
                'SlotTime' => $validated['SlotTime'],
                'BookingType' => $validated['BookingType'],
                'SilentSlots' => $validated['SilentSlots'] ?? 0,
                'MaxBookings' => $validated['MaxBookings'] ?? 0,
                'isSynced' => $validated['isSynced'] ?? false,
            ]);
            if (!$created) {
                $created = $item;
            }
        }

        return response()->json($created->load('doctor'));
    }

    public function destroy(AppointmentMaster $appointmentMaster)
    {
        AppointmentMaster::where('DoctorId', $appointmentMaster->DoctorId)
            ->where('StartTime', $appointmentMaster->StartTime)
            ->where('EndTime', $appointmentMaster->EndTime)
            ->delete();

        return response()->json(['message' => 'Appointment schedule deleted']);
    }
}
