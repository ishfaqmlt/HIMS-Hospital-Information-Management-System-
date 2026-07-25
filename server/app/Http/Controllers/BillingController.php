<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('billings')
            ->leftJoin('patient_visits', 'billings.mrn', '=', 'patient_visits.mrn')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.patientId')
            ->leftJoin('patient_types', 'billings.patientTypeId', '=', 'patient_types.id')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
            ->select(
                'billings.Id',
                'billings.InvoiceNo',
                'billings.InvoiceDate',
                'billings.mrn',
                'billings.patientTypeId',
                'billings.DepartmentId',
                'billings.DoctorId',
                'billings.SubTotal',
                'billings.Discount',
                'billings.TotalAmount',
                'billings.PaymentStatus',
                'billings.BillType',
                'billings.Notes',
                'billings.printedCount',
                'patients.pName as patient_name',
                'patients.patientId as patient_patient_id',
                'patients.mobile as patient_mobile',
                'patients.cnic as patient_cnic',
                'patients.gender as patient_gender',
                'patient_types.patientType as patientType_name',
                'departments.DepartmentName as department_name',
                'doctors.Name as doctor_name'
            );

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('billings.InvoiceNo', 'like', "%{$search}%")
                  ->orWhere('billings.mrn', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.patientId', 'like', "%{$search}%");
            });
        }

        if ($request->has('mrn') && $request->mrn) {
            $query->where('billings.mrn', 'like', "%{$request->mrn}%");
        }

        if ($request->has('patientTypeId') && $request->patientTypeId) {
            $query->where('billings.patientTypeId', $request->patientTypeId);
        }

        if ($request->has('PaymentStatus') && $request->PaymentStatus && $request->PaymentStatus !== 'All') {
            $query->where('billings.PaymentStatus', $request->PaymentStatus);
        }

        if ($request->has('BillType') && $request->BillType && $request->BillType !== 'All') {
            $query->where('billings.BillType', $request->BillType);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('billings.InvoiceDate', now()->toDateString());
        }

        if ($request->has('fromDate') && $request->fromDate) {
            $query->where('billings.InvoiceDate', '>=', $request->fromDate);
        }

        if ($request->has('toDate') && $request->toDate) {
            $query->where('billings.InvoiceDate', '<=', $request->toDate);
        }

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patients.patientId', 'like', "%{$request->patientId}%");
        }

        $rows = $query->orderBy('billings.InvoiceDate', 'desc')->get();

        $billings = $rows->map(function ($row) {
            return [
                'Id' => $row->Id,
                'InvoiceNo' => $row->InvoiceNo,
                'InvoiceDate' => $row->InvoiceDate,
                'mrn' => $row->mrn,
                'SubTotal' => $row->SubTotal,
                'Discount' => $row->Discount,
                'TotalAmount' => $row->TotalAmount,
                'PaymentStatus' => $row->PaymentStatus,
                'BillType' => $row->BillType,
                'Notes' => $row->Notes,
                'printedCount' => $row->printedCount,
                'patientVisit' => [
                    'mrn' => $row->mrn,
                    'patient' => $row->patient_name ? [
                        'pName' => $row->patient_name,
                        'patientId' => $row->patient_patient_id,
                        'mobile' => $row->patient_mobile,
                        'cnic' => $row->patient_cnic,
                        'gender' => $row->patient_gender,
                        'dob' => $row->patient_dob ?? null,
                    ] : null,
                ],
                'patientType' => $row->patientType_name ? ['id' => $row->patientTypeId, 'patientType' => $row->patientType_name] : null,
                'department' => $row->department_name ? ['id' => $row->DepartmentId, 'DepartmentName' => $row->department_name] : null,
                'doctor' => $row->doctor_name ? ['id' => $row->DoctorId, 'Name' => $row->doctor_name] : null,
            ];
        });

        return response()->json($billings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mrn' => 'required|string|exists:patient_visits,mrn',
            'patientTypeId' => 'required|string|exists:patient_types,id',
            'InsuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'DoctorId' => 'nullable|string|exists:doctors,id',
            'InvoiceDate' => 'required|date',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled',
            'BillType' => 'required|in:Normal,Return',
            'ReturnBillingId' => 'nullable|string|exists:billings,Id',
            'Notes' => 'nullable|string',
        ]);

        $validated['createdBy'] = Auth::id();

        $billing = Billing::create($validated);

        return response()->json($billing->load(['patientVisit.patient', 'patientType', 'insuranceCompany', 'department', 'doctor']), 201);
    }

    public function show(Billing $billing)
    {
        return response()->json($billing->load(['patientVisit.patient', 'patientType', 'insuranceCompany', 'department', 'doctor', 'postedByUser', 'createdByUser']));
    }

    public function update(Request $request, Billing $billing)
    {
        $validated = $request->validate([
            'mrn' => 'required|string|exists:patient_visits,mrn',
            'patientTypeId' => 'required|string|exists:patient_types,id',
            'InsuranceCompanyId' => 'nullable|string|exists:insurance_companies,id',
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'DoctorId' => 'nullable|string|exists:doctors,id',
            'InvoiceDate' => 'required|date',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled',
            'BillType' => 'required|in:Normal,Return',
            'Notes' => 'nullable|string',
        ]);

        $validated['updatedBy'] = Auth::id();

        $billing->update($validated);

        return response()->json($billing->load(['patientVisit.patient', 'patientType', 'insuranceCompany', 'department', 'doctor']));
    }

    public function destroy(Billing $billing)
    {
        $billing->delete();
        return response()->json(['message' => 'Billing record deleted successfully']);
    }
}
