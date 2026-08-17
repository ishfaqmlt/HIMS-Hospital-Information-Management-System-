<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestPerformController extends Controller
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
                'lab_cases.analyzerReffno',
                'lab_cases.orReffBy',
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
            $query->where('lab_cases.status', 'InProcess');
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
                ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
                ->leftJoin('lab_required_samples', 'lab_master_tests.lab_required_sample_id', '=', 'lab_required_samples.id')
                ->where('lab_case_tests.caseId', $row->id)
                ->select(
                    'lab_case_tests.id',
                    'lab_case_tests.masterTestId',
                    'lab_case_tests.rate',
                    'lab_case_tests.testStatus',
                    'lab_case_tests.sampleStatus',
                    'lab_case_tests.rejectReason',
                    'lab_case_tests.sampledAt',
                    'lab_case_tests.isPerformed',
                    'lab_case_tests.isApproved',
                    'lab_case_tests.isPrinted',
                    'lab_case_tests.printedAt',
                    'lab_case_tests.performedBy',
                    'lab_case_tests.performedAt',
                    'services.ServiceName as testName',
                    'services.Code as testCode',
                    'lab_master_tests.testSort',
                    'lab_required_samples.required_sample_name as requiredSampleName'
                )
                ->orderByRaw('COALESCE(lab_master_tests.testSort, 999999) ASC')
                ->get();

            return [
                'id' => $row->id,
                'caseNo' => $row->caseNo,
                'visitId' => $row->visitId,
                'billingId' => $row->billingId,
                'caseDate' => $row->caseDate,
                'priority' => $row->priority,
                'status' => $row->status,
                'analyzerReffno' => $row->analyzerReffno,
                'orReffBy' => $row->orReffBy,
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

    public function getParameters(Request $request, $testId)
    {
        $masterTestId = $request->input('master_test_id');

        if (!$masterTestId) {
            $caseTest = DB::table('lab_case_tests')->where('id', $testId)->first();
            if ($caseTest) {
                $masterTestId = $caseTest->masterTestId;
            }
        }

        if (!$masterTestId) {
            return response()->json([]);
        }

        $parameters = DB::table('lab_master_test_parameters')
            ->leftJoin('lab_sub_headers', 'lab_master_test_parameters.sub_headers_id', '=', 'lab_sub_headers.id')
            ->where('lab_master_test_parameters.master_test_id', $masterTestId)
            ->select(
                'lab_master_test_parameters.id',
                'lab_master_test_parameters.parameterName',
                'lab_master_test_parameters.defaultValue',
                'lab_master_test_parameters.units',
                'lab_master_test_parameters.decimal',
                'lab_master_test_parameters.normalRange',
                'lab_master_test_parameters.analyzerCode',
                'lab_master_test_parameters.sortNo',
                'lab_master_test_parameters.printOnReciept',
                'lab_sub_headers.sub_header_name'
            )
            ->orderBy('lab_master_test_parameters.sortNo')
            ->get();

        $existingResults = DB::table('lab_case_test_results')
            ->where('caseTestId', $testId)
            ->get()
            ->keyBy('parameterId');

        $data = $parameters->map(function ($param) use ($existingResults) {
            $existing = $existingResults->get($param->id);
            $hasStoredResult = $existing && isset($existing->result) && trim((string)$existing->result) !== '';
            $defaultVal = isset($param->defaultValue) ? trim((string)$param->defaultValue) : '';
            $hasDefault = $defaultVal !== '';

            if ($hasStoredResult) {
                $finalResult = $existing->result;
                $isPrint = true;
            } elseif ($hasDefault) {
                $finalResult = $param->defaultValue;
                $isPrint = true;
            } else {
                $finalResult = '';
                $isPrint = false;
            }

            return [
                'id' => $param->id,
                'parameterName' => $param->parameterName,
                'pCode' => $param->analyzerCode ?? '',
                'subHeaderName' => $param->sub_header_name ?? '',
                'units' => $hasStoredResult ? ($existing->units ?? ($param->units ?? '')) : ($param->units ?? ''),
                'result' => $finalResult,
                'paramStatus' => $hasStoredResult ? ($existing->paramStatus ?? 'N') : 'N',
                'normalRange' => $hasStoredResult ? ($existing->normalRange ?? ($param->normalRange ?? '')) : ($param->normalRange ?? ''),
                'decimal' => $param->decimal ?? 0,
                'sortNo' => $param->sortNo ?? 0,
                'print' => $isPrint,
            ];
        });

        return response()->json($data);
    }
}
