<?php

namespace App\Http\Controllers;

use App\Models\RoomsWardsMaster;
use Illuminate\Http\Request;

class RoomsWardsController extends Controller
{
    public function index()
    {
        $rooms = RoomsWardsMaster::with('floor')->latest()->get();
        return response()->json($rooms);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'floorId' => 'required|uuid|exists:floor_master,id',
            'RoomWardType' => 'required|in:Private Room,Ward',
            'RoomWardName' => 'required|string|max:100',
            'isFunctional' => 'boolean',
        ]);

        $room = RoomsWardsMaster::create($validated);

        return response()->json($room->load('floor'), 201);
    }

    public function show(RoomsWardsMaster $room)
    {
        return response()->json($room->load('floor'));
    }

    public function update(Request $request, RoomsWardsMaster $room)
    {
        $validated = $request->validate([
            'floorId' => 'required|uuid|exists:floor_master,id',
            'RoomWardType' => 'required|in:Private Room,Ward',
            'RoomWardName' => 'required|string|max:100',
            'isFunctional' => 'boolean',
        ]);

        $room->update($validated);

        return response()->json($room->load('floor'));
    }

    public function destroy(RoomsWardsMaster $room)
    {
        $room->delete();

        return response()->json(['message' => 'Room/Ward deleted successfully']);
    }
}
