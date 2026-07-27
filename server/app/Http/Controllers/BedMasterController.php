<?php

namespace App\Http\Controllers;

use App\Models\BedMaster;
use Illuminate\Http\Request;

class BedMasterController extends Controller
{
    public function index()
    {
        $beds = BedMaster::with(['floor', 'roomWard'])->latest()->get();
        return response()->json($beds);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'floorId' => 'required|uuid|exists:floor_master,id',
            'roomWardId' => 'required|uuid|exists:rooms_wards_master,id',
            'BedNo' => 'required|string|max:50',
            'Rent' => 'required|numeric|min:0',
            'AcCharges' => 'required|numeric|min:0',
            'isFunctional' => 'boolean',
        ]);

        $bed = BedMaster::create($validated);

        return response()->json($bed->load(['floor', 'roomWard']), 201);
    }

    public function show(BedMaster $bed)
    {
        return response()->json($bed->load(['floor', 'roomWard']));
    }

    public function update(Request $request, BedMaster $bed)
    {
        $validated = $request->validate([
            'floorId' => 'required|uuid|exists:floor_master,id',
            'roomWardId' => 'required|uuid|exists:rooms_wards_master,id',
            'BedNo' => 'required|string|max:50',
            'Rent' => 'required|numeric|min:0',
            'AcCharges' => 'required|numeric|min:0',
            'isFunctional' => 'boolean',
        ]);

        $bed->update($validated);

        return response()->json($bed->load(['floor', 'roomWard']));
    }

    public function destroy(BedMaster $bed)
    {
        $bed->delete();

        return response()->json(['message' => 'Bed deleted successfully']);
    }
}
