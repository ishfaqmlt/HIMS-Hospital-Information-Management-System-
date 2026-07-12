<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with('department')->latest()->get();
        return response()->json($services);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'Code' => 'nullable|string|max:10',
            'DepartmentId' => 'required|exists:departments,id',
            'ServiceName' => 'required|string|max:50',
            'DefaultCharges' => 'required|numeric|min:0',
            'isActive' => 'boolean',
            'printToken' => 'boolean',
        ]);

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
