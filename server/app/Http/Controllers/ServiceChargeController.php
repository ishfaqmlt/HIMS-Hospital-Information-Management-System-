<?php

namespace App\Http\Controllers;

use App\Models\ServiceCharge;
use Illuminate\Http\Request;

class ServiceChargeController extends Controller
{
    public function index()
    {
        return ServiceCharge::with(['doctor', 'service', 'department'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'doctorId' => 'required|exists:doctors,Id',
            'ServiceId' => 'required|exists:services,id',
            'departmentId' => 'required|exists:departments,id',
            'Charges' => 'required|numeric|min:0',
            'isSynced' => 'boolean',
        ]);

        $item = ServiceCharge::create($validated);

        return response()->json($item->load(['doctor', 'service', 'department']), 201);
    }

    public function show(ServiceCharge $serviceCharge)
    {
        return $serviceCharge->load(['doctor', 'service', 'department']);
    }

    public function update(Request $request, ServiceCharge $serviceCharge)
    {
        $validated = $request->validate([
            'doctorId' => 'required|exists:doctors,Id',
            'ServiceId' => 'required|exists:services,id',
            'departmentId' => 'required|exists:departments,id',
            'Charges' => 'required|numeric|min:0',
            'isSynced' => 'boolean',
        ]);

        $serviceCharge->update($validated);

        return response()->json($serviceCharge->load(['doctor', 'service', 'department']));
    }

    public function destroy(ServiceCharge $serviceCharge)
    {
        $serviceCharge->delete();

        return response()->json(['message' => 'Service charge deleted']);
    }
}
