<?php

namespace App\Http\Controllers;

use App\Models\VisitType;
use Illuminate\Http\Request;

class VisitTypeController extends Controller
{
    public function index()
    {
        $visitTypes = VisitType::latest()->get();
        return response()->json($visitTypes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'visitType' => 'required|in:OPD,IPD',
        ]);

        $visitType = VisitType::create($validated);

        return response()->json($visitType, 201);
    }

    public function show(VisitType $visitType)
    {
        return response()->json($visitType);
    }

    public function update(Request $request, VisitType $visitType)
    {
        $validated = $request->validate([
            'visitType' => 'required|in:OPD,IPD',
        ]);

        $visitType->update($validated);

        return response()->json($visitType);
    }

    public function destroy(VisitType $visitType)
    {
        $visitType->delete();

        return response()->json(['message' => 'Visit type deleted successfully']);
    }
}
