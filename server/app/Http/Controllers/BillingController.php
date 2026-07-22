<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = Billing::with(['patient', 'patientType', 'insuranceCompany', 'department', 'doctor']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('InvoiceNo', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($q2) use ($search) {
                      $q2->where('pName', 'like', "%{$search}%")
                         ->orWhere('patientId', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('patientTypeId') && $request->patientTypeId) {
            $query->where('patientTypeId', $request->patientTypeId);
        }

        if ($request->has('PaymentStatus') && $request->PaymentStatus && $request->PaymentStatus !== 'All') {
            $query->where('PaymentStatus', $request->PaymentStatus);
        }

        if ($request->has('BillType') && $request->BillType && $request->BillType !== 'All') {
            $query->where('BillType', $request->BillType);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('InvoiceDate', now()->toDateString());
        }

        return response()->json($query->latest('InvoiceDate')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|string|exists:patients,patientId',
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

        return response()->json($billing->load(['patient', 'patientType', 'insuranceCompany', 'department', 'doctor']), 201);
    }

    public function show(Billing $billing)
    {
        return response()->json($billing->load(['patient', 'patientType', 'insuranceCompany', 'department', 'doctor', 'postedByUser', 'createdByUser']));
    }

    public function update(Request $request, Billing $billing)
    {
        $validated = $request->validate([
            'patientId' => 'required|string|exists:patients,patientId',
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

        return response()->json($billing->load(['patient', 'patientType', 'insuranceCompany', 'department', 'doctor']));
    }

    public function destroy(Billing $billing)
    {
        $billing->delete();
        return response()->json(['message' => 'Billing record deleted successfully']);
    }
}
