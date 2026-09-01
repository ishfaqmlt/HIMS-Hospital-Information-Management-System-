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
                'billings.isPosted',
                'billings.postedBy',
                'billings.postedAt',
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
                'isPosted' => (bool)$row->isPosted,
                'postedBy' => $row->postedBy,
                'postedAt' => $row->postedAt,
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

    public static function generateNextTokenNo(?string $doctorId, ?string $mrn = null): ?int
    {
        if (empty($doctorId)) {
            return null;
        }

        $today = now()->toDateString();

        // 1. Check if patient already has a pending/booked appointment token for today with this doctor
        if ($mrn) {
            $existingApptToken = DB::table('patient_appointments')
                ->where('DoctorId', $doctorId)
                ->where('mrn', $mrn)
                ->whereDate('Appointmentat', $today)
                ->whereIn('Status', ['Pending', 'Booked'])
                ->value('TokenNo');

            if ($existingApptToken) {
                return intval($existingApptToken);
            }
        }

        // 2. Lock & calculate next unused token number for this doctor today
        return DB::transaction(function () use ($doctorId, $today) {
            $bookedApptTokens = DB::table('patient_appointments')
                ->where('DoctorId', $doctorId)
                ->whereDate('Appointmentat', $today)
                ->whereIn('Status', ['Pending', 'Booked'])
                ->pluck('TokenNo')
                ->map(fn($t) => intval($t))
                ->toArray();

            $usedBillingTokens = DB::table('billings')
                ->where('DoctorId', $doctorId)
                ->whereDate('InvoiceDate', $today)
                ->whereNotNull('tokenNo')
                ->where('tokenNo', '>', 0)
                ->pluck('tokenNo')
                ->map(fn($t) => intval($t))
                ->toArray();

            $usedTokens = array_unique(array_merge($bookedApptTokens, $usedBillingTokens));

            $nextToken = 1;
            for ($i = 1; $i <= 500; $i++) {
                if (!in_array($i, $usedTokens)) {
                    $nextToken = $i;
                    break;
                }
            }

            return $nextToken;
        });
    }

    public function getNextTokenNo(Request $request)
    {
        $doctorId = $request->query('DoctorId') ?: $request->query('doctorId');
        $mrn = $request->query('mrn');

        if (!$doctorId) {
            return response()->json(['tokenNo' => null]);
        }

        $token = self::generateNextTokenNo($doctorId, $mrn);

        return response()->json(['tokenNo' => $token]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitId' => 'required|string|exists:patient_visits,id',
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'DoctorId' => 'nullable|string|exists:doctors,id',
            'tokenNo' => 'nullable|integer',
            'services' => 'nullable|array',
            'InvoiceDate' => 'required|date',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled,Returned,Partially Returned',
            'BillType' => 'required|in:Return,Normal',
            'ReturnInvoiceNo' => 'nullable|string',
            'Notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $servicesInput = $request->input('services', []);
            $hasPrintTokenService = false;
            if (!empty($servicesInput)) {
                $serviceIds = array_filter(array_map(fn($s) => $s['serviceId'] ?? ($s['id'] ?? null), $servicesInput));
                if (!empty($serviceIds)) {
                    $hasPrintTokenService = DB::table('services')
                        ->whereIn('id', $serviceIds)
                        ->where('printToken', 1)
                        ->exists();
                }
            }

            $mrn = DB::table('patient_visits')
                ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
                ->where('patient_visits.id', $validated['visitId'])
                ->value('patients.mrn');

            $doctorId = $validated['DoctorId'] ?? null;
            $tokenNeeded = (!empty($doctorId)) && (
                (!empty($validated['tokenNo']) && intval($validated['tokenNo']) > 0) ||
                $hasPrintTokenService
            );

            if ($tokenNeeded) {
                if (empty($validated['tokenNo']) || intval($validated['tokenNo']) <= 0) {
                    $validated['tokenNo'] = self::generateNextTokenNo($doctorId, $mrn);
                } else {
                    $validated['tokenNo'] = intval($validated['tokenNo']);
                }

                $today = now()->toDateString();
                $existingAppt = null;
                if ($mrn) {
                    $existingAppt = DB::table('patient_appointments')
                        ->where('DoctorId', $doctorId)
                        ->where('mrn', $mrn)
                        ->whereDate('Appointmentat', $today)
                        ->whereIn('Status', ['Pending', 'Booked'])
                        ->first();
                }

                if ($existingAppt) {
                    $validated['tokenNo'] = intval($existingAppt->TokenNo);

                    if ($existingAppt->Status === 'Pending') {
                        DB::table('patient_appointments')
                            ->where('Id', $existingAppt->Id)
                            ->update([
                                'Status' => 'Booked',
                                'updated_at' => now(),
                            ]);
                    }
                } else if ($mrn && $validated['tokenNo']) {
                    DB::table('patient_appointments')->insert([
                        'Id' => (string) Str::uuid(),
                        'DoctorId' => $doctorId,
                        'mrn' => $mrn,
                        'Appointmentat' => now(),
                        'TokenNo' => $validated['tokenNo'],
                        'Status' => 'Booked',
                        'Remarks' => 'Auto-created from Billing',
                        'CreatedBy' => Auth::id() ?: 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            } else {
                $validated['tokenNo'] = null;
            }

            unset($validated['services']);

            $validated['createdBy'] = Auth::id();
            $validated['id'] = (string) Str::uuid();
            $validated['InvoiceNo'] = Billing::generateInvoiceNo();
            $validated['InvoiceDate'] = date('Y-m-d H:i:s', strtotime($validated['InvoiceDate']));

            DB::table('billings')->insert($validated);

            $billing = DB::table('billings')
                ->leftJoin('patient_visits', 'billings.visitId', '=', 'patient_visits.id')
                ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
                ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
                ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
                ->where('billings.id', $validated['id'])
                ->select(
                    'billings.*',
                    'patient_visits.visitNo',
                    'patients.pName as patient_name',
                    'patients.mrn as patient_mrn',
                    'patients.mobile as patient_mobile',
                    'patients.cnic as patient_cnic',
                    'patients.gender as patient_gender',
                    'departments.DepartmentName as department_name',
                    'doctors.Name as doctor_name'
                )
                ->first();

            return response()->json($billing, 201);
        });
    }

    public function show($id)
    {
        $billingId = $id instanceof Billing ? $id->id : $id;

        $row = DB::table('billings')
            ->leftJoin('patient_visits', 'billings.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
            ->leftJoin('users as creators', 'billings.createdBy', '=', 'creators.id')
            ->where('billings.id', $billingId)
            ->orWhere('billings.InvoiceNo', $billingId)
            ->select(
                'billings.*',
                'patient_visits.visitNo',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.cnic as patient_cnic',
                'patients.gender as patient_gender',
                'departments.DepartmentName as department_name',
                'doctors.Name as doctor_name',
                'creators.name as creator_name'
            )
            ->first();

        if (!$row) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        $details = DB::table('billing_details')
            ->leftJoin('services', 'billing_details.serviceId', '=', 'services.id')
            ->where('billing_details.BillingId', $row->id)
            ->select(
                'billing_details.*',
                'services.ServiceName as serviceName',
                'services.Code as serviceCode'
            )
            ->get();

        $payment = DB::table('patient_payments')
            ->where('invoiceNo', $row->InvoiceNo)
            ->first();

        $result = (array) $row;
        $result['patientVisit'] = [
            'id' => $row->visitId,
            'visitNo' => $row->visitNo,
            'patient' => [
                'pName' => $row->patient_name,
                'mrn' => $row->patient_mrn,
                'mobile' => $row->patient_mobile,
                'cnic' => $row->patient_cnic,
                'gender' => $row->patient_gender,
            ]
        ];
        $result['doctor'] = [
            'id' => $row->DoctorId,
            'Name' => $row->doctor_name,
        ];
        $result['department'] = [
            'id' => $row->DepartmentId,
            'DepartmentName' => $row->department_name,
        ];
        $result['details'] = $details;
        $result['payment'] = $payment;

        return response()->json($result);
    }

    public function update(Request $request, Billing $billing)
    {
        if ($billing->isPosted) {
            return response()->json(['message' => 'Cannot modify a posted invoice.'], 422);
        }

        $validated = $request->validate([
            'visitId' => 'required|string|exists:patient_visits,id',
            'DepartmentId' => 'nullable|string|exists:departments,id',
            'DoctorId' => 'nullable|string|exists:doctors,id',
            'tokenNo' => 'nullable|integer',
            'services' => 'nullable|array',
            'InvoiceDate' => 'required|date',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled,Returned,Partially Returned',
            'BillType' => 'required|in:Return,Normal',
            'Notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $billing, $request) {
            $servicesInput = $request->input('services', []);
            $hasPrintTokenService = false;
            if (!empty($servicesInput)) {
                $serviceIds = array_filter(array_map(fn($s) => $s['serviceId'] ?? ($s['id'] ?? null), $servicesInput));
                if (!empty($serviceIds)) {
                    $hasPrintTokenService = DB::table('services')
                        ->whereIn('id', $serviceIds)
                        ->where('printToken', 1)
                        ->exists();
                }
            }
            if (!$hasPrintTokenService) {
                $hasPrintTokenService = DB::table('billing_details')
                    ->join('services', 'billing_details.serviceId', '=', 'services.id')
                    ->where('billing_details.BillingId', $billing->id)
                    ->where('services.printToken', 1)
                    ->exists();
            }

            $mrn = DB::table('patient_visits')
                ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
                ->where('patient_visits.id', $validated['visitId'])
                ->value('patients.mrn');

            $doctorId = $validated['DoctorId'] ?? null;
            $tokenNeeded = (!empty($doctorId)) && (
                (!empty($validated['tokenNo']) && intval($validated['tokenNo']) > 0) ||
                $hasPrintTokenService
            );

            if ($tokenNeeded) {
                if (empty($validated['tokenNo']) || intval($validated['tokenNo']) <= 0) {
                    $validated['tokenNo'] = self::generateNextTokenNo($doctorId, $mrn);
                } else {
                    $validated['tokenNo'] = intval($validated['tokenNo']);
                }

                $today = now()->toDateString();
                $existingAppt = null;
                if ($mrn) {
                    $existingAppt = DB::table('patient_appointments')
                        ->where('DoctorId', $doctorId)
                        ->where('mrn', $mrn)
                        ->whereDate('Appointmentat', $today)
                        ->whereIn('Status', ['Pending', 'Booked'])
                        ->first();
                }

                if ($existingAppt) {
                    $validated['tokenNo'] = intval($existingAppt->TokenNo);

                    if ($existingAppt->Status === 'Pending') {
                        DB::table('patient_appointments')
                            ->where('Id', $existingAppt->Id)
                            ->update([
                                'Status' => 'Booked',
                                'updated_at' => now(),
                            ]);
                    }
                } else if ($mrn && $validated['tokenNo']) {
                    DB::table('patient_appointments')->insert([
                        'Id' => (string) Str::uuid(),
                        'DoctorId' => $doctorId,
                        'mrn' => $mrn,
                        'Appointmentat' => now(),
                        'TokenNo' => $validated['tokenNo'],
                        'Status' => 'Booked',
                        'Remarks' => 'Auto-created from Billing',
                        'CreatedBy' => Auth::id() ?: 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            } else {
                $validated['tokenNo'] = null;
            }

            unset($validated['services']);

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

    public function postBill(Request $request, $id)
    {
        $billing = DB::table('billings')->where('id', $id)->first();
        if (!$billing) {
            return response()->json(['message' => 'Invoice not found'], 404);
        }

        if ($billing->isPosted) {
            return response()->json(['message' => 'Invoice is already posted'], 400);
        }

        DB::table('billings')->where('id', $id)->update([
            'isPosted' => true,
            'postedBy' => Auth::id(),
            'postedAt' => now(),
            'updated_at' => now(),
        ]);

        $updated = DB::table('billings')->where('id', $id)->first();

        return response()->json([
            'message' => 'Invoice posted successfully',
            'data' => $updated,
        ]);
    }

    public function destroy(Billing $billing)
    {
        if ($billing->isPosted) {
            return response()->json(['message' => 'Cannot delete a posted invoice.'], 422);
        }

        return DB::transaction(function () use ($billing) {
            DB::table('billing_payments')->where('billingId', $billing->id)->delete();
            $billing->delete();

            return response()->json(['message' => 'Billing deleted successfully']);
        });
    }
}
