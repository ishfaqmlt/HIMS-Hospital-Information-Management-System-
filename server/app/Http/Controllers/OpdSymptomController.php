<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OpdSymptomController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('opd_symptoms')
            ->leftJoin('master_symptoms', 'opd_symptoms.symptomId', '=', 'master_symptoms.id')
            ->leftJoin('patients', 'opd_symptoms.patientId', '=', 'patients.id')
            ->select(
                'opd_symptoms.*',
                'master_symptoms.name as name',
                'master_symptoms.code as code',
                'patients.mrn',
                'patients.pName as patientName'
            );

        if ($request->has('prescriptionId') && !empty($request->prescriptionId)) {
            $query->where('opd_symptoms.prescriptionId', $request->prescriptionId);
        }

        if ($request->has('patientId') && !empty($request->patientId)) {
            $query->where('opd_symptoms.patientId', $request->patientId);
        }

        if ($request->has('visitId') && !empty($request->visitId)) {
            $query->where('opd_symptoms.visitId', $request->visitId);
        }

        $symptoms = $query->get();

        return response()->json($symptoms);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'symptomId' => 'nullable|string',
            'name' => 'nullable|string|max:191',
            'isSynced' => 'nullable|boolean',
        ]);

        $symptomId = $validated['symptomId'] ?? null;

        // If symptomId is not provided, find or create in master_symptoms by name
        if (!$symptomId && !empty($validated['name'])) {
            $trimmedName = trim($validated['name']);
            $existing = DB::table('master_symptoms')
                ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
                ->first();

            if ($existing) {
                $symptomId = $existing->id;
            } else {
                $symptomId = (string) Str::uuid();
                $code = 'SYM-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $trimmedName), 0, 6)) . '-' . rand(100, 999);
                while (DB::table('master_symptoms')->where('code', $code)->exists()) {
                    $code = 'SYM-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $trimmedName), 0, 6)) . '-' . rand(1000, 9999);
                }
                DB::table('master_symptoms')->insert([
                    'id' => $symptomId,
                    'code' => $code,
                    'name' => $trimmedName,
                    'is_active' => true,
                ]);
            }
        }

        if (!$symptomId) {
            return response()->json(['message' => 'Valid symptom or symptomId is required.'], 422);
        }

        $id = (string) Str::uuid();

        $data = [
            'id' => $id,
            'prescriptionId' => $validated['prescriptionId'] ?? null,
            'patientId' => $validated['patientId'] ?? null,
            'visitId' => $validated['visitId'] ?? null,
            'symptomId' => $symptomId,
            'isSynced' => $validated['isSynced'] ?? false,
        ];

        DB::table('opd_symptoms')->insert($data);

        $symptom = DB::table('opd_symptoms')
            ->leftJoin('master_symptoms', 'opd_symptoms.symptomId', '=', 'master_symptoms.id')
            ->select('opd_symptoms.*', 'master_symptoms.name as name', 'master_symptoms.code as code')
            ->where('opd_symptoms.id', $id)
            ->first();

        return response()->json($symptom, 201);
    }

    public function sync(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'symptoms' => 'nullable|array',
        ]);

        $prescriptionId = $validated['prescriptionId'] ?? null;
        $patientId = $validated['patientId'] ?? null;
        $visitId = $validated['visitId'] ?? null;

        // Delete existing symptoms for this prescription/visit
        if ($prescriptionId) {
            DB::table('opd_symptoms')->where('prescriptionId', $prescriptionId)->delete();
        } elseif ($visitId) {
            DB::table('opd_symptoms')->where('visitId', $visitId)->delete();
        } elseif ($patientId) {
            DB::table('opd_symptoms')->where('patientId', $patientId)->delete();
        }

        $inserted = [];
        $symptomsList = $validated['symptoms'] ?? [];
        foreach ($symptomsList as $item) {
            $symptomId = null;
            $symptomName = null;

            if (is_array($item)) {
                $symptomId = $item['symptomId'] ?? $item['id'] ?? null;
                $symptomName = $item['name'] ?? null;
            } elseif (is_string($item)) {
                // Could be UUID or Symptom Name
                if (Str::isUuid($item) && DB::table('master_symptoms')->where('id', $item)->exists()) {
                    $symptomId = $item;
                } else {
                    $symptomName = trim($item);
                }
            }

            if (!$symptomId && !empty($symptomName)) {
                $existing = DB::table('master_symptoms')
                    ->whereRaw('LOWER(name) = ?', [strtolower($symptomName)])
                    ->first();

                if ($existing) {
                    $symptomId = $existing->id;
                } else {
                    $symptomId = (string) Str::uuid();
                    $code = 'SYM-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $symptomName), 0, 6)) . '-' . rand(100, 999);
                    while (DB::table('master_symptoms')->where('code', $code)->exists()) {
                        $code = 'SYM-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $symptomName), 0, 6)) . '-' . rand(1000, 9999);
                    }
                    DB::table('master_symptoms')->insert([
                        'id' => $symptomId,
                        'code' => $code,
                        'name' => $symptomName,
                        'is_active' => true,
                    ]);
                }
            }

            if (!$symptomId) continue;

            $id = (string) Str::uuid();
            $row = [
                'id' => $id,
                'prescriptionId' => $prescriptionId,
                'patientId' => $patientId,
                'visitId' => $visitId,
                'symptomId' => $symptomId,
                'isSynced' => false,
            ];
            DB::table('opd_symptoms')->insert($row);
            $inserted[] = $row;
        }

        return response()->json($inserted, 200);
    }

    public function show($id)
    {
        $symptom = DB::table('opd_symptoms')
            ->leftJoin('master_symptoms', 'opd_symptoms.symptomId', '=', 'master_symptoms.id')
            ->select('opd_symptoms.*', 'master_symptoms.name as name', 'master_symptoms.code as code')
            ->where('opd_symptoms.id', $id)
            ->first();

        if (!$symptom) {
            return response()->json(['message' => 'Symptom not found'], 404);
        }

        return response()->json($symptom);
    }

    public function update(Request $request, $id)
    {
        $symptom = DB::table('opd_symptoms')->where('id', $id)->first();

        if (!$symptom) {
            return response()->json(['message' => 'Symptom not found'], 404);
        }

        $validated = $request->validate([
            'symptomId' => 'required|string|exists:master_symptoms,id',
            'isSynced' => 'nullable|boolean',
        ]);

        $data = [
            'symptomId' => $validated['symptomId'],
            'isSynced' => $validated['isSynced'] ?? $symptom->isSynced,
        ];

        DB::table('opd_symptoms')->where('id', $id)->update($data);

        $updated = DB::table('opd_symptoms')
            ->leftJoin('master_symptoms', 'opd_symptoms.symptomId', '=', 'master_symptoms.id')
            ->select('opd_symptoms.*', 'master_symptoms.name as name', 'master_symptoms.code as code')
            ->where('opd_symptoms.id', $id)
            ->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        DB::table('opd_symptoms')->where('id', $id)->delete();

        return response()->json(['message' => 'Symptom deleted successfully']);
    }
}
