<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $labDepartment = DB::table('departments')->where('DepartmentName', 'Laboratory')->first();

        $query = Service::with('department');

        if ($request->has('laboratory') && $request->laboratory) {
            $query->where('DepartmentId', $labDepartment->id);
        }

        if ($request->has('excludeExistingLabMasterTests') && $request->excludeExistingLabMasterTests) {
            $query->whereNotIn('id', DB::table('lab_master_tests')->pluck('serviceId'));
        }

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'DepartmentId' => 'required|exists:departments,id',
            'ServiceName' => 'required|string|max:50',
            'DefaultCharges' => 'required|numeric|min:0',
            'isActive' => 'boolean',
            'printToken' => 'boolean',
        ]);

        $maxCode = Service::where('DepartmentId', $validated['DepartmentId'])
            ->max('Code');

        $validated['Code'] = $maxCode ? $maxCode + 1 : 1;

        $service = Service::create($validated);

        return response()->json($service->load('department'), 201);
    }

    public function show(Service $service)
    {
        return response()->json($service->load('department'));
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'Code' => 'nullable|string|max:10',
            'DepartmentId' => 'required|exists:departments,id',
            'ServiceName' => 'required|string|max:50',
            'DefaultCharges' => 'required|numeric|min:0',
            'isActive' => 'boolean',
            'printToken' => 'boolean',
        ]);

        $service->update($validated);

        return response()->json($service->load('department'));
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return response()->json(['message' => 'Service deleted successfully']);
    }
}
