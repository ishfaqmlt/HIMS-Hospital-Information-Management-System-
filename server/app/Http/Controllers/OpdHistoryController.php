<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OpdHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('opd_histories')
            ->leftJoin('patients', 'opd_histories.patientId', '=', 'patients.id')
            ->leftJoin('users', 'opd_histories.updated_by', '=', 'users.id')
            ->select(
                'opd_histories.*',
                'patients.mrn',
                'patients.pName as patientName',
                'patients.gender',
                'patients.dob',
                'users.name as updated_by_name'
            );

        if ($request->has('patientId') && !empty($request->patientId)) {
            $query->where('opd_histories.patientId', $request->patientId);
        }

        $histories = $query->orderBy('opd_histories.updated_at', 'desc')->get();

        return response()->json($histories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => 'required|string|exists:patients,id',
            'past_medical_history' => 'nullable|string',
            'past_surgical_history' => 'nullable|string',
            'medication_history' => 'nullable|string',
            'allergy_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_history' => 'nullable|string',
        ]);

        $userId = Auth::id();

        $existing = DB::table('opd_histories')
            ->where('patientId', $validated['patientId'])
            ->first();

        if ($existing) {
            $updateData = [
                'past_medical_history' => $validated['past_medical_history'] ?? $existing->past_medical_history,
                'past_surgical_history' => $validated['past_surgical_history'] ?? $existing->past_surgical_history,
                'medication_history' => $validated['medication_history'] ?? $existing->medication_history,
                'allergy_history' => $validated['allergy_history'] ?? $existing->allergy_history,
                'family_history' => $validated['family_history'] ?? $existing->family_history,
                'social_history' => $validated['social_history'] ?? $existing->social_history,
                'updated_by' => $userId,
                'updated_at' => now(),
            ];

            DB::table('opd_histories')
                ->where('id', $existing->id)
                ->update($updateData);

            $record = DB::table('opd_histories')->where('id', $existing->id)->first();
            return response()->json($record, 200);
        }

        $id = (string) Str::uuid();

        $insertData = [
            'id' => $id,
            'patientId' => $validated['patientId'],
            'past_medical_history' => $validated['past_medical_history'] ?? null,
            'past_surgical_history' => $validated['past_surgical_history'] ?? null,
            'medication_history' => $validated['medication_history'] ?? null,
            'allergy_history' => $validated['allergy_history'] ?? null,
            'family_history' => $validated['family_history'] ?? null,
            'social_history' => $validated['social_history'] ?? null,
            'updated_by' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('opd_histories')->insert($insertData);

        $record = DB::table('opd_histories')->where('id', $id)->first();

        return response()->json($record, 201);
    }

    public function show($id)
    {
        $record = DB::table('opd_histories')
            ->leftJoin('patients', 'opd_histories.patientId', '=', 'patients.id')
            ->leftJoin('users', 'opd_histories.updated_by', '=', 'users.id')
            ->select(
                'opd_histories.*',
                'patients.mrn',
                'patients.pName as patientName',
                'users.name as updated_by_name'
            )
            ->where('opd_histories.id', $id)
            ->orWhere('opd_histories.patientId', $id)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'History record not found'], 404);
        }

        return response()->json($record);
    }

    public function update(Request $request, $id)
    {
        $record = DB::table('opd_histories')->where('id', $id)->first();

        if (!$record) {
            return response()->json(['message' => 'History record not found'], 404);
        }

        $validated = $request->validate([
            'past_medical_history' => 'nullable|string',
            'past_surgical_history' => 'nullable|string',
            'medication_history' => 'nullable|string',
            'allergy_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_history' => 'nullable|string',
        ]);

        $updateData = [
            'past_medical_history' => $validated['past_medical_history'] ?? $record->past_medical_history,
            'past_surgical_history' => $validated['past_surgical_history'] ?? $record->past_surgical_history,
            'medication_history' => $validated['medication_history'] ?? $record->medication_history,
            'allergy_history' => $validated['allergy_history'] ?? $record->allergy_history,
            'family_history' => $validated['family_history'] ?? $record->family_history,
            'social_history' => $validated['social_history'] ?? $record->social_history,
            'updated_by' => Auth::id(),
            'updated_at' => now(),
        ];

        DB::table('opd_histories')->where('id', $id)->update($updateData);

        $updated = DB::table('opd_histories')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        DB::table('opd_histories')->where('id', $id)->delete();

        return response()->json(['message' => 'History record deleted']);
    }
}
