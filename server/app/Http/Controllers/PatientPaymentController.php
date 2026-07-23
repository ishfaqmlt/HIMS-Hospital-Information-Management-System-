<?php

namespace App\Http\Controllers;

use App\Models\PatientPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PatientPaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientPayment::with(['patientVisit', 'billing', 'createdByUser']);

        if ($request->has('mrn') && $request->mrn) {
            $query->where('mrn', $request->mrn);
        }

        if ($request->has('invoiceNo') && $request->invoiceNo) {
            $query->where('invoiceNo', $request->invoiceNo);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mrn' => 'required|string|exists:patient_visits,mrn',
            'invoiceNo' => 'required|string|exists:billings,InvoiceNo',
            'debit' => 'required|numeric|min:0',
            'credit' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $validated['createdBy'] = Auth::id();

        $payment = PatientPayment::create($validated);

        return response()->json($payment->load(['patientVisit', 'billing', 'createdByUser']), 201);
    }

    public function show(PatientPayment $patientPayment)
    {
        return response()->json($patientPayment->load(['patientVisit', 'billing', 'createdByUser']));
    }

    public function update(Request $request, PatientPayment $patientPayment)
    {
        $validated = $request->validate([
            'debit' => 'sometimes|required|numeric|min:0',
            'credit' => 'sometimes|required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $patientPayment->update($validated);

        return response()->json($patientPayment->load(['patientVisit', 'billing', 'createdByUser']));
    }

    public function destroy(PatientPayment $patientPayment)
    {
        $patientPayment->delete();
        return response()->json(['message' => 'Patient payment deleted successfully']);
    }
}
