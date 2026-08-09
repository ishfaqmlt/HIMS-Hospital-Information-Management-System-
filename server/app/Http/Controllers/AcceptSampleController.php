<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcceptSampleController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('lab_cases')
            ->leftJoin('patient_visits', 'lab_cases.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'lab_cases.doctorId', '=', 'doctors.id')
            ->select(
                'lab_cases.id',
                'lab_cases.caseNo',
                'lab_cases.visitId',
                'lab_cases.billingId',
                'lab_cases.caseDate',
                'lab_cases.priority',
                'lab_cases.status',
                'lab_cases.doctorId',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.gender as patient_gender',
                'patients.dob as patient_dob',
                'patient_visits.visitNo',
                'doctors.Name as doctor_name'
            );

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('lab_cases.status', $request->status);
        } else {
            $query->whereIn('lab_cases.status', ['Sampled', 'Registered']);
        }

        if ($request->has('fromDate') && $request->fromDate) {
            $query->where('lab_cases.caseDate', '>=', $request->fromDate);
        }

        if ($request->has('toDate') && $request->toDate) {
            $query->where('lab_cases.caseDate', '<=', $request->toDate);
        }

        $rows = $query->orderBy('lab_cases.created_at', 'desc')->get();

        $cases = $rows->map(function ($row) {
            $tests = DB::table('lab_case_tests')
                ->leftJoin('lab_master_tests', 'lab_case_tests.masterTestId', '=', 'lab_master_tests.id')
                ->leftJoin('lab_required_samples', 'lab_master_tests.lab_required_sample_id', '=', 'lab_required_samples.id')
                ->where('lab_case_tests.caseId', $row->id)
                ->select(
                    'lab_case_tests.id',
                    'lab_case_tests.masterTestId',
                    'lab_case_tests.rate',
                    'lab_case_tests.testStatus',
                    'lab_case_tests.sampleStatus',
                    'lab_case_tests.rejectReason',
                    'lab_master_tests.testName',
                    'lab_master_tests.testCode',
                    'lab_required_samples.required_sample_name as requiredSampleName'
                )
                ->get();

            return [
                'id' => $row->id,
                'caseNo' => $row->caseNo,
                'visitId' => $row->visitId,
                'billingId' => $row->billingId,
                'caseDate' => $row->caseDate,
                'priority' => $row->priority,
                'status' => $row->status,
                'patient' => $row->patient_name ? [
                    'pName' => $row->patient_name,
                    'mrn' => $row->patient_mrn,
                    'mobile' => $row->patient_mobile,
                    'gender' => $row->patient_gender,
                    'dob' => $row->patient_dob,
                ] : null,
                'visit' => $row->visitNo ? [
                    'id' => $row->visitId,
                    'visitNo' => $row->visitNo,
                ] : null,
                'doctor' => $row->doctor_name ? ['id' => $row->doctorId, 'Name' => $row->doctor_name] : null,
                'tests' => $tests,
            ];
        });

        return response()->json($cases);
    }

    public function acceptSample(Request $request, $testId)
    {
        $existing = DB::table('lab_case_tests')->where('id', $testId)->first();
        if (!$existing) {
            return response()->json(['message' => 'Test not found'], 404);
        }

        DB::table('lab_case_tests')->where('id', $testId)->update([
            'sampleStatus' => 'Accepted',
            'rejectReason' => null,
            'sampledAt' => now(),
            'sampledBy' => $request->user()->id,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Sample accepted successfully']);
    }

    public function rejectSample(Request $request, $testId)
    {
        $validated = $request->validate([
            'rejectReason' => 'required|string|max:100',
        ]);

        $existing = DB::table('lab_case_tests')->where('id', $testId)->first();
        if (!$existing) {
            return response()->json(['message' => 'Test not found'], 404);
        }

        DB::table('lab_case_tests')->where('id', $testId)->update([
            'sampleStatus' => 'Rejected',
            'rejectReason' => $validated['rejectReason'],
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Sample rejected successfully']);
    }
}
