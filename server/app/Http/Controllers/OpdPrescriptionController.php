<?php

namespace App\Http\Controllers;

use App\Models\OpdPrescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OpdPrescriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('opd_prescriptions')
            ->leftJoin('patient_visits', 'opd_prescriptions.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'opd_prescriptions.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'opd_prescriptions.doctorId', '=', 'doctors.id')
            ->select(
                'opd_prescriptions.*',
                'patient_visits.visitNo',
                'patients.mrn',
                'patients.pName as patientName',
                'patients.gender',
                'patients.dob',
                'patients.mobile',
                'doctors.Name as doctorName'
            );

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('opd_prescriptions.prescriptionNo', 'like', "%{$search}%")
                  ->orWhere('patient_visits.visitNo', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mobile', 'like', "%{$search}%");
            });
        }

        if ($request->has('visitId') && !empty($request->visitId)) {
            $query->where('opd_prescriptions.visitId', $request->visitId);
        }

        if ($request->has('patientId') && !empty($request->patientId)) {
            $query->where('opd_prescriptions.patientId', $request->patientId);
        }

        if ($request->has('doctorId') && !empty($request->doctorId)) {
            $query->where('opd_prescriptions.doctorId', $request->doctorId);
        }

        if ($request->has('status') && !empty($request->status)) {
            $query->where('opd_prescriptions.status', $request->status);
        }

        if ($request->boolean('excludeToday') || $request->boolean('exclude_today')) {
            $today = Carbon::today()->toDateString();
            $query->where(function ($q) use ($today) {
                $q->where(function ($sub) use ($today) {
                    $sub->whereNotNull('opd_prescriptions.presc_date')
                        ->whereDate('opd_prescriptions.presc_date', '<', $today);
                })->orWhere(function ($sub) use ($today) {
                    $sub->whereNull('opd_prescriptions.presc_date')
                        ->whereDate('opd_prescriptions.created_at', '<', $today);
                });
            });
        }

        if ($request->filled('excludeVisitId')) {
            $query->where('opd_prescriptions.visitId', '!=', $request->excludeVisitId);
        }

        if ($request->filled('excludePrescriptionId')) {
            $query->where('opd_prescriptions.id', '!=', $request->excludePrescriptionId);
        }

        $prescriptions = $query->orderBy('opd_prescriptions.created_at', 'desc')->get();

        return response()->json($prescriptions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitId' => 'required|string',
            'patientId' => 'required|string',
            'doctorId' => 'required',
            'presc_date' => 'nullable',
            'advice' => 'nullable|string',
            'followUpDate' => 'nullable',
            'status' => 'nullable|in:pending,In Process,completed',
        ]);

        // 1. Check if prescription already registered for this visit or for this patient today
        $existing = DB::table('opd_prescriptions')
            ->where(function ($q) use ($validated) {
                $q->where('visitId', $validated['visitId'])
                  ->orWhere(function ($q2) use ($validated) {
                      $q2->where('patientId', $validated['patientId'])
                         ->whereDate('presc_date', now()->toDateString());
                  });
            })
            ->first();

        if ($existing) {
            return response()->json($existing, 200);
        }

        $id = (string) Str::uuid();
        $prescriptionNo = OpdPrescription::generatePrescriptionNo();

        $prescDate = !empty($validated['presc_date']) ? Carbon::parse($validated['presc_date'])->toDateTimeString() : now();
        $followUpDate = !empty($validated['followUpDate']) ? Carbon::parse($validated['followUpDate'])->toDateString() : null;

        $data = [
            'id' => $id,
            'prescriptionNo' => $prescriptionNo,
            'visitId' => $validated['visitId'],
            'patientId' => $validated['patientId'],
            'doctorId' => $validated['doctorId'],
            'presc_date' => $prescDate,
            'advice' => $validated['advice'] ?? '',
            'followUpDate' => $followUpDate,
            'status' => $validated['status'] ?? 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('opd_prescriptions')->insert($data);

        $prescription = DB::table('opd_prescriptions')->where('id', $id)->first();

        return response()->json($prescription, 201);
    }

    public function show($id)
    {
        $prescription = DB::table('opd_prescriptions')
            ->leftJoin('patient_visits', 'opd_prescriptions.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'opd_prescriptions.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'opd_prescriptions.doctorId', '=', 'doctors.id')
            ->select(
                'opd_prescriptions.*',
                'patient_visits.visitNo',
                'patients.mrn',
                'patients.pName as patientName',
                'doctors.Name as doctorName'
            )
            ->where('opd_prescriptions.id', $id)
            ->orWhere('opd_prescriptions.prescriptionNo', $id)
            ->first();

        if (!$prescription) {
            return response()->json(['message' => 'Prescription not found'], 404);
        }

        return response()->json($prescription);
    }

    public function update(Request $request, $id)
    {
        $prescription = DB::table('opd_prescriptions')->where('id', $id)->first();

        if (!$prescription) {
            return response()->json(['message' => 'Prescription not found'], 404);
        }

        $validated = $request->validate([
            'visitId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'doctorId' => 'nullable',
            'presc_date' => 'nullable',
            'advice' => 'nullable|string',
            'followUpDate' => 'nullable',
            'status' => 'nullable|in:pending,In Process,completed',
        ]);

        $prescDate = !empty($validated['presc_date']) ? Carbon::parse($validated['presc_date'])->toDateTimeString() : $prescription->presc_date;
        $followUpDate = !empty($validated['followUpDate']) ? Carbon::parse($validated['followUpDate'])->toDateString() : $prescription->followUpDate;

        $data = [
            'visitId' => $validated['visitId'] ?? $prescription->visitId,
            'patientId' => $validated['patientId'] ?? $prescription->patientId,
            'doctorId' => $validated['doctorId'] ?? $prescription->doctorId,
            'presc_date' => $prescDate,
            'advice' => $validated['advice'] ?? $prescription->advice,
            'followUpDate' => $followUpDate,
            'status' => $validated['status'] ?? $prescription->status,
            'updated_at' => now(),
        ];

        DB::table('opd_prescriptions')->where('id', $id)->update($data);

        $updated = DB::table('opd_prescriptions')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        $deleted = DB::table('opd_prescriptions')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Prescription not found'], 404);
        }

        return response()->json(['message' => 'Prescription deleted successfully']);
    }
}
