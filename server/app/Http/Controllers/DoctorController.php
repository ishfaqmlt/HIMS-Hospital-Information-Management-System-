<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::with('user');

        if ($request->has('opd') && $request->opd) {
            $query->where('Opd', true);
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'Name' => 'required|string|max:100',
            'Gender' => 'nullable|in:Male,Female,Other',
            'Dob' => 'nullable|date',
            'Email' => 'nullable|email|max:50',
            'Phone' => 'nullable|string|max:20',
            'Cnic' => 'nullable|string|max:20',
            'RegistrationNo' => 'nullable|string|max:50',
            'Address' => 'nullable|string',
            'JoiningDate' => 'nullable|date',
            'EmployeementStatus' => 'nullable|in:Active,Resigned,Terminated,Retired',
            'Stamp' => 'nullable|string',
            'Opd' => 'boolean',
            'Surgeon' => 'boolean',
            'Anesthetist' => 'boolean',
        ]);

        $doctor = Doctor::create($validated);

        return response()->json($doctor->load('user'), 201);
    }

    public function show(Doctor $doctor)
    {
        return response()->json($doctor->load('user'));
    }

    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'Name' => 'required|string|max:100',
            'Gender' => 'nullable|in:Male,Female,Other',
            'Dob' => 'nullable|date',
            'Email' => 'nullable|email|max:50',
            'Phone' => 'nullable|string|max:20',
            'Cnic' => 'nullable|string|max:20',
            'RegistrationNo' => 'nullable|string|max:50',
            'Address' => 'nullable|string',
            'JoiningDate' => 'nullable|date',
            'EmployeementStatus' => 'nullable|in:Active,Resigned,Terminated,Retired',
            'Stamp' => 'nullable|string',
            'Opd' => 'boolean',
            'Surgeon' => 'boolean',
            'Anesthetist' => 'boolean',
        ]);

        $doctor->update($validated);

        return response()->json($doctor->load('user'));
    }

    public function destroy(Doctor $doctor)
    {
        $doctor->delete();

        return response()->json(['message' => 'Doctor deleted successfully']);
    }
}
