<?php

namespace App\Http\Controllers;

use App\Models\DoctorShareMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DoctorShareMasterController extends Controller
{
    public function index(Request $request)
    {
        $query = DoctorShareMaster::with(['department', 'service', 'doctor']);

        if ($request->has('doctorId') && $request->doctorId) {
            $query->where('doctorId', $request->doctorId);
        }

        if ($request->has('ServiceId') && $request->ServiceId) {
            $query->where('ServiceId', $request->ServiceId);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'ServiceId' => 'nullable|string|exists:services,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'DoctorShare' => 'required|numeric|min:0|max:100',
            'hospitalShare' => 'required|numeric|min:0|max:100',
        ]);

        $record = DoctorShareMaster::create($validated);

        return response()->json($record->load(['department', 'service', 'doctor']), 201);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'doctorId' => 'required|string|exists:doctors,id',
            'DepartmentId' => 'required|string|exists:departments,id',
            'DoctorShare' => 'required|numeric|min:0|max:100',
            'hospitalShare' => 'required|numeric|min:0|max:100',
            'serviceIds' => 'required|array|min:1',
            'serviceIds.*' => 'string|exists:services,id',
        ]);

        $existingServiceIds = DoctorShareMaster::where('doctorId', $validated['doctorId'])
            ->where('DepartmentId', $validated['DepartmentId'])
            ->pluck('ServiceId')
            ->toArray();

        $newServiceIds = array_diff($validated['serviceIds'], $existingServiceIds);
        $skippedCount = count($validated['serviceIds']) - count($newServiceIds);

        $records = [];
        DB::transaction(function () use ($validated, $newServiceIds, &$records) {
            foreach ($newServiceIds as $serviceId) {
                $records[] = DoctorShareMaster::create([
                    'doctorId' => $validated['doctorId'],
                    'DepartmentId' => $validated['DepartmentId'],
                    'ServiceId' => $serviceId,
                    'DoctorShare' => $validated['DoctorShare'],
                    'hospitalShare' => $validated['hospitalShare'],
                ]);
            }
        });

        $message = count($records) . ' doctor share(s) created';
        if ($skippedCount > 0) {
            $message .= ', ' . $skippedCount . ' skipped (already exist)';
        }

        return response()->json([
            'message' => $message,
            'created' => count($records),
            'skipped' => $skippedCount,
            'data' => DoctorShareMaster::with(['department', 'service', 'doctor'])
                ->whereIn('Id', array_map(fn($r) => $r->Id, $records))
                ->get(),
        ], 201);
    }

    public function show(DoctorShareMaster $doctorShareMaster)
    {
        return response()->json($doctorShareMaster->load(['department', 'service', 'doctor']));
    }

    public function update(Request $request, DoctorShareMaster $doctorShareMaster)
    {
        $validated = $request->validate([
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'ServiceId' => 'nullable|string|exists:services,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'DoctorShare' => 'sometimes|required|numeric|min:0|max:100',
            'hospitalShare' => 'sometimes|required|numeric|min:0|max:100',
        ]);

        $doctorShareMaster->update($validated);

        return response()->json($doctorShareMaster->load(['department', 'service', 'doctor']));
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'string|exists:doctor_share_master,Id',
        ]);

        DoctorShareMaster::whereIn('Id', $validated['ids'])->delete();

        return response()->json(['message' => count($validated['ids']) . ' doctor shares deleted successfully']);
    }

    public function destroy(DoctorShareMaster $doctorShareMaster)
    {
        $doctorShareMaster->delete();
        return response()->json(['message' => 'Doctor share deleted successfully']);
    }
}
