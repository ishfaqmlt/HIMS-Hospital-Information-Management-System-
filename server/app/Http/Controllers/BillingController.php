<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('billings')
            ->leftJoin('patient_visits', 'billings.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
            ->select(
                'billings.id',
                'billings.InvoiceNo',
                'billings.InvoiceDate',
                'billings.visitId',
                'billings.DepartmentId',
                'billings.DoctorId',
                'billings.tokenNo',
                'billings.SubTotal',
                'billings.Discount',
                'billings.TotalAmount',
                'billings.PaymentStatus',
                'billings.BillType',
                'billings.Notes',
                'billings.printedCount',
                'patient_visits.visitNo',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.cnic as patient_cnic',
                'patients.gender as patient_gender',
                'departments.DepartmentName as department_name',
                'doctors.Name as doctor_name'
            );

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('billings.InvoiceNo', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%");
            });
        }

        if ($request->has('invoiceNo') && $request->invoiceNo) {
            $query->where('billings.InvoiceNo', $request->invoiceNo);
        }

        if ($request->has('ReturnInvoiceNo') && $request->ReturnInvoiceNo) {
            $query->where('billings.ReturnInvoiceNo', $request->ReturnInvoiceNo);
        }

        if ($request->has('mrn') && $request->mrn) {
            $query->where('patients.mrn', 'like', "%{$request->mrn}%");
        }

        if ($request->has('visitId') && $request->visitId) {
            $query->where('billings.visitId', $request->visitId);
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

        $rows = $query->orderBy('billings.InvoiceDate', 'desc')->get();

        $returnInvoices = DB::table('billings')
            ->whereNotNull('ReturnInvoiceNo')
            ->where('ReturnInvoiceNo', '!=', '')
            ->get(['id', 'ReturnInvoiceNo']);

        $origQtyByInv = DB::table('billing_details')
            ->select('BillingId', DB::raw('SUM(Qty) as total_qty'))
            ->groupBy('BillingId')
            ->pluck('total_qty', 'BillingId')
            ->toArray();

        $returnBillingIds = $returnInvoices->pluck('id')->toArray();
        $retQtyByReturnInvId = empty($returnBillingIds) ? [] : DB::table('billing_details')
            ->whereIn('BillingId', $returnBillingIds)
            ->select('BillingId', DB::raw('SUM(Qty) as total_qty'))
            ->groupBy('BillingId')
            ->pluck('total_qty', 'BillingId')
            ->toArray();

        $retQtyByOriginalInvNo = [];
        foreach ($returnInvoices as $rInv) {
            $rQty = $retQtyByReturnInvId[$rInv->id] ?? 0;
            $retQtyByOriginalInvNo[$rInv->ReturnInvoiceNo] = ($retQtyByOriginalInvNo[$rInv->ReturnInvoiceNo] ?? 0) + $rQty;
        }

        $billings = $rows->map(function ($row) use ($origQtyByInv, $retQtyByOriginalInvNo) {
            $origQty = (float)($origQtyByInv[$row->id] ?? 0);
            $retQty = (float)($retQtyByOriginalInvNo[$row->InvoiceNo] ?? 0);

            $status = $row->PaymentStatus;
            if ($status === 'Returned' || ($origQty > 0 && $retQty >= $origQty)) {
                $status = 'Returned';
            } else if ($status === 'Partially Returned' || ($retQty > 0 && $retQty < $origQty)) {
                $status = 'Partially Returned';
            }

            $isFullyReturned = ($status === 'Returned');
            $isPartiallyReturned = ($status === 'Partially Returned');

            return [
                'id' => $row->id,
                'InvoiceNo' => $row->InvoiceNo,
                'InvoiceDate' => $row->InvoiceDate,
                'visitId' => $row->visitId,
                'tokenNo' => $row->tokenNo,
                'SubTotal' => $row->SubTotal,
                'Discount' => $row->Discount,
                'TotalAmount' => $row->TotalAmount,
                'PaymentStatus' => $status,
                'isReturned' => $isFullyReturned,
                'isFullyReturned' => $isFullyReturned,
                'isPartiallyReturned' => $isPartiallyReturned,
                'BillType' => $row->BillType,
                'Notes' => $row->Notes,
                'printedCount' => $row->printedCount,
                'patientVisit' => [
                    'id' => $row->visitId,
                    'visitNo' => $row->visitNo,
                    'patient' => $row->patient_name ? [
                        'pName' => $row->patient_name,
                        'mrn' => $row->patient_mrn,
                        'mobile' => $row->patient_mobile,
                        'cnic' => $row->patient_cnic,
                        'gender' => $row->patient_gender,
                    ] : null,
                ],
                'department' => $row->department_name ? ['id' => $row->DepartmentId, 'DepartmentName' => $row->department_name] : null,
                'doctor' => $row->doctor_name ? ['id' => $row->DoctorId, 'Name' => $row->doctor_name] : null,
            ];
        });

        return response()->json($billings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitId' => 'required|string|exists:patient_visits,id',
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'DoctorId' => 'nullable|string|exists:doctors,id',
            'tokenNo' => 'nullable|integer',
            'InvoiceDate' => 'required|date',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled,Returned,Partially Returned',
            'BillType' => 'required|in:Return,Normal',
            'ReturnInvoiceNo' => 'nullable|string',
            'Notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $validated['createdBy'] = Auth::id();
            $validated['Id'] = (string) Str::uuid();
            $validated['InvoiceNo'] = Billing::generateInvoiceNo();
            $validated['InvoiceDate'] = date('Y-m-d H:i:s', strtotime($validated['InvoiceDate']));

            DB::table('billings')->insert($validated);

            $billing = DB::table('billings')->where('id', $validated['Id'])->first();

            return response()->json($billing, 201);
        });
    }

    public function show(Billing $billing)
    {
        return response()->json($billing->load(['patientVisit.patient', 'doctor', 'department', 'creator']));
    }

    public function update(Request $request, Billing $billing)
    {
        $validated = $request->validate([
            'visitId' => 'required|string|exists:patient_visits,id',
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'DoctorId' => 'nullable|string|exists:doctors,id',
            'tokenNo' => 'nullable|integer',
            'InvoiceDate' => 'required|date',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled,Returned,Partially Returned',
            'BillType' => 'required|in:Return,Normal',
            'Notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $billing) {
            $oldTotal = DB::table('billings')->where('id', $billing->id)->lockForUpdate()->value('TotalAmount');
            $newTotal = $validated['TotalAmount'];
            $validated['InvoiceDate'] = date('Y-m-d H:i:s', strtotime($validated['InvoiceDate']));

            DB::table('billings')->where('id', $billing->id)->update($validated);

            // Sync payment amounts when TotalAmount changes
            if ($oldTotal != $newTotal) {
                $linkedPayments = DB::table('billing_payments')
                    ->join('patient_payments', 'billing_payments.paymentId', '=', 'patient_payments.id')
                    ->where('billing_payments.billingId', $billing->id)
                    ->where('patient_payments.status', 'Active')
                    ->select('billing_payments.id as bpId', 'patient_payments.id as ppId')
                    ->get();

                foreach ($linkedPayments as $linked) {
                    DB::table('billing_payments')->where('id', $linked->bpId)->update([
                        'amount' => $newTotal,
                        'updated_at' => now(),
                    ]);

                    DB::table('patient_payments')->where('id', $linked->ppId)->update([
                        'debit' => $newTotal,
                        'updated_at' => now(),
                    ]);

                    DB::table('payment_details')->where('paymentId', $linked->ppId)->update([
                        'amount' => $newTotal,
                        'updated_at' => now(),
                    ]);
                }
            }

            $updated = DB::table('billings')->where('id', $billing->id)->first();

            return response()->json($updated);
        });
    }

    public function destroy(Billing $billing)
    {
        return DB::transaction(function () use ($billing) {
            DB::table('billing_payments')->where('billingId', $billing->id)->delete();
            $billing->delete();

            return response()->json(['message' => 'Billing deleted successfully']);
        });
    }
}
