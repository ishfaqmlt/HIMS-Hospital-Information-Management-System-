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
            $updateData = ['updated_at' => now()];
            if (array_key_exists('advice', $validated)) {
                $updateData['advice'] = $validated['advice'] ?? '';
            }
            if (array_key_exists('followUpDate', $validated)) {
                $updateData['followUpDate'] = !empty($validated['followUpDate']) ? Carbon::parse($validated['followUpDate'])->toDateString() : null;
            }
            if (!empty($validated['status'])) {
                $updateData['status'] = $validated['status'];
            }
            DB::table('opd_prescriptions')->where('id', $existing->id)->update($updateData);
            $existing = DB::table('opd_prescriptions')->where('id', $existing->id)->first();
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
                'patients.gender',
                'patients.dob',
                'patients.mobile',
                'patients.gName as guardianName',
                'doctors.Name as doctorName',
                'doctors.Qualification as doctorQualification',
                'doctors.Specialization as doctorDept',
                'doctors.RegistrationNo as doctorPmdc',
                'doctors.Stamp as doctorStamp'
            )
            ->where('opd_prescriptions.id', $id)
            ->orWhere('opd_prescriptions.prescriptionNo', $id)
            ->first();

        if (!$prescription) {
            return response()->json(['message' => 'Prescription not found'], 404);
        }

        // Associated clinical details
        $symptoms = DB::table('opd_symptoms')
            ->leftJoin('master_symptoms', 'opd_symptoms.symptomId', '=', 'master_symptoms.id')
            ->where('opd_symptoms.prescriptionId', $prescription->id)
            ->pluck('master_symptoms.name')
            ->filter()
            ->values();

        $exams = DB::table('opd_physical_exams')
            ->leftJoin('master_physical_exam', 'opd_physical_exams.physicalExamId', '=', 'master_physical_exam.id')
            ->where('opd_physical_exams.prescriptionId', $prescription->id)
            ->pluck('master_physical_exam.name')
            ->filter()
            ->values();

        $diagnoses = DB::table('opd_diagnoses')
            ->leftJoin('master_diagnosis', 'opd_diagnoses.diagnosisId', '=', 'master_diagnosis.id')
            ->where('opd_diagnoses.prescriptionId', $prescription->id)
            ->pluck('master_diagnosis.name')
            ->filter()
            ->values();

        $investigations = DB::table('opd_investigations')
            ->leftJoin('services', 'opd_investigations.serviceId', '=', 'services.id')
            ->leftJoin('departments', 'opd_investigations.departmentId', '=', 'departments.id')
            ->select(
                'opd_investigations.*',
                'services.ServiceName as serviceName',
                'services.Code as serviceCode',
                'departments.DepartmentName as departmentName'
            )
            ->where('opd_investigations.prescriptionId', $prescription->id)
            ->get();

        $medications = DB::table('opd_medications')
            ->where('opd_medications.prescriptionId', $prescription->id)
            ->orderBy('opd_medications.created_at', 'asc')
            ->get();

        $vitals = DB::table('patient_vitals')->where('visitId', $prescription->visitId)->first();

        return response()->json([
            'prescription' => $prescription,
            'symptoms' => $symptoms,
            'exams' => $exams,
            'diagnoses' => $diagnoses,
            'investigations' => $investigations,
            'medications' => $medications,
            'vitals' => $vitals,
        ]);
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
        $followUpDate = array_key_exists('followUpDate', $validated)
            ? (!empty($validated['followUpDate']) ? Carbon::parse($validated['followUpDate'])->toDateString() : null)
            : $prescription->followUpDate;
        $advice = array_key_exists('advice', $validated)
            ? ($validated['advice'] ?? '')
            : $prescription->advice;

        $data = [
            'visitId' => $validated['visitId'] ?? $prescription->visitId,
            'patientId' => $validated['patientId'] ?? $prescription->patientId,
            'doctorId' => $validated['doctorId'] ?? $prescription->doctorId,
            'presc_date' => $prescDate,
            'advice' => $advice,
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
