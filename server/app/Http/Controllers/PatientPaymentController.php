<?php

namespace App\Http\Controllers;

use App\Models\PatientPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientPayment::with(['patientVisit.patient', 'billing', 'creator']);

        if ($request->has('visitId') && $request->visitId) {
            $query->where('visitId', $request->visitId);
        }

        if ($request->has('invoiceNo') && $request->invoiceNo) {
            $query->where('invoiceNo', $request->invoiceNo);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoiceNo', 'like', "%{$search}%")
                  ->orWhereHas('patientVisit.patient', function ($q2) use ($search) {
                      $q2->where('pName', 'like', "%{$search}%")
                         ->orWhere('mrn', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitId' => 'required|string|exists:patient_visits,id',
            'invoiceNo' => 'required|string|exists:billings,InvoiceNo',
            'debit' => 'required|numeric|min:0',
            'credit' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $validated['createdBy'] = Auth::id();

        $payment = PatientPayment::create($validated);

        return response()->json($payment->load(['patientVisit.patient', 'billing', 'creator']), 201);
    }

    public function show(PatientPayment $patientPayment)
    {
        return response()->json($patientPayment->load(['patientVisit.patient', 'billing', 'creator']));
    }

    public function update(Request $request, PatientPayment $patientPayment)
    {
        $validated = $request->validate([
            'debit' => 'sometimes|required|numeric|min:0',
            'credit' => 'sometimes|required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $patientPayment->update($validated);

        return response()->json($patientPayment->load(['patientVisit.patient', 'billing', 'creator']));
    }

    public function destroy(PatientPayment $patientPayment)
    {
        $patientPayment->delete();
        return response()->json(['message' => 'Patient payment deleted successfully']);
    }
}
