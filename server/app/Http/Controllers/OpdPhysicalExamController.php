<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OpdPhysicalExamController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('opd_physical_exams')
            ->leftJoin('master_physical_exam', 'opd_physical_exams.physicalExamId', '=', 'master_physical_exam.id')
            ->leftJoin('patients', 'opd_physical_exams.patientId', '=', 'patients.id')
            ->select(
                'opd_physical_exams.*',
                'master_physical_exam.name as name',
                'patients.mrn',
                'patients.pName as patientName'
            );

        if ($request->has('prescriptionId') && !empty($request->prescriptionId)) {
            $query->where('opd_physical_exams.prescriptionId', $request->prescriptionId);
        }

        if ($request->has('patientId') && !empty($request->patientId)) {
            $query->where('opd_physical_exams.patientId', $request->patientId);
        }

        if ($request->has('visitId') && !empty($request->visitId)) {
            $query->where('opd_physical_exams.visitId', $request->visitId);
        }

        $exams = $query->get();

        return response()->json($exams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'physicalExamId' => 'nullable|string',
            'name' => 'nullable|string|max:191',
            'isSynced' => 'nullable|boolean',
        ]);

        $physicalExamId = $validated['physicalExamId'] ?? null;

        if (!$physicalExamId && !empty($validated['name'])) {
            $trimmedName = trim($validated['name']);
            $existing = DB::table('master_physical_exam')
                ->whereRaw('LOWER(name) = ?', [strtolower($trimmedName)])
                ->first();

            if ($existing) {
                $physicalExamId = $existing->id;
            } else {
                $physicalExamId = (string) Str::uuid();
                DB::table('master_physical_exam')->insert([
                    'id' => $physicalExamId,
                    'name' => $trimmedName,
                    'is_active' => true,
                ]);
            }
        }

        if (!$physicalExamId) {
            return response()->json(['message' => 'Valid physical exam or physicalExamId is required.'], 422);
        }

        $id = (string) Str::uuid();

        $data = [
            'id' => $id,
            'prescriptionId' => $validated['prescriptionId'] ?? null,
            'patientId' => $validated['patientId'] ?? null,
            'visitId' => $validated['visitId'] ?? null,
            'physicalExamId' => $physicalExamId,
            'isSynced' => $validated['isSynced'] ?? false,
        ];

        DB::table('opd_physical_exams')->insert($data);

        $exam = DB::table('opd_physical_exams')
            ->leftJoin('master_physical_exam', 'opd_physical_exams.physicalExamId', '=', 'master_physical_exam.id')
            ->select('opd_physical_exams.*', 'master_physical_exam.name as name')
            ->where('opd_physical_exams.id', $id)
            ->first();

        return response()->json($exam, 201);
    }

    public function sync(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'exams' => 'nullable|array',
        ]);

        $prescriptionId = $validated['prescriptionId'] ?? null;
        $patientId = $validated['patientId'] ?? null;
        $visitId = $validated['visitId'] ?? null;

        if ($prescriptionId) {
            DB::table('opd_physical_exams')->where('prescriptionId', $prescriptionId)->delete();
        } elseif ($visitId) {
            DB::table('opd_physical_exams')->where('visitId', $visitId)->delete();
        } elseif ($patientId) {
            DB::table('opd_physical_exams')->where('patientId', $patientId)->delete();
        }

        $inserted = [];
        $examsList = $validated['exams'] ?? [];
        foreach ($examsList as $item) {
            $physicalExamId = null;
            $name = null;

            if (is_array($item)) {
                $physicalExamId = $item['physicalExamId'] ?? $item['id'] ?? null;
                $name = $item['name'] ?? null;
            } elseif (is_string($item)) {
                if (Str::isUuid($item) && DB::table('master_physical_exam')->where('id', $item)->exists()) {
                    $physicalExamId = $item;
                } else {
                    $name = trim($item);
                }
            }

            if (!$physicalExamId && !empty($name)) {
                $existing = DB::table('master_physical_exam')
                    ->whereRaw('LOWER(name) = ?', [strtolower($name)])
                    ->first();

                if ($existing) {
                    $physicalExamId = $existing->id;
                } else {
                    $physicalExamId = (string) Str::uuid();
                    DB::table('master_physical_exam')->insert([
                        'id' => $physicalExamId,
                        'name' => $name,
                        'is_active' => true,
                    ]);
                }
            }

            if (!$physicalExamId) continue;

            $id = (string) Str::uuid();
            $row = [
                'id' => $id,
                'prescriptionId' => $prescriptionId,
                'patientId' => $patientId,
                'visitId' => $visitId,
                'physicalExamId' => $physicalExamId,
                'isSynced' => false,
            ];
            DB::table('opd_physical_exams')->insert($row);
            $inserted[] = $row;
        }

        return response()->json($inserted, 200);
    }

    public function show($id)
    {
        $exam = DB::table('opd_physical_exams')
            ->leftJoin('master_physical_exam', 'opd_physical_exams.physicalExamId', '=', 'master_physical_exam.id')
            ->select('opd_physical_exams.*', 'master_physical_exam.name as name')
            ->where('opd_physical_exams.id', $id)
            ->first();

        if (!$exam) {
            return response()->json(['message' => 'Physical exam record not found'], 404);
        }

        return response()->json($exam);
    }

    public function update(Request $request, $id)
    {
        $exam = DB::table('opd_physical_exams')->where('id', $id)->first();

        if (!$exam) {
            return response()->json(['message' => 'Physical exam record not found'], 404);
        }

        $validated = $request->validate([
            'physicalExamId' => 'required|string|exists:master_physical_exam,id',
            'isSynced' => 'nullable|boolean',
        ]);

        $data = [
            'physicalExamId' => $validated['physicalExamId'],
            'isSynced' => $validated['isSynced'] ?? $exam->isSynced,
        ];

        DB::table('opd_physical_exams')->where('id', $id)->update($data);

        $updated = DB::table('opd_physical_exams')
            ->leftJoin('master_physical_exam', 'opd_physical_exams.physicalExamId', '=', 'master_physical_exam.id')
            ->select('opd_physical_exams.*', 'master_physical_exam.name as name')
            ->where('opd_physical_exams.id', $id)
            ->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        DB::table('opd_physical_exams')->where('id', $id)->delete();

        return response()->json(['message' => 'Physical exam record deleted successfully']);
    }
}
