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
            ->leftJoin('billings', 'patient_payments.invoiceNo', '=', 'billings.InvoiceNo')
            ->leftJoin('users', 'patient_payments.createdBy', '=', 'users.id')
            ->select(
                'patient_payments.*',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'billings.id as billing_id',
                'billings.TotalAmount as billing_total',
                'users.name as creator_name'
            );

        if ($request->has('visitId') && $request->visitId) {
            $query->where('patient_payments.visitId', $request->visitId);
        }

        if ($request->has('invoiceNo') && $request->invoiceNo) {
            $query->where('patient_payments.invoiceNo', $request->invoiceNo);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_payments.invoiceNo', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%");
            });
        }

        $rows = $query->latest()->get();

        $payments = $rows->map(function ($row) {
            return [
                'id' => $row->id,
                'visitId' => $row->visitId,
                'invoiceNo' => $row->invoiceNo,
                'debit' => $row->debit,
                'credit' => $row->credit,
                'remarks' => $row->remarks,
                'createdBy' => $row->createdBy,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ];
        });

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitId' => 'required|string',
            'invoiceNo' => 'required|string',
            'debit' => 'required|numeric|min:0',
            'credit' => 'required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $validated['createdBy'] = Auth::id();
        $validated['id'] = Str::uuid();
        $validated['created_at'] = now();
        $validated['updated_at'] = now();

        DB::table('patient_payments')->insert($validated);

        $payment = DB::table('patient_payments')->where('id', $validated['id'])->first();

        return response()->json($payment, 201);
    }

    public function show($id)
    {
        $payment = DB::table('patient_payments')->where('id', $id)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'visitId' => 'sometimes|required|string',
            'invoiceNo' => 'sometimes|required|string',
            'debit' => 'sometimes|required|numeric|min:0',
            'credit' => 'sometimes|required|numeric|min:0',
            'remarks' => 'nullable|string',
        ]);

        $validated['updated_at'] = now();

        DB::table('patient_payments')->where('id', $id)->update($validated);

        $payment = DB::table('patient_payments')->where('id', $id)->first();

        return response()->json($payment);
    }

    public function destroy($id)
    {
        DB::table('patient_payments')->where('id', $id)->delete();
        return response()->json(['message' => 'Patient payment deleted successfully']);
    }
}
