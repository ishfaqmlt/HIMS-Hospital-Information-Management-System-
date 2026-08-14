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
