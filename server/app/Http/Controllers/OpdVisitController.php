<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OpdVisitController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('patient_visits')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'patient_visits.doctorId', '=', 'doctors.id')
            ->select(
                'patient_visits.*',
                'patients.pName as patient_name',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.gender as patient_gender',
                'patients.dob as patient_dob',
                'doctors.Name as doctor_name'
            );

        if ($request->has('patientId') && $request->patientId) {
            $query->where('patient_visits.patientId', $request->patientId);
        }

        if ($request->has('doctorId') && $request->doctorId) {
            $query->where('patient_visits.doctorId', $request->doctorId);
        }

        if ($request->has('status') && $request->status && $request->status !== 'All') {
            $query->where('patient_visits.status', $request->status);
        }

        if ($request->has('today') && $request->today) {
            $query->whereDate('patient_visits.visitDate', Carbon::today());
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('patient_visits.visitNo', 'like', "%{$search}%")
                  ->orWhere('patients.pName', 'like', "%{$search}%")
                  ->orWhere('patients.mrn', 'like', "%{$search}%")
                  ->orWhere('patients.mobile', 'like', "%{$search}%");
            });
        }

        $visits = $query->orderBy('patient_visits.visitDate', 'desc')->get();

        return response()->json($visits);
    }

    public function getOpdQueue(Request $request)
    {
        $user = Auth::user();

        // Find doctor linked by user_id or Email
        $doctor = null;
        if ($user) {
            $doctor = Doctor::where('user_id', $user->id)
                ->orWhere('Email', $user->email)
                ->first();
        }

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
                'patients.gName as patient_gname',
                'patients.mrn as patient_mrn',
                'patients.mobile as patient_mobile',
                'patients.gender as patient_gender',
                'patients.dob as patient_dob',
                'patients.cnic as patient_cnic',
                'patient_visits.id as visit_id',
                'patient_visits.visitNo',
                'patient_visits.status as Status',
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

        if ($user && $doctor && !$user->hasRole(['super_admin', 'admin'])) {
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

    public function show($id)
    {
        $visit = DB::table('patient_visits')
            ->leftJoin('patients', 'patient_visits.patientId', '=', 'patients.id')
            ->leftJoin('doctors', 'patient_visits.doctorId', '=', 'doctors.id')
            ->where('patient_visits.id', $id)
            ->first();

        if (!$visit) {
            return response()->json(['message' => 'Visit not found'], 404);
        }

        return response()->json($visit);
    }

    public function update(Request $request, $id)
    {
        $data = [];
        if ($request->has('Status') || $request->has('status')) {
            $data['status'] = $request->input('Status') ?? $request->input('status');
        }
        if ($request->has('doctorId')) {
            $data['doctorId'] = $request->input('doctorId');
        }

        if (!empty($data)) {
            $data['updated_at'] = now();
            DB::table('patient_visits')->where('id', $id)->update($data);
        }

        $updated = DB::table('patient_visits')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        DB::table('patient_visits')->where('id', $id)->delete();

        return response()->json(['message' => 'Patient visit deleted']);
    }
}
