<?php

namespace App\Http\Controllers;

use App\Models\BillingDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillingDetailController extends Controller
{
    public function index(Request $request)
    {
        $query = BillingDetail::with(['billing', 'service', 'createdByUser']);

        if ($request->has('BillingId') && $request->BillingId) {
            $query->where('BillingId', $request->BillingId);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $billingId = $request->BillingId ?? $request->billingId;
        if (!$billingId && ($request->invoiceNo || $request->InvoiceNo)) {
            $invNo = $request->invoiceNo ?? $request->InvoiceNo;
            $billingId = \Illuminate\Support\Facades\DB::table('billings')->where('InvoiceNo', $invNo)->value('id');
        }

        $request->merge(['BillingId' => $billingId]);

        $validated = $request->validate([
            'BillingId' => 'required|string|exists:billings,id',
            'serviceId' => 'required|string|exists:services,id',
            'Qty' => 'required|integer|min:1',
            'Rate' => 'required|numeric|min:0',
            'Amount' => 'required|numeric|min:0',
            'SharePercent' => 'nullable|numeric|min:0|max:100',
            'ShareAmount' => 'nullable|numeric|min:0',
            'isServed' => 'nullable|boolean',
        ]);

        $exists = BillingDetail::where('BillingId', $validated['BillingId'])
            ->where('serviceId', $validated['serviceId'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'This service has already been added to this invoice.'
            ], 422);
        }

        $validated['createdBy'] = Auth::id();

        $detail = BillingDetail::create($validated);

        // Auto-assign token to parent billing if service has printToken = 1 and billing has no token yet
        $service = \Illuminate\Support\Facades\DB::table('services')->where('id', $validated['serviceId'])->first();
        if ($service && $service->printToken) {
            $parentBilling = \Illuminate\Support\Facades\DB::table('billings')->where('id', $validated['BillingId'])->first();
            if ($parentBilling && empty($parentBilling->tokenNo) && !empty($parentBilling->DoctorId)) {
                $mrn = \Illuminate\Support\Facades\DB::table('patient_visits')
                    ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
                    ->where('patient_visits.id', $parentBilling->visitId)
                    ->value('patients.mrn');

                $nextToken = BillingController::generateNextTokenNo($parentBilling->DoctorId, $mrn);
                \Illuminate\Support\Facades\DB::table('billings')->where('id', $parentBilling->id)->update(['tokenNo' => $nextToken]);

                if ($mrn) {
                    $today = now()->toDateString();
                    $existingAppt = \Illuminate\Support\Facades\DB::table('patient_appointments')
                        ->where('DoctorId', $parentBilling->DoctorId)
                        ->where('mrn', $mrn)
                        ->whereDate('Appointmentat', $today)
                        ->whereIn('Status', ['Pending', 'Booked'])
                        ->first();

                    if ($existingAppt) {
                        if ($existingAppt->Status === 'Pending') {
                            \Illuminate\Support\Facades\DB::table('patient_appointments')
                                ->where('Id', $existingAppt->Id)
                                ->update(['Status' => 'Booked', 'TokenNo' => $nextToken, 'updated_at' => now()]);
                        }
                    } else {
                        \Illuminate\Support\Facades\DB::table('patient_appointments')->insert([
                            'Id' => (string) \Illuminate\Support\Str::uuid(),
                            'DoctorId' => $parentBilling->DoctorId,
                            'mrn' => $mrn,
                            'Appointmentat' => now(),
                            'TokenNo' => $nextToken,
                            'Status' => 'Booked',
                            'Remarks' => 'Auto-created from Billing Detail',
                            'CreatedBy' => Auth::id() ?: 1,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        return response()->json($detail->load(['billing', 'service', 'createdByUser']), 201);
    }

    public function show(BillingDetail $billingDetail)
    {
        return response()->json($billingDetail->load(['billing', 'service', 'createdByUser']));
    }

    public function update(Request $request, BillingDetail $billingDetail)
    {
        $validated = $request->validate([
            'serviceId' => 'sometimes|required|string|exists:services,id',
            'Qty' => 'sometimes|required|integer|min:1',
            'Rate' => 'sometimes|required|numeric|min:0',
            'Amount' => 'sometimes|required|numeric|min:0',
            'SharePercent' => 'nullable|numeric|min:0|max:100',
            'ShareAmount' => 'nullable|numeric|min:0',
            'isServed' => 'nullable|boolean',
        ]);

        $billingDetail->update($validated);

        return response()->json($billingDetail->load(['billing', 'service', 'createdByUser']));
    }

    public function destroy(BillingDetail $billingDetail)
    {
        $billingDetail->delete();
        return response()->json(['message' => 'Billing detail deleted successfully']);
    }
}
