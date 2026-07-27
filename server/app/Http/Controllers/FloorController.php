<?php

namespace App\Http\Controllers;

use App\Models\FloorMaster;
use Illuminate\Http\Request;

class FloorController extends Controller
{
    public function index()
    {
        $floors = FloorMaster::latest()->get();
        return response()->json($floors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'FloorName' => 'required|string|max:50',
            'isFunctional' => 'boolean',
        ]);

        $floor = FloorMaster::create($validated);

        return response()->json($floor, 201);
    }

    public function show(FloorMaster $floor)
    {
        return response()->json($floor);
    }

    public function update(Request $request, FloorMaster $floor)
    {
        $validated = $request->validate([
            'FloorName' => 'required|string|max:50',
            'isFunctional' => 'boolean',
        ]);

        $floor->update($validated);

        return response()->json($floor);
    }

    public function destroy(FloorMaster $floor)
    {
        $floor->delete();

        return response()->json(['message' => 'Floor deleted successfully']);
    }
}
