<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabCaseController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('lab_cases')
            ->leftJoin('patient_visits', 'lab_cases.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'lab_cases.doctorId', '=', 'doctors.id')
            ->leftJoin('insurance_companies', 'lab_cases.insuranceCompanyId', '=', 'insurance_companies.id')
            ->leftJoin('users', 'lab_cases.createdBy', '=', 'users.id')
            ->select(
                'lab_cases.id',
                'lab_cases.caseNo',
                'lab_cases.visitId',
                'lab_cases.billingId',
                'lab_cases.caseDate',
                'lab_cases.analyzerReffno',
                'lab_cases.insuranceCompanyId',
                'lab_cases.doctorId',
                'lab_cases.orReffBy',
                'lab_cases.priority',
                'lab_cases.status',
                'lab_cases.labCopyPrinted',
                'lab_cases.isSmsSent',
                'lab_cases.isWhatsAppSent',
                'lab_cases.isEmailSent',
                'lab_cases.remarks',
                'lab_cases.createdBy',
                'lab_cases.created_at',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.cnic as patient_cnic',
                'patients.gender as patient_gender',
                'patients.dob as patient_dob',
                'patient_visits.visitNo',
                'doctors.Name as doctor_name',
                'insurance_companies.name as insurance_name',
                'users.name as created_by_name'
            );

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lab_cases.caseNo', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('lab_cases.status', $request->status);
        }

        if ($request->has('priority') && $request->priority && $request->priority !== 'All') {
            $query->where('lab_cases.priority', $request->priority);
        }

        if ($request->has('today') && $request->today) {
            $today = now()->toDateString();
            $query->whereDate('lab_cases.caseDate', $today);
        }

        if ($request->has('fromDate') && $request->fromDate) {
            $query->where('lab_cases.caseDate', '>=', $request->fromDate);
        }

        if ($request->has('toDate') && $request->toDate) {
            $query->where('lab_cases.caseDate', '<=', $request->toDate);
        }

        if ($request->has('billingId') && $request->billingId) {
            $query->where('lab_cases.billingId', $request->billingId);
        }

        $rows = $query->orderBy('lab_cases.created_at', 'desc')->get();

        $cases = $rows->map(function ($row) {
            $tests = DB::table('lab_case_tests')
                ->leftJoin('lab_master_tests', 'lab_case_tests.masterTestId', '=', 'lab_master_tests.id')
                ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
                ->where('lab_case_tests.caseId', $row->id)
                ->select(
                    'lab_case_tests.id',
                    'lab_case_tests.masterTestId',
                    'lab_case_tests.rate',
                    'lab_case_tests.testStatus',
                    'lab_case_tests.isPerformed',
                    'lab_case_tests.isApproved',
                    'services.ServiceName as testName',
                    'services.Code as testCode'
                )
                ->get();

            $tests->each(function ($test) {
                $test->parameters = DB::table('lab_master_test_parameters')
                    ->where('master_test_id', $test->masterTestId)
                    ->where('printOnReciept', true)
                    ->orderBy('sortNo')
                    ->select('parameterName', 'units', 'defaultValue', 'normalRange')
                    ->get();
            });

            return [
                'id' => $row->id,
                'caseNo' => $row->caseNo,
                'visitId' => $row->visitId,
                'billingId' => $row->billingId,
                'caseDate' => $row->caseDate,
                'analyzerReffno' => $row->analyzerReffno,
                'insuranceCompanyId' => $row->insuranceCompanyId,
                'doctorId' => $row->doctorId,
                'orReffBy' => $row->orReffBy,
                'priority' => $row->priority,
                'status' => $row->status,
                'labCopyPrinted' => $row->labCopyPrinted,
                'isSmsSent' => $row->isSmsSent,
                'isWhatsAppSent' => $row->isWhatsAppSent,
                'isEmailSent' => $row->isEmailSent,
                'remarks' => $row->remarks,
                'createdBy' => $row->createdBy,
                'created_at' => $row->created_at,
                'patient' => $row->patient_name ? [
                    'pName' => $row->patient_name,
                    'mrn' => $row->patient_mrn,
                    'mobile' => $row->patient_mobile,
                    'cnic' => $row->patient_cnic,
                    'gender' => $row->patient_gender,
                    'dob' => $row->patient_dob,
                ] : null,
                'visit' => $row->visitNo ? [
                    'id' => $row->visitId,
                    'visitNo' => $row->visitNo,
                ] : null,
                'doctor' => $row->doctor_name ? ['id' => $row->doctorId, 'Name' => $row->doctor_name] : null,
                'insuranceCompany' => $row->insurance_name ? ['id' => $row->insuranceCompanyId, 'name' => $row->insurance_name] : null,
                'createdByUser' => $row->created_by_name ? ['id' => $row->createdBy, 'name' => $row->created_by_name] : null,
                'tests' => $tests,
            ];
        });

        return response()->json($cases);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        if (empty($data['billingId'])) $data['billingId'] = null;
        if (empty($data['insuranceCompanyId'])) $data['insuranceCompanyId'] = null;
        if (empty($data['doctorId'])) $data['doctorId'] = null;

        $validated = \Validator::make($data, [
            'visitId' => 'required|string|exists:patient_visits,id',
            'billingId' => 'nullable|string|exists:billings,id',
            'caseDate' => 'required|date',
            'analyzerReffno' => 'nullable|string|max:255',
            'insuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'orReffBy' => 'nullable|string|max:255',
            'priority' => 'required|in:Normal,Urgent',
            'remarks' => 'nullable|string',
            'tests' => 'required|array|min:1',
            'tests.*.masterTestId' => 'nullable|string',
            'tests.*.serviceId' => 'nullable|string|exists:services,id',
            'tests.*.rate' => 'required|numeric|min:0',
        ])->validate();

        // Resolve masterTestId from serviceId if not provided
        foreach ($validated['tests'] as &$test) {
            if (empty($test['masterTestId']) && !empty($test['serviceId'])) {
                $masterTest = DB::table('lab_master_tests')->where('serviceId', $test['serviceId'])->first();
                if ($masterTest) {
                    $test['masterTestId'] = $masterTest->id;
                }
            }
        }
        unset($test);

        $caseId = Str::uuid();
        $caseNo = $this->generateCaseNo();
        $analyzerReffno = $validated['analyzerReffno'] ?: $this->generateAnalyzerReffNo();

        DB::table('lab_cases')->insert([
            'id' => $caseId,
            'caseNo' => $caseNo,
            'visitId' => $validated['visitId'],
            'billingId' => $validated['billingId'] ?? null,
            'caseDate' => $validated['caseDate'],
            'analyzerReffno' => $analyzerReffno,
            'insuranceCompanyId' => $validated['insuranceCompanyId'] ?? null,
            'doctorId' => $validated['doctorId'] ?? null,
            'orReffBy' => $validated['orReffBy'] ?? null,
            'priority' => $validated['priority'],
            'status' => 'Registered',
            'remarks' => $validated['remarks'] ?? null,
            'createdBy' => Auth::id(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($validated['tests'] as $test) {
            if (empty($test['masterTestId'])) continue;
            DB::table('lab_case_tests')->insert([
                'id' => Str::uuid(),
                'caseId' => $caseId,
                'masterTestId' => $test['masterTestId'],
                'serviceId' => $test['serviceId'] ?? null,
                'rate' => $test['rate'],
                'testStatus' => 'Pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Mark billing_detail as served
            if (!empty($validated['billingId']) && !empty($test['serviceId'])) {
                DB::table('billing_details')
                    ->where('BillingId', $validated['billingId'])
                    ->where('serviceId', $test['serviceId'])
                    ->update(['isServed' => true, 'updated_at' => now()]);
            }
        }

        $case = $this->getCaseById($caseId);

        return response()->json($case, 201);
    }

    public function show($id)
    {
        $case = $this->getCaseById($id);

        if (!$case) {
            return response()->json(['message' => 'Lab case not found'], 404);
        }

        return response()->json($case);
    }

    public function update(Request $request, $id)
    {
        $existing = DB::table('lab_cases')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['message' => 'Lab case not found'], 404);
        }

        $data = $request->all();
        if (empty($data['billingId'])) $data['billingId'] = null;
        if (empty($data['insuranceCompanyId'])) $data['insuranceCompanyId'] = null;
        if (empty($data['doctorId'])) $data['doctorId'] = null;

        $validated = \Validator::make($data, [
            'visitId' => 'required|string|exists:patient_visits,id',
            'billingId' => 'nullable|string|exists:billings,id',
            'caseDate' => 'required|date',
            'analyzerReffno' => 'nullable|string|max:255',
            'insuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'doctorId' => 'nullable|string|exists:doctors,id',
            'orReffBy' => 'nullable|string|max:255',
            'priority' => 'required|in:Normal,Urgent',
            'status' => 'required|in:Registered,Sampled,InProcess,Reported,Approved,Cancelled',
            'labCopyPrinted' => 'nullable|boolean',
            'isSmsSent' => 'nullable|boolean',
            'isWhatsAppSent' => 'nullable|boolean',
            'isEmailSent' => 'nullable|boolean',
            'remarks' => 'nullable|string',
        ])->validated();

        $updateData = array_filter([
            'visitId' => $validated['visitId'],
            'billingId' => $validated['billingId'] ?? null,
            'caseDate' => $validated['caseDate'],
            'analyzerReffno' => $validated['analyzerReffno'] ?? null,
            'insuranceCompanyId' => $validated['insuranceCompanyId'] ?? null,
            'doctorId' => $validated['doctorId'] ?? null,
            'orReffBy' => $validated['orReffBy'] ?? null,
            'priority' => $validated['priority'],
            'status' => $validated['status'],
            'labCopyPrinted' => $validated['labCopyPrinted'] ?? $existing->labCopyPrinted,
            'isSmsSent' => $validated['isSmsSent'] ?? $existing->isSmsSent,
            'isWhatsAppSent' => $validated['isWhatsAppSent'] ?? $existing->isWhatsAppSent,
            'isEmailSent' => $validated['isEmailSent'] ?? $existing->isEmailSent,
            'remarks' => $validated['remarks'] ?? null,
            'updatedBy' => Auth::id(),
            'updated_at' => now(),
        ], fn($v) => $v !== null);

        DB::table('lab_cases')->where('id', $id)->update($updateData);

        $case = $this->getCaseById($id);

        return response()->json($case);
    }

    public function destroy($id)
    {
        $existing = DB::table('lab_cases')->where('id', $id)->first();
        if (!$existing) {
            return response()->json(['message' => 'Lab case not found'], 404);
        }

        // Set billing_details.isServed=0 before deleting
        if (!empty($existing->billingId)) {
            $serviceIds = DB::table('lab_case_tests')
                ->where('caseId', $id)
                ->whereNotNull('serviceId')
                ->pluck('serviceId')
                ->toArray();

            if (count($serviceIds) > 0) {
                DB::table('billing_details')
                    ->where('BillingId', $existing->billingId)
                    ->whereIn('serviceId', $serviceIds)
                    ->update(['isServed' => false, 'updated_at' => now()]);
            }
        }

        DB::table('lab_case_tests')->where('caseId', $id)->delete();
        DB::table('lab_cases')->where('id', $id)->delete();

        return response()->json(['message' => 'Lab case deleted successfully']);
    }

    public function removeTests(Request $request, $caseId)
    {
        $validated = $request->validate([
            'testIds' => 'required|array|min:1',
            'testIds.*' => 'required|string|exists:lab_case_tests,id',
        ]);

        $case = DB::table('lab_cases')->where('id', $caseId)->first();
        if (!$case) {
            return response()->json(['message' => 'Lab case not found'], 404);
        }

        // Get serviceIds of tests being removed
        $removedServiceIds = DB::table('lab_case_tests')
            ->where('caseId', $caseId)
            ->whereIn('id', $validated['testIds'])
            ->whereNotNull('serviceId')
            ->pluck('serviceId')
            ->toArray();

        DB::table('lab_case_tests')
            ->where('caseId', $caseId)
            ->whereIn('id', $validated['testIds'])
            ->delete();

        // Set billing_details.isServed=0 for removed services
        if (!empty($case->billingId) && count($removedServiceIds) > 0) {
            DB::table('billing_details')
                ->where('BillingId', $case->billingId)
                ->whereIn('serviceId', $removedServiceIds)
                ->update(['isServed' => false, 'updated_at' => now()]);
        }

        $case = $this->getCaseById($caseId);
        return response()->json($case);
    }

    public function addTests(Request $request, $caseId)
    {
        $validated = $request->validate([
            'tests' => 'required|array|min:1',
            'tests.*.masterTestId' => 'nullable|string',
            'tests.*.serviceId' => 'nullable|string|exists:services,id',
            'tests.*.rate' => 'required|numeric|min:0',
        ]);

        $case = DB::table('lab_cases')->where('id', $caseId)->first();
        if (!$case) {
            return response()->json(['message' => 'Lab case not found'], 404);
        }

        // Resolve masterTestId from serviceId if not provided
        foreach ($validated['tests'] as &$test) {
            if (empty($test['masterTestId']) && !empty($test['serviceId'])) {
                $masterTest = DB::table('lab_master_tests')->where('serviceId', $test['serviceId'])->first();
                if ($masterTest) {
                    $test['masterTestId'] = $masterTest->id;
                }
            }
        }
        unset($test);

        foreach ($validated['tests'] as $test) {
            if (empty($test['masterTestId'])) continue;
            $caseTestId = Str::uuid();
            DB::table('lab_case_tests')->insert([
                'id' => $caseTestId,
                'caseId' => $caseId,
                'masterTestId' => $test['masterTestId'],
                'serviceId' => $test['serviceId'] ?? null,
                'rate' => $test['rate'],
                'testStatus' => 'Pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Mark billing_detail as served
            if (!empty($case->billingId) && !empty($test['serviceId'])) {
                DB::table('billing_details')
                    ->where('BillingId', $case->billingId)
                    ->where('serviceId', $test['serviceId'])
                    ->update(['isServed' => true, 'updated_at' => now()]);
            }
        }

        $case = $this->getCaseById($caseId);
        return response()->json($case, 201);
    }

    public function updateTestStatus(Request $request, $testId)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Sampled,InProcess,Completed,Approved,Cancelled',
            'sampledAt' => 'nullable|date',
            'performedAt' => 'nullable|date',
            'approvedAt' => 'nullable|date',
            'showInterpretation' => 'nullable|boolean',
            'isPrinted' => 'nullable|boolean',
        ]);

        $existing = DB::table('lab_case_tests')->where('id', $testId)->first();
        if (!$existing) {
            return response()->json(['message' => 'Lab case test not found'], 404);
        }

        $updateData = ['testStatus' => $validated['status'], 'updated_at' => now()];

        if ($validated['status'] === 'Sampled') {
            $updateData['sampledAt'] = $validated['sampledAt'] ?? now();
            $updateData['sampledBy'] = Auth::id();
            $updateData['isPerformed'] = false;
        }

        if ($validated['status'] === 'InProcess') {
            $updateData['isPerformed'] = true;
            $updateData['performedAt'] = $validated['performedAt'] ?? now();
            $updateData['performedBy'] = Auth::id();
        }

        if ($validated['status'] === 'Approved') {
            $updateData['isApproved'] = true;
            $updateData['approvedAt'] = $validated['approvedAt'] ?? now();
            $updateData['approvedBy'] = Auth::id();
        }

        if (isset($validated['showInterpretation'])) {
            $updateData['showInterpretation'] = $validated['showInterpretation'];
        }

        if (isset($validated['isPrinted'])) {
            $updateData['isPrinted'] = $validated['isPrinted'];
            $updateData['printedAt'] = $validated['isPrinted'] ? now() : null;
        }

        DB::table('lab_case_tests')->where('id', $testId)->update($updateData);

        $test = DB::table('lab_case_tests')
            ->leftJoin('lab_master_tests', 'lab_case_tests.masterTestId', '=', 'lab_master_tests.id')
            ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
            ->where('lab_case_tests.id', $testId)
            ->select('lab_case_tests.*', 'services.ServiceName as testName', 'services.Code as testCode')
            ->first();

        return response()->json($test);
    }

    public function storeResults(Request $request, $testId)
    {
        $validated = $request->validate([
            'results' => 'required|array|min:1',
            'results.*.parameterId' => 'required|string|exists:lab_master_test_parameters,id',
            'results.*.result' => 'nullable|string',
            'results.*.units' => 'nullable|string',
            'results.*.paramStatus' => 'required|in:N,A,C',
            'results.*.normalRange' => 'nullable|string',
        ]);

        $existing = DB::table('lab_case_tests')->where('id', $testId)->first();
        if (!$existing) {
            return response()->json(['message' => 'Lab case test not found'], 404);
        }

        DB::table('lab_case_test_results')->where('caseTestId', $testId)->delete();

        foreach ($validated['results'] as $result) {
            DB::table('lab_case_test_results')->insert([
                'id' => Str::uuid(),
                'caseTestId' => $testId,
                'parameterId' => $result['parameterId'],
                'result' => $result['result'] ?? null,
                'units' => $result['units'] ?? null,
                'paramStatus' => $result['paramStatus'],
                'normalRange' => $result['normalRange'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $results = DB::table('lab_case_test_results')
            ->leftJoin('lab_master_test_parameters', 'lab_case_test_results.parameterId', '=', 'lab_master_test_parameters.id')
            ->where('lab_case_test_results.caseTestId', $testId)
            ->select(
                'lab_case_test_results.*',
                'lab_master_test_parameters.parameterName',
                'lab_master_test_parameters.decimal'
            )
            ->orderBy('lab_master_test_parameters.sortNo')
            ->get();

        return response()->json($results);
    }

    public function getResults($testId)
    {
        $results = DB::table('lab_case_test_results')
            ->leftJoin('lab_master_test_parameters', 'lab_case_test_results.parameterId', '=', 'lab_master_test_parameters.id')
            ->where('lab_case_test_results.caseTestId', $testId)
            ->select(
                'lab_case_test_results.*',
                'lab_master_test_parameters.parameterName',
                'lab_master_test_parameters.decimal',
                'lab_master_test_parameters.sortNo'
            )
            ->orderBy('lab_master_test_parameters.sortNo')
            ->get();

        return response()->json($results);
    }

    private function getCaseById($id)
    {
        $row = DB::table('lab_cases')
            ->leftJoin('patient_visits', 'lab_cases.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'lab_cases.doctorId', '=', 'doctors.id')
            ->leftJoin('insurance_companies', 'lab_cases.insuranceCompanyId', '=', 'insurance_companies.id')
            ->leftJoin('users', 'lab_cases.createdBy', '=', 'users.id')
            ->where('lab_cases.id', $id)
            ->select(
                'lab_cases.*',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.cnic as patient_cnic',
                'patients.gender as patient_gender',
                'patients.dob as patient_dob',
                'patients.gName as patient_gName',
                'patient_visits.visitNo',
                'doctors.Name as doctor_name',
                'insurance_companies.name as insurance_name',
                'users.name as created_by_name'
            )
            ->first();

        if (!$row) {
            return null;
        }

        $tests = DB::table('lab_case_tests')
            ->leftJoin('lab_master_tests', 'lab_case_tests.masterTestId', '=', 'lab_master_tests.id')
            ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
            ->leftJoin('lab_required_samples', 'lab_master_tests.lab_required_sample_id', '=', 'lab_required_samples.id')
            ->where('lab_case_tests.caseId', $id)
            ->select(
                'lab_case_tests.*',
                'services.ServiceName as testName',
                'services.Code as testCode',
                'lab_master_tests.expectedTime',
                'lab_master_tests.interpretation',
                'lab_required_samples.required_sample_name'
            )
            ->get();

        foreach ($tests as &$test) {
            $test->results = DB::table('lab_case_test_results')
                ->leftJoin('lab_master_test_parameters', 'lab_case_test_results.parameterId', '=', 'lab_master_test_parameters.id')
                ->where('lab_case_test_results.caseTestId', $test->id)
                ->select(
                    'lab_case_test_results.*',
                    'lab_master_test_parameters.parameterName',
                    'lab_master_test_parameters.decimal',
                    'lab_master_test_parameters.sortNo'
                )
                ->orderBy('lab_master_test_parameters.sortNo')
                ->get();
        }

        return [
            'id' => $row->id,
            'caseNo' => $row->caseNo,
            'visitId' => $row->visitId,
            'billingId' => $row->billingId,
            'caseDate' => $row->caseDate,
            'analyzerReffno' => $row->analyzerReffno,
            'insuranceCompanyId' => $row->insuranceCompanyId,
            'doctorId' => $row->doctorId,
            'orReffBy' => $row->orReffBy,
            'priority' => $row->priority,
            'status' => $row->status,
            'labCopyPrinted' => $row->labCopyPrinted,
            'isSmsSent' => $row->isSmsSent,
            'isWhatsAppSent' => $row->isWhatsAppSent,
            'isEmailSent' => $row->isEmailSent,
            'remarks' => $row->remarks,
            'createdBy' => $row->createdBy,
            'updatedBy' => $row->updatedBy,
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
            'patient' => $row->patient_name ? [
                'pName' => $row->patient_name,
                'mrn' => $row->patient_mrn,
                'mobile' => $row->patient_mobile,
                'cnic' => $row->patient_cnic,
                'gender' => $row->patient_gender,
                'dob' => $row->patient_dob,
                'gName' => $row->patient_gName,
            ] : null,
            'visit' => $row->visitNo ? [
                'id' => $row->visitId,
                'visitNo' => $row->visitNo,
            ] : null,
            'doctor' => $row->doctor_name ? ['id' => $row->doctorId, 'Name' => $row->doctor_name] : null,
            'insuranceCompany' => $row->insurance_name ? ['id' => $row->insuranceCompanyId, 'name' => $row->insurance_name] : null,
            'createdByUser' => $row->created_by_name ? ['id' => $row->createdBy, 'name' => $row->created_by_name] : null,
            'tests' => $tests,
        ];
    }

    private function generateCaseNo()
    {
        $prefix = 'LAB-' . date('my') . '-';
        $last = DB::table('lab_cases')
            ->where('caseNo', 'like', $prefix . '%')
            ->orderByDesc('caseNo')
            ->value('caseNo');

        if ($last) {
            $seq = intval(substr($last, strlen($prefix))) + 1;
        } else {
            $seq = 0;
        }

        return $prefix . $seq;
    }

    private function generateAnalyzerReffNo()
    {
        $prefix = date('my');
        $last = DB::table('lab_cases')
            ->where('analyzerReffno', 'like', $prefix . '%')
            ->orderByDesc('analyzerReffno')
            ->value('analyzerReffno');

        if ($last) {
            $seq = intval(substr($last, strlen($prefix))) + 1;
        } else {
            $seq = 0;
        }

        return $prefix . $seq;
    }

    public function waitingInvoices(Request $request)
    {
        $today = now()->toDateString();

        $labDeptId = DB::table('departments')
            ->where('DepartmentName', 'LIKE', '%Laboratory%')
            ->value('id');

        if (!$labDeptId) {
            return response()->json([]);
        }

        $rows = DB::table('billings as b')
            ->join('billing_details as bd', 'b.id', '=', 'bd.BillingId', 'inner')
            ->leftJoin('patient_visits as pv', 'b.visitId', '=', 'pv.id')
            ->leftJoin('patients as p', 'pv.patientId', '=', 'p.id')
            ->leftJoin('doctors as doc', 'b.DoctorId', '=', 'doc.id')
            ->leftJoin('services as s', 'bd.serviceId', '=', 's.id')
            ->whereDate('b.InvoiceDate', $today)
            ->where('b.DepartmentId', $labDeptId)
            ->where('bd.isServed', false)
            ->where('b.PaymentStatus', '!=', 'Cancelled')
            ->select(
                'b.id as billingId',
                'b.InvoiceNo',
                'b.InvoiceDate',
                'b.TotalAmount',
                'b.PaymentStatus',
                'pv.visitNo',
                'pv.id as visitId',
                'p.pName as patient_name',
                'p.mrn as patient_mrn',
                'p.mobile as patient_mobile',
                'doc.Name as doctor_name',
                'b.DoctorId',
                'bd.serviceId',
                's.ServiceName as service_name',
                's.Code as service_code',
                'bd.Rate',
                'bd.Amount',
                'bd.Qty'
            )
            ->orderBy('b.InvoiceDate', 'desc')
            ->get();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $rows = $rows->filter(function ($row) use ($search) {
                return stripos($row->InvoiceNo, $search) !== false
                    || stripos($row->patient_name, $search) !== false
                    || stripos($row->patient_mrn, $search) !== false;
            });
        }

        $grouped = [];
        foreach ($rows as $row) {
            $invNo = $row->InvoiceNo;
            if (!isset($grouped[$invNo])) {
                $grouped[$invNo] = [
                    'billingId' => $row->billingId,
                    'invoiceNo' => $row->InvoiceNo,
                    'invoiceDate' => $row->InvoiceDate,
                    'totalAmount' => $row->TotalAmount,
                    'paymentStatus' => $row->PaymentStatus,
                    'visitNo' => $row->visitNo,
                    'visitId' => $row->visitId,
                    'doctorId' => $row->DoctorId,
                    'patient' => [
                        'pName' => $row->patient_name,
                        'mrn' => $row->patient_mrn,
                        'mobile' => $row->patient_mobile,
                    ],
                    'doctor' => $row->doctor_name ? ['id' => $row->DoctorId, 'Name' => $row->doctor_name] : null,
                    'tests' => [],
                ];
            }
            $grouped[$invNo]['tests'][] = [
                'serviceId' => $row->serviceId,
                'serviceName' => $row->service_name,
                'serviceCode' => $row->service_code,
                'rate' => $row->Rate,
                'amount' => $row->Amount,
                'qty' => $row->Qty,
            ];
        }

        return response()->json(array_values($grouped));
    }
}
