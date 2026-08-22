<?php

namespace App\Http\Controllers;

use App\Models\OpdVisit;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OpdVisitController extends Controller
{
    public function index(Request $request)
    {
        $query = OpdVisit::with(['patient', 'doctor', 'department']);

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patientId', $request->patientId);
        }

        if ($request->has('DoctorId') && $request->DoctorId) {
            $query->where('DoctorId', $request->DoctorId);
        }

        if ($request->has('DepartmentId') && $request->DepartmentId) {
            $query->where('DepartmentId', $request->DepartmentId);
        }

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('Status', $request->status);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('VisitDate', Carbon::today());
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('VisitNo', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($q2) use ($search) {
                      $q2->where('pName', 'like', "%{$search}%")
                         ->orWhere('patientId', 'like', "%{$search}%")
                         ->orWhere('mobile', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->latest('VisitDate')->get());
    }

    public function getOpdQueue(Request $request)
    {
        $user = Auth::user();

        // Find doctor linked by user_id or Email
        $doctor = Doctor::where('user_id', $user->id)
            ->orWhere('Email', $user->email)
            ->first();

        $query = DB::table('billings')
            ->leftJoin('patient_visits', 'billings.visitId', '=', 'patient_visits.id')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('departments', 'billings.DepartmentId', '=', 'departments.id')
            ->leftJoin('doctors', 'billings.DoctorId', '=', 'doctors.id')
            ->select(
                'billings.id as billing_id',
                'billings.InvoiceNo',
                'billings.InvoiceDate',
                'billings.tokenNo',
                'billings.SubTotal',
                'billings.TotalAmount',
                'billings.PaymentStatus',
                'billings.DoctorId',
                'billings.DepartmentId',
                'patients.id as patient_id',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.gender as patient_gender',
                'patient_visits.id as visit_id',
                'patient_visits.visitNo',
                'departments.DepartmentName as department_name',
                'doctors.Name as doctor_name'
            )
            ->where('billings.tokenNo', '>', 0);

        if ($request->has('fromDate') && $request->fromDate && $request->has('toDate') && $request->toDate) {
            $query->whereBetween(DB::raw('DATE(billings.InvoiceDate)'), [$request->fromDate, $request->toDate]);
        } elseif ($request->has('date') && $request->date) {
            $query->whereDate('billings.InvoiceDate', $request->date);
        } else {
            $query->whereDate('billings.InvoiceDate', Carbon::today());
        }

        if ($doctor && !$user->hasRole(['super_admin', 'admin'])) {
            $query->where('billings.DoctorId', $doctor->id);
        } elseif ($request->has('DoctorId') && $request->DoctorId) {
            $query->where('billings.DoctorId', $request->DoctorId);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('billings.InvoiceNo', 'like', "%{$search}%")
                  ->orWhere('billings.tokenNo', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%")
                  ->orWhere('patients.mobile', 'like', "%{$search}%");
            });
        }

        $queue = $query->orderBy('billings.tokenNo', 'asc')->get();

        return response()->json($queue);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'required|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'VisitDate' => 'required|date',
            'VisitNo' => 'required|string|max:20',
            'VisitType' => 'required|in:OPD,Followup,Emergency',
            'ConsultationFee' => 'required|numeric|min:0',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'Notes' => 'nullable|string',
            'Status' => 'required|in:Waiting,In Progress,Completed,Cancelled',
            'isPrescriptionGiven' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $validated['CreatedBy'] = Auth::id();

        $item = OpdVisit::create($validated);

        return response()->json($item->load(['patient', 'doctor', 'department']), 201);
    }

    public function show(OpdVisit $opdVisit)
    {
        return response()->json($opdVisit->load(['patient', 'doctor', 'department']));
    }

    public function update(Request $request, OpdVisit $opdVisit)
    {
        $validated = $request->validate([
            'patientId' => 'required|exists:patients,id',
            'DoctorId' => 'required|exists:doctors,id',
            'DepartmentId' => 'nullable|exists:departments,id',
            'VisitDate' => 'required|date',
            'VisitNo' => 'required|string|max:20',
            'VisitType' => 'required|in:OPD,Followup,Emergency',
            'ConsultationFee' => 'required|numeric|min:0',
            'ChiefComplaint' => 'nullable|string',
            'Diagnosis' => 'nullable|string',
            'Notes' => 'nullable|string',
            'Status' => 'required|in:Waiting,In Progress,Completed,Cancelled',
            'isPrescriptionGiven' => 'boolean',
            'isSynced' => 'boolean',
        ]);

        $opdVisit->update($validated);

        return response()->json($opdVisit->load(['patient', 'doctor', 'department']));
    }

    public function destroy(OpdVisit $opdVisit)
    {
        $opdVisit->delete();

        return response()->json(['message' => 'OPD visit deleted']);
    }
}
