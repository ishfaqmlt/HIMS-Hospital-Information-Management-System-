<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BillingController extends Controller
{
    public function index(Request $request)
    {
        $query = Billing::with(['patient']);

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('invoiceType') && $request->invoiceType && $request->invoiceType !== 'All') {
            $query->where('InvoiceType', $request->invoiceType);
        }

        if ($request->has('paymentStatus') && $request->paymentStatus && $request->paymentStatus !== 'All') {
            $query->where('PaymentStatus', $request->paymentStatus);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('InvoiceDate', Carbon::today());
        }

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

        return response()->json($query->latest('InvoiceDate')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'InvoiceNo' => 'required|string|max:20',
            'InvoiceDate' => 'required|date',
            'InvoiceType' => 'required|in:OPD,IPD,Emergency,Laboratory,Pharmacy,Radiology,Other',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'Tax' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaidAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled',
            'PaymentMethod' => 'required|in:Cash,Card,BankTransfer,Insurance,Other',
            'Notes' => 'nullable|string',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();
        $validated['Balance'] = $validated['TotalAmount'] - $validated['PaidAmount'];

        $item = Billing::create($validated);

        return response()->json($item->load('patient'), 201);
    }

    public function show(Billing $billing)
    {
        return response()->json($billing->load('patient'));
    }

    public function update(Request $request, Billing $billing)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'InvoiceNo' => 'required|string|max:20',
            'InvoiceDate' => 'required|date',
            'InvoiceType' => 'required|in:OPD,IPD,Emergency,Laboratory,Pharmacy,Radiology,Other',
            'SubTotal' => 'required|numeric|min:0',
            'Discount' => 'required|numeric|min:0',
            'Tax' => 'required|numeric|min:0',
            'TotalAmount' => 'required|numeric|min:0',
            'PaidAmount' => 'required|numeric|min:0',
            'PaymentStatus' => 'required|in:Pending,Partial,Paid,Cancelled',
            'PaymentMethod' => 'required|in:Cash,Card,BankTransfer,Insurance,Other',
            'Notes' => 'nullable|string',
            'isSynced' => 'boolean',
        ]);

        $validated['Balance'] = $validated['TotalAmount'] - $validated['PaidAmount'];

        $billing->update($validated);

        return response()->json($billing->load('patient'));
    }

    public function destroy(Billing $billing)
    {
        $billing->delete();

        return response()->json(['message' => 'Billing record deleted']);
    }
}
