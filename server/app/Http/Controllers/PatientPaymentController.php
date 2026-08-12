<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PatientPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('patient_payments')
            ->leftJoin('patient_visits', 'patient_payments.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('insurance_companies', 'patient_payments.insuranceCompanyId', '=', 'insurance_companies.id')
            ->leftJoin('users', 'patient_payments.createdBy', '=', 'users.id')
            ->select(
                'patient_payments.*',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'insurance_companies.name as insurance_name',
                'users.name as creator_name'
            );

        if ($request->has('visitId') && $request->visitId) {
            $query->where('patient_payments.visitId', $request->visitId);
        }

        if ($request->has('invoiceNo') && $request->invoiceNo) {
            $query->where('patient_payments.invoiceNo', $request->invoiceNo);
        }

        if ($request->has('status') && $request->status) {
            $query->where('patient_payments.status', $request->status);
        }

        if ($request->has('type') && $request->type === 'advance') {
            $query->whereNull('patient_payments.invoiceNo')
                  ->where('patient_payments.advanceBalance', '>', 0);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_payments.invoiceNo', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%");
            });
        }

        if ($request->has('dtFrom') && $request->dtFrom) {
            $query->where('patient_payments.created_at', '>=', $request->dtFrom);
        }

        if ($request->has('dtTo') && $request->dtTo) {
            $query->where('patient_payments.created_at', '<=', $request->dtTo);
        }

        $rows = $query->latest()->get();
        $paymentIds = $rows->pluck('id')->toArray();

        $paymentDetailsGrouped = DB::table('payment_details')
            ->whereIn('paymentId', $paymentIds)
            ->get()
            ->groupBy('paymentId');

        $billingPaymentsGrouped = DB::table('billing_payments')
            ->leftJoin('billings', 'billing_payments.billingId', '=', 'billings.id')
            ->whereIn('billing_payments.paymentId', $paymentIds)
            ->select('billing_payments.*', 'billings.InvoiceNo', 'billings.TotalAmount')
            ->get()
            ->groupBy('paymentId');

        $payments = $rows->map(function ($row) use ($paymentDetailsGrouped, $billingPaymentsGrouped) {
            $paymentDetails = $paymentDetailsGrouped->get($row->id, []);
            $billingPayments = $billingPaymentsGrouped->get($row->id, []);

            return [
                'id' => $row->id,
                'visitId' => $row->visitId,
                'mrn' => $row->mrn,
                'invoiceNo' => $row->invoiceNo,
                'debit' => $row->debit,
                'credit' => $row->credit,
                'payerType' => $row->payerType,
                'insuranceCompanyId' => $row->insuranceCompanyId,
                'insuranceName' => $row->insurance_name,
                'status' => $row->status,
                'advanceBalance' => $row->advanceBalance,
                'remarks' => $row->remarks,
                'createdBy' => $row->createdBy,
                'creatorName' => $row->creator_name,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
                'paymentDetails' => $paymentDetails,
                'linkedBills' => $billingPayments,
                'patient' => $row->patient_name ? [
                    'pName' => $row->patient_name,
                    'mrn' => $row->patient_mrn,
                ] : null,
            ];
        });

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitId' => 'nullable|string',
            'mrn' => 'nullable|string',
            'invoiceNo' => 'nullable|string',
            'debit' => 'required|numeric|min:0.01',
            'credit' => 'required|numeric|min:0',
            'payerType' => 'required|in:Patient,Insurance',
            'insuranceCompanyId' => 'nullable|string',
            'remarks' => 'nullable|string',
            'paymentDetails' => 'required|array|min:1',
            'paymentDetails.*.paymentMode' => 'required|string',
            'paymentDetails.*.amount' => 'required|numeric|min:0',
            'billingIds' => 'nullable|array',
            'billingIds.*' => 'required|string',
            'billingAmounts' => 'nullable|array',
            'billingAmounts.*' => 'required|numeric|min:0',
        ]);

        $hasLinkedBills = !empty($validated['billingIds']) && !empty($validated['billingAmounts']);

        DB::beginTransaction();

        try {
            $paymentId = Str::uuid();
            $now = now();

            $insertData = [
                'id' => $paymentId,
                'visitId' => $validated['visitId'] ?? null,
                'mrn' => $validated['mrn'] ?? null,
                'invoiceNo' => $validated['invoiceNo'] ?? null,
                'debit' => $validated['debit'],
                'credit' => $validated['credit'],
                'payerType' => $validated['payerType'],
                'insuranceCompanyId' => $validated['insuranceCompanyId'] ?? null,
                'status' => 'Active',
                'advanceBalance' => $hasLinkedBills ? 0 : $validated['debit'],
                'remarks' => $validated['remarks'] ?? null,
                'createdBy' => Auth::id(),
                'created_at' => $now,
                'updated_at' => $now,
            ];

            DB::table('patient_payments')->insert($insertData);

            foreach ($validated['paymentDetails'] as $detail) {
                DB::table('payment_details')->insert([
                    'id' => Str::uuid(),
                    'paymentId' => $paymentId,
                    'paymentMode' => $detail['paymentMode'],
                    'amount' => $detail['amount'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            if ($hasLinkedBills) {
                foreach ($validated['billingIds'] as $index => $billingId) {
                    $amount = $validated['billingAmounts'][$index] ?? 0;
                    if ($amount > 0) {
                        DB::table('billing_payments')->insert([
                            'id' => Str::uuid(),
                            'billingId' => $billingId,
                            'paymentId' => $paymentId,
                            'amount' => $amount,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);

                        $this->updateBillPaymentStatus($billingId);
                    }
                }
            }

            DB::commit();

            $payment = DB::table('patient_payments')->where('id', $paymentId)->first();

            return response()->json($payment, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create payment: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $row = DB::table('patient_payments')
            ->leftJoin('patient_visits', 'patient_payments.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('insurance_companies', 'patient_payments.insuranceCompanyId', '=', 'insurance_companies.id')
            ->leftJoin('users', 'patient_payments.createdBy', '=', 'users.id')
            ->where('patient_payments.id', $id)
            ->select(
                'patient_payments.*',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'insurance_companies.name as insurance_name',
                'users.name as creator_name'
            )
            ->first();

        if (!$row) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $paymentDetails = DB::table('payment_details')
            ->where('paymentId', $row->id)
            ->get();

        $billingPayments = DB::table('billing_payments')
            ->leftJoin('billings', 'billing_payments.billingId', '=', 'billings.id')
            ->where('billing_payments.paymentId', $row->id)
            ->select('billing_payments.*', 'billings.InvoiceNo', 'billings.TotalAmount')
            ->get();

        $payment = [
            'id' => $row->id,
            'visitId' => $row->visitId,
            'mrn' => $row->mrn,
            'invoiceNo' => $row->invoiceNo,
            'debit' => $row->debit,
            'credit' => $row->credit,
            'payerType' => $row->payerType,
            'insuranceCompanyId' => $row->insuranceCompanyId,
            'insuranceName' => $row->insurance_name,
            'status' => $row->status,
            'advanceBalance' => $row->advanceBalance,
            'remarks' => $row->remarks,
            'createdBy' => $row->createdBy,
            'creatorName' => $row->creator_name,
            'created_at' => $row->created_at,
            'updated_at' => $row->updated_at,
            'paymentDetails' => $paymentDetails,
            'linkedBills' => $billingPayments,
            'patient' => $row->patient_name ? [
                'pName' => $row->patient_name,
                'mrn' => $row->patient_mrn,
            ] : null,
        ];

        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'visitId' => 'nullable|string',
            'mrn' => 'nullable|string',
            'invoiceNo' => 'nullable|string',
            'debit' => 'sometimes|required|numeric|min:0',
            'credit' => 'sometimes|required|numeric|min:0',
            'payerType' => 'sometimes|required|in:Patient,Insurance',
            'insuranceCompanyId' => 'nullable|string',
            'remarks' => 'nullable|string',
            'paymentDetails' => 'sometimes|array|min:1',
            'paymentDetails.*.paymentMode' => 'required|string',
            'paymentDetails.*.amount' => 'required|numeric|min:0',
        ]);

        $validated['updated_at'] = now();

        DB::beginTransaction();

        try {
            DB::table('patient_payments')->where('id', $id)->update($validated);

            if (isset($validated['paymentDetails'])) {
                DB::table('payment_details')->where('paymentId', $id)->delete();

                foreach ($validated['paymentDetails'] as $detail) {
                    DB::table('payment_details')->insert([
                        'id' => Str::uuid(),
                        'paymentId' => $id,
                        'paymentMode' => $detail['paymentMode'],
                        'amount' => $detail['amount'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

            $payment = DB::table('patient_payments')->where('id', $id)->first();

            return response()->json($payment);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update payment: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $payment = DB::table('patient_payments')->where('id', $id)->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            if ($payment->advanceBalance > 0 && $payment->advanceBalance < $payment->debit) {
                return response()->json(['message' => 'Cannot delete partially used advance payment'], 422);
            }

            $linkedBills = DB::table('billing_payments')
                ->where('paymentId', $id)
                ->pluck('billingId')
                ->toArray();

            DB::table('billing_payments')->where('paymentId', $id)->delete();
            DB::table('payment_details')->where('paymentId', $id)->delete();
            DB::table('patient_payments')->where('id', $id)->delete();

            foreach ($linkedBills as $billingId) {
                $this->updateBillPaymentStatus($billingId);
            }

            DB::commit();

            return response()->json(['message' => 'Patient payment deleted successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to delete payment: ' . $e->getMessage()], 500);
        }
    }

    public function cancel($id)
    {
        DB::beginTransaction();

        try {
            $payment = DB::table('patient_payments')->where('id', $id)->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            $linkedBills = DB::table('billing_payments')
                ->where('paymentId', $id)
                ->pluck('billingId')
                ->toArray();

            DB::table('patient_payments')
                ->where('id', $id)
                ->update([
                    'status' => 'Cancelled',
                    'advanceBalance' => 0,
                    'updated_at' => now(),
                ]);

            foreach ($linkedBills as $billingId) {
                $this->updateBillPaymentStatus($billingId);
            }

            DB::commit();

            return response()->json(['message' => 'Payment cancelled successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to cancel payment: ' . $e->getMessage()], 500);
        }
    }

    public function getAdvanceBalance(Request $request)
    {
        $mrn = $request->query('mrn');

        if (!$mrn) {
            return response()->json(['message' => 'MRN is required'], 400);
        }

        $totalAdvance = DB::table('patient_payments')
            ->where('mrn', $mrn)
            ->where('status', 'Active')
            ->where('advanceBalance', '>', 0)
            ->sum('advanceBalance');

        return response()->json([
            'mrn' => $mrn,
            'advanceBalance' => (float) $totalAdvance,
        ]);
    }

    public function applyAdvance(Request $request)
    {
        $validated = $request->validate([
            'paymentId' => 'required|string',
            'billingId' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();

        try {
            $payment = DB::table('patient_payments')
                ->where('id', $validated['paymentId'])
                ->where('status', 'Active')
                ->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            if ($payment->advanceBalance < $validated['amount']) {
                return response()->json(['message' => 'Insufficient advance balance. Available: ' . $payment->advanceBalance], 422);
            }

            $now = now();

            DB::table('patient_payments')
                ->where('id', $validated['paymentId'])
                ->update([
                    'advanceBalance' => $payment->advanceBalance - $validated['amount'],
                    'updated_at' => $now,
                ]);

            DB::table('billing_payments')->insert([
                'id' => Str::uuid(),
                'billingId' => $validated['billingId'],
                'paymentId' => $validated['paymentId'],
                'amount' => $validated['amount'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $this->updateBillPaymentStatus($validated['billingId']);

            DB::commit();

            return response()->json(['message' => 'Advance applied successfully']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to apply advance: ' . $e->getMessage()], 500);
        }
    }

    public function refundAdvance(Request $request)
    {
        $validated = $request->validate([
            'paymentId' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'paymentMode' => 'required|string',
            'remarks' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            $payment = DB::table('patient_payments')
                ->where('id', $validated['paymentId'])
                ->where('status', 'Active')
                ->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            if ($payment->advanceBalance <= 0) {
                return response()->json(['message' => 'No advance balance to refund'], 422);
            }

            $refundAmount = min($validated['amount'], $payment->advanceBalance);
            $now = now();

            DB::table('patient_payments')
                ->where('id', $validated['paymentId'])
                ->update([
                    'advanceBalance' => $payment->advanceBalance - $refundAmount,
                    'updated_at' => $now,
                ]);

            $refundId = Str::uuid();
            DB::table('patient_payments')->insert([
                'id' => $refundId,
                'visitId' => $payment->visitId,
                'mrn' => $payment->mrn,
                'invoiceNo' => null,
                'debit' => 0,
                'credit' => $refundAmount,
                'payerType' => $payment->payerType,
                'insuranceCompanyId' => $payment->insuranceCompanyId,
                'status' => 'Active',
                'advanceBalance' => 0,
                'remarks' => $validated['remarks'] ?? 'Refund of advance payment',
                'createdBy' => Auth::id(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('payment_details')->insert([
                'id' => Str::uuid(),
                'paymentId' => $refundId,
                'paymentMode' => $validated['paymentMode'],
                'amount' => $refundAmount,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Refund of ' . $refundAmount . ' processed successfully',
                'refundId' => $refundId,
                'refundAmount' => $refundAmount,
                'remainingAdvance' => $payment->advanceBalance - $refundAmount,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to process refund: ' . $e->getMessage()], 500);
        }
    }

    private function updateBillPaymentStatus($billingId)
    {
        $bill = DB::table('billings')->where('id', $billingId)->first();

        if (!$bill) return;

        $totalPaid = DB::table('billing_payments')
            ->join('patient_payments', 'billing_payments.paymentId', '=', 'patient_payments.id')
            ->where('billing_payments.billingId', $billingId)
            ->where('patient_payments.status', 'Active')
            ->sum('billing_payments.amount');

        $totalAmount = $bill->TotalAmount;
        $paymentStatus = 'Pending';

        if ($totalPaid >= $totalAmount && $totalAmount > 0) {
            $paymentStatus = 'Paid';
        } elseif ($totalPaid > 0) {
            $paymentStatus = 'Partial';
        }

        DB::table('billings')
            ->where('id', $billingId)
            ->update([
                'PaymentStatus' => $paymentStatus,
                'updated_at' => now(),
            ]);
    }
}
