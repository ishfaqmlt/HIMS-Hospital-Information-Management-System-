<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OpdDiagnosisController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('opd_diagnoses')
            ->leftJoin('master_diagnosis', 'opd_diagnoses.diagnosisId', '=', 'master_diagnosis.id')
            ->leftJoin('patients', 'opd_diagnoses.patientId', '=', 'patients.id')
            ->select(
                'opd_diagnoses.*',
                'master_diagnosis.name as name',
                'patients.mrn',
                'patients.pName as patientName'
            );

        if ($request->has('prescriptionId') && !empty($request->prescriptionId)) {
            $query->where('opd_diagnoses.prescriptionId', $request->prescriptionId);
        }

        if ($request->has('patientId') && !empty($request->patientId)) {
            $query->where('opd_diagnoses.patientId', $request->patientId);
        }

        if ($request->has('visitId') && !empty($request->visitId)) {
            $query->where('opd_diagnoses.visitId', $request->visitId);
        }

        $diagnoses = $query->get();

        return response()->json($diagnoses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'diagnosisId' => 'nullable|string',
            'name' => 'nullable|string|max:191',
            'isSynced' => 'nullable|boolean',
        ]);

        $diagnosisId = $validated['diagnosisId'] ?? null;

        if (!$diagnosisId && !empty($validated['name'])) {
            $trimmedName = trim($validated['name']);
            $existing = DB::table('master_diagnosis')
                ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
                ->first();

            if ($existing) {
                $diagnosisId = $existing->id;
            } else {
                $diagnosisId = (string) Str::uuid();
                DB::table('master_diagnosis')->insert([
                    'id' => $diagnosisId,
                    'name' => $trimmedName,
                    'is_active' => true,
                ]);
            }
        }

        if (!$diagnosisId) {
            return response()->json(['message' => 'Valid diagnosis or diagnosisId is required.'], 422);
        }

        $id = (string) Str::uuid();

        $data = [
            'id' => $id,
            'prescriptionId' => $validated['prescriptionId'] ?? null,
            'patientId' => $validated['patientId'] ?? null,
            'visitId' => $validated['visitId'] ?? null,
            'diagnosisId' => $diagnosisId,
            'isSynced' => $validated['isSynced'] ?? false,
        ];

        DB::table('opd_diagnoses')->insert($data);

        $diagnosis = DB::table('opd_diagnoses')
            ->leftJoin('master_diagnosis', 'opd_diagnoses.diagnosisId', '=', 'master_diagnosis.id')
            ->select('opd_diagnoses.*', 'master_diagnosis.name as name')
            ->where('opd_diagnoses.id', $id)
            ->first();

        return response()->json($diagnosis, 201);
    }

    public function sync(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'diagnoses' => 'nullable|array',
        ]);

        $prescriptionId = $validated['prescriptionId'] ?? null;
        $patientId = $validated['patientId'] ?? null;
        $visitId = $validated['visitId'] ?? null;

        if ($prescriptionId) {
            DB::table('opd_diagnoses')->where('prescriptionId', $prescriptionId)->delete();
        } elseif ($visitId) {
            DB::table('opd_diagnoses')->where('visitId', $visitId)->delete();
        } elseif ($patientId) {
            DB::table('opd_diagnoses')->where('patientId', $patientId)->delete();
        }

        $inserted = [];
        $diagnosesList = $validated['diagnoses'] ?? [];
        foreach ($diagnosesList as $item) {
            $diagnosisId = null;
            $name = null;

            if (is_array($item)) {
                $diagnosisId = $item['diagnosisId'] ?? $item['id'] ?? null;
                $name = $item['name'] ?? null;
            } elseif (is_string($item)) {
                if (Str::isUuid($item) && DB::table('master_diagnosis')->where('id', $item)->exists()) {
                    $diagnosisId = $item;
                } else {
                    $name = trim($item);
                }
            }

            if (!$diagnosisId && !empty($name)) {
                $existing = DB::table('master_diagnosis')
                    ->whereRaw('LOWER(name) = ?', [strtolower($name)])
                    ->first();

                if ($existing) {
                    $diagnosisId = $existing->id;
                } else {
                    $diagnosisId = (string) Str::uuid();
                    DB::table('master_diagnosis')->insert([
                        'id' => $diagnosisId,
                        'name' => $name,
                        'is_active' => true,
                    ]);
                }
            }

            if (!$diagnosisId) continue;

            $id = (string) Str::uuid();
            $row = [
                'id' => $id,
                'prescriptionId' => $prescriptionId,
                'patientId' => $patientId,
                'visitId' => $visitId,
                'diagnosisId' => $diagnosisId,
                'isSynced' => false,
            ];
            DB::table('opd_diagnoses')->insert($row);
            $inserted[] = $row;
        }

        return response()->json($inserted, 200);
    }

    public function show($id)
    {
        $diagnosis = DB::table('opd_diagnoses')
            ->leftJoin('master_diagnosis', 'opd_diagnoses.diagnosisId', '=', 'master_diagnosis.id')
            ->select('opd_diagnoses.*', 'master_diagnosis.name as name')
            ->where('opd_diagnoses.id', $id)
            ->first();

        if (!$diagnosis) {
            return response()->json(['message' => 'Diagnosis record not found'], 404);
        }

        return response()->json($diagnosis);
    }

    public function update(Request $request, $id)
    {
        $diagnosis = DB::table('opd_diagnoses')->where('id', $id)->first();

        if (!$diagnosis) {
            return response()->json(['message' => 'Diagnosis record not found'], 404);
        }

        $validated = $request->validate([
            'diagnosisId' => 'required|string|exists:master_diagnosis,id',
            'isSynced' => 'nullable|boolean',
        ]);

        $data = [
            'diagnosisId' => $validated['diagnosisId'],
            'isSynced' => $validated['isSynced'] ?? $diagnosis->isSynced,
        ];

        DB::table('opd_diagnoses')->where('id', $id)->update($data);

        $updated = DB::table('opd_diagnoses')
            ->leftJoin('master_diagnosis', 'opd_diagnoses.diagnosisId', '=', 'master_diagnosis.id')
            ->select('opd_diagnoses.*', 'master_diagnosis.name as name')
            ->where('opd_diagnoses.id', $id)
            ->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        DB::table('opd_diagnoses')->where('id', $id)->delete();

        return response()->json(['message' => 'Diagnosis record deleted successfully']);
    }
}
