<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * User-wise / Daily Payment Collection Summary
     */
    public function getPaymentCollectionSummary(Request $request)
    {
        $fromDate = $request->query('fromDate', now()->startOfDay()->toDateTimeString());
        $toDate = $request->query('toDate', now()->endOfDay()->toDateTimeString());
        $userId = $request->query('userId');

        $query = DB::table('billings')
            ->leftJoin('users', 'billings.createdBy', '=', 'users.id')
            ->select(
                'billings.createdBy as user_id',
                DB::raw("COALESCE(users.name, 'System User') as user_name"),
                DB::raw("COUNT(billings.id) as invoice_count"),
                DB::raw("SUM(billings.SubTotal) as sub_total"),
                DB::raw("SUM(billings.Discount) as discount"),
                DB::raw("SUM(billings.TotalAmount) as net_amount")
            )
            ->whereBetween('billings.InvoiceDate', [$fromDate, $toDate])
            ->where('billings.PaymentStatus', '!=', 'Cancelled');

        if ($userId) {
            $query->where('billings.createdBy', $userId);
        }

        $summary = $query->groupBy('billings.createdBy', 'users.name')->get();

        // Get paid amounts breakdown per user from patient_payments
        $paymentsQuery = DB::table('patient_payments')
            ->leftJoin('users', 'patient_payments.createdBy', '=', 'users.id')
            ->select(
                'patient_payments.createdBy as user_id',
                DB::raw("SUM(patient_payments.debit) as total_received"),
                DB::raw("SUM(CASE WHEN patient_payments.paymentMode = 'Cash' OR patient_payments.paymentMode IS NULL THEN patient_payments.debit ELSE 0 END) as cash_received"),
                DB::raw("SUM(CASE WHEN patient_payments.paymentMode = 'Card' THEN patient_payments.debit ELSE 0 END) as card_received"),
                DB::raw("SUM(CASE WHEN patient_payments.paymentMode = 'Online' OR patient_payments.paymentMode = 'UPI' THEN patient_payments.debit ELSE 0 END) as online_received")
            )
            ->whereBetween('patient_payments.created_at', [$fromDate, $toDate])
            ->where('patient_payments.status', 'Active');

        if ($userId) {
            $paymentsQuery->where('patient_payments.createdBy', $userId);
        }

        $paymentsMap = $paymentsQuery->groupBy('patient_payments.createdBy')->get()->keyBy('user_id');

        $reportData = $summary->map(function ($row) use ($paymentsMap) {
            $uId = $row->user_id;
            $pay = $paymentsMap[$uId] ?? null;

            $received = $pay ? (float)$pay->total_received : (float)$row->net_amount;
            $cash = $pay ? (float)$pay->cash_received : (float)$row->net_amount;
            $card = $pay ? (float)$pay->card_received : 0.00;
            $online = $pay ? (float)$pay->online_received : 0.00;
            $due = max(0, (float)$row->net_amount - $received);

            return [
                'user_id' => $row->user_id,
                'user_name' => $row->user_name,
                'invoice_count' => (int)$row->invoice_count,
                'sub_total' => (float)$row->sub_total,
                'discount' => (float)$row->discount,
                'net_amount' => (float)$row->net_amount,
                'total_received' => $received,
                'cash_received' => $cash,
                'card_received' => $card,
                'online_received' => $online,
                'due_amount' => $due,
            ];
        });

        return response()->json([
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'data' => $reportData,
            'totals' => [
                'total_invoices' => $reportData->sum('invoice_count'),
                'total_sub' => $reportData->sum('sub_total'),
                'total_discount' => $reportData->sum('discount'),
                'total_net' => $reportData->sum('net_amount'),
                'total_received' => $reportData->sum('total_received'),
                'total_cash' => $reportData->sum('cash_received'),
                'total_card' => $reportData->sum('card_received'),
                'total_online' => $reportData->sum('online_received'),
                'total_due' => $reportData->sum('due_amount'),
            ]
        ]);
    }

    /**
     * Department-wise Revenue Breakdown
     */
    public function getDepartmentRevenueSummary(Request $request)
    {
        $fromDate = $request->query('fromDate', now()->startOfDay()->toDateTimeString());
        $toDate = $request->query('toDate', now()->endOfDay()->toDateTimeString());
        $departmentId = $request->query('departmentId');

        $query = DB::table('billings')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->select(
                'billings.DepartmentId as department_id',
                DB::raw("COALESCE(departments.DepartmentName, 'General / OPD') as department_name"),
                DB::raw("COUNT(billings.id) as invoice_count"),
                DB::raw("SUM(billings.SubTotal) as sub_total"),
                DB::raw("SUM(billings.Discount) as discount"),
                DB::raw("SUM(billings.TotalAmount) as net_amount")
            )
            ->whereBetween('billings.InvoiceDate', [$fromDate, $toDate])
            ->where('billings.PaymentStatus', '!=', 'Cancelled');

        if ($departmentId) {
            $query->where('billings.DepartmentId', $departmentId);
        }

        $results = $query->groupBy('billings.DepartmentId', 'departments.DepartmentName')->get();
        $grandTotal = $results->sum('net_amount');

        $data = $results->map(function ($row) use ($grandTotal) {
            $net = (float)$row->net_amount;
            $percent = $grandTotal > 0 ? round(($net / $grandTotal) * 100, 2) : 0;

            return [
                'department_id' => $row->department_id,
                'department_name' => $row->department_name,
                'invoice_count' => (int)$row->invoice_count,
                'sub_total' => (float)$row->sub_total,
                'discount' => (float)$row->discount,
                'net_amount' => $net,
                'revenue_percentage' => $percent,
            ];
        });

        return response()->json([
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'data' => $data,
            'grand_total' => (float)$grandTotal,
        ]);
    }

    /**
     * Patient Outstanding / Due Balance Report
     */
    public function getPatientDueBalanceReport(Request $request)
    {
        $fromDate = $request->query('fromDate');
        $toDate = $request->query('toDate');
        $search = $request->query('search');

        $query = DB::table('billings')
            ->leftJoin('patient_visits', 'billings.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->select(
                'billings.id as billing_id',
                'billings.InvoiceNo',
                'billings.InvoiceDate',
                'billings.TotalAmount',
                'billings.PaymentStatus',
                'patients.mrn as patient_mrn',
                'patients.pName as patient_name',
                'patients.mobile as patient_mobile',
                'patient_visits.visitNo',
                'doctors.Name as doctor_name',
                'departments.DepartmentName as department_name'
            )
            ->where('billings.PaymentStatus', '!=', 'Cancelled')
            ->where('billings.PaymentStatus', '!=', 'Paid');

        if ($fromDate && $toDate) {
            $query->whereBetween('billings.InvoiceDate', [$fromDate, $toDate]);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('billings.InvoiceNo', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mobile', 'like', "%{$search}%");
            });
        }

        $billings = $query->orderBy('billings.InvoiceDate', 'desc')->get();

        // Get paid amounts per billing
        $billingIds = $billings->pluck('billing_id')->toArray();
        $paidMap = empty($billingIds) ? [] : DB::table('billing_payments')
            ->join('patient_payments', 'billing_payments.paymentId', '=', 'patient_payments.id')
            ->whereIn('billing_payments.billingId', $billingIds)
            ->where('patient_payments.status', 'Active')
            ->groupBy('billing_payments.billingId')
            ->select('billing_payments.billingId', DB::raw('SUM(billing_payments.amount) as paid'))
            ->pluck('paid', 'billingId')
            ->toArray();

        $dues = $billings->map(function ($b) use ($paidMap) {
            $total = (float)$b->TotalAmount;
            $paid = (float)($paidMap[$b->billing_id] ?? 0);
            $due = max(0, $total - $paid);

            return [
                'billing_id' => $b->billing_id,
                'invoice_no' => $b->InvoiceNo,
                'invoice_date' => $b->InvoiceDate,
                'mrn' => $b->patient_mrn ?: '-',
                'patient_name' => $b->patient_name ?: 'Walk-in Patient',
                'mobile' => $b->patient_mobile ?: '-',
                'visit_no' => $b->visitNo ?: '-',
                'doctor_name' => $b->doctor_name ?: '-',
                'department_name' => $b->department_name ?: '-',
                'total_amount' => $total,
                'paid_amount' => $paid,
                'due_amount' => $due,
                'status' => $b->PaymentStatus,
            ];
        })->filter(function ($item) {
            return $item['due_amount'] > 0;
        })->values();

        return response()->json([
            'data' => $dues,
            'total_due_balance' => $dues->sum('due_amount'),
            'total_count' => $dues->count(),
        ]);
    }

    /**
     * Doctor Share Summary Report
     */
    public function getDoctorShareSummary(Request $request)
    {
        $fromDate = $request->query('fromDate', now()->startOfDay()->toDateTimeString());
        $toDate = $request->query('toDate', now()->endOfDay()->toDateTimeString());
        $doctorId = $request->query('doctorId');

        $query = DB::table('billing_details')
            ->join('billings', 'billing_details.BillingId', '=', 'billings.id')
            ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->leftJoin('services', 'billing_details.serviceId', '=', 'services.id')
            ->leftJoin('doctor_share_master', function ($join) {
                $join->on('doctor_share_master.doctorId', '=', 'billings.DoctorId')
                     ->on('doctor_share_master.ServiceId', '=', 'billing_details.serviceId');
            })
            ->select(
                'billings.DoctorId as doctor_id',
                DB::raw("COALESCE(doctors.Name, 'Self / Direct') as doctor_name"),
                DB::raw("COALESCE(departments.DepartmentName, 'General') as department_name"),
                DB::raw("COUNT(DISTINCT billings.id) as invoice_count"),
                DB::raw("SUM(billing_details.Amount) as total_gross_revenue"),
                DB::raw("SUM(CASE 
                    WHEN doctor_share_master.DoctorShare IS NOT NULL THEN (billing_details.Amount * doctor_share_master.DoctorShare / 100)
                    WHEN billing_details.ShareAmount > 0 THEN billing_details.ShareAmount
                    WHEN billing_details.SharePercent > 0 THEN (billing_details.Amount * billing_details.SharePercent / 100)
                    ELSE 0 END) as doctor_share_total")
            )
            ->whereBetween('billings.InvoiceDate', [$fromDate, $toDate])
            ->where('billings.PaymentStatus', '!=', 'Cancelled');

        if ($doctorId) {
            $query->where('billings.DoctorId', $doctorId);
        }

        $results = $query->groupBy('billings.DoctorId', 'doctors.Name', 'departments.DepartmentName')->get();

        $data = $results->map(function ($row) {
            $gross = (float)$row->total_gross_revenue;
            $docShare = (float)$row->doctor_share_total;
            $hospShare = max(0, $gross - $docShare);

            return [
                'doctor_id' => $row->doctor_id,
                'doctor_name' => $row->doctor_name,
                'department_name' => $row->department_name,
                'invoice_count' => (int)$row->invoice_count,
                'gross_revenue' => $gross,
                'doctor_share' => $docShare,
                'hospital_share' => $hospShare,
                'share_percentage' => $gross > 0 ? round(($docShare / $gross) * 100, 2) : 0,
            ];
        });

        return response()->json([
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'data' => $data,
            'totals' => [
                'total_invoices' => $data->sum('invoice_count'),
                'total_gross' => $data->sum('gross_revenue'),
                'total_doctor_share' => $data->sum('doctor_share'),
                'total_hospital_share' => $data->sum('hospital_share'),
            ]
        ]);
    }

    /**
     * Doctor Detailed Itemized Share Report
     */
    public function getDoctorShareDetailed(Request $request)
    {
        $fromDate = $request->query('fromDate', now()->startOfDay()->toDateTimeString());
        $toDate = $request->query('toDate', now()->endOfDay()->toDateTimeString());
        $doctorId = $request->query('doctorId');

        $query = DB::table('billing_details')
            ->join('billings', 'billing_details.BillingId', '=', 'billings.id')
            ->leftJoin('patient_visits', 'billings.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->leftJoin('services', 'billing_details.serviceId', '=', 'services.id')
            ->leftJoin('doctor_share_master', function ($join) {
                $join->on('doctor_share_master.doctorId', '=', 'billings.DoctorId')
                     ->on('doctor_share_master.ServiceId', '=', 'billing_details.serviceId');
            })
            ->select(
                'billings.InvoiceNo',
                'billings.InvoiceDate',
                'patients.mrn as patient_mrn',
                'patients.pName as patient_name',
                'doctors.Name as doctor_name',
                'departments.DepartmentName as department_name',
                'services.ServiceName as service_name',
                'billing_details.Qty',
                'billing_details.Rate',
                'billing_details.Amount',
                'doctor_share_master.DoctorShare as master_share_percent',
                'billing_details.SharePercent as detail_share_percent',
                'billing_details.ShareAmount as detail_share_amount'
            )
            ->whereBetween('billings.InvoiceDate', [$fromDate, $toDate])
            ->where('billings.PaymentStatus', '!=', 'Cancelled');

        if ($doctorId) {
            $query->where('billings.DoctorId', $doctorId);
        }

        $items = $query->orderBy('billings.InvoiceDate', 'desc')->get();

        $data = $items->map(function ($row) {
            $amount = (float)$row->Amount;
            $sharePct = 0;
            $docShare = 0;

            if ($row->master_share_percent !== null) {
                $sharePct = (float)$row->master_share_percent;
                $docShare = round($amount * ($sharePct / 100), 2);
            } else if ((float)$row->detail_share_amount > 0) {
                $docShare = (float)$row->detail_share_amount;
                $sharePct = $amount > 0 ? round(($docShare / $amount) * 100, 2) : 0;
            } else if ((float)$row->detail_share_percent > 0) {
                $sharePct = (float)$row->detail_share_percent;
                $docShare = round($amount * ($sharePct / 100), 2);
            }

            $hospShare = max(0, $amount - $docShare);

            return [
                'invoice_no' => $row->InvoiceNo,
                'invoice_date' => $row->InvoiceDate,
                'patient_mrn' => $row->patient_mrn ?: '-',
                'patient_name' => $row->patient_name ?: 'Walk-in Patient',
                'doctor_name' => $row->doctor_name ?: 'Self / Direct',
                'department_name' => $row->department_name ?: 'General',
                'service_name' => $row->service_name ?: 'Hospital Service',
                'qty' => (int)$row->Qty,
                'rate' => (float)$row->Rate,
                'amount' => $amount,
                'share_percent' => $sharePct,
                'doctor_share' => $docShare,
                'hospital_share' => $hospShare,
            ];
        });

        return response()->json([
            'fromDate' => $fromDate,
            'toDate' => $toDate,
            'data' => $data,
            'totals' => [
                'total_amount' => $data->sum('amount'),
                'total_doctor_share' => $data->sum('doctor_share'),
                'total_hospital_share' => $data->sum('hospital_share'),
            ]
        ]);
    }
}
