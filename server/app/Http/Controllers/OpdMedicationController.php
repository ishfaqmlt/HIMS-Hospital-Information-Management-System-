<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OpdMedicationController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('opd_medications')
            ->leftJoin('pharmacy_medicines', 'opd_medications.medicineId', '=', 'pharmacy_medicines.id')
            ->leftJoin('patients', 'opd_medications.patientId', '=', 'patients.id')
            ->select(
                'opd_medications.*',
                'pharmacy_medicines.item_code as itemCode',
                'pharmacy_medicines.barcode',
                'patients.mrn',
                'patients.pName as patientName'
            );

        if ($request->has('prescriptionId') && !empty($request->prescriptionId)) {
            $query->where('opd_medications.prescriptionId', $request->prescriptionId);
        }

        if ($request->has('patientId') && !empty($request->patientId)) {
            $query->where('opd_medications.patientId', $request->patientId);
        }

        if ($request->has('visitId') && !empty($request->visitId)) {
            $query->where('opd_medications.visitId', $request->visitId);
        }

        $medications = $query->orderBy('opd_medications.created_at', 'asc')->get();

        return response()->json($medications);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'medicineId' => 'nullable|string',
            'medicineName' => 'required|string|max:200',
            'genericName' => 'nullable|string|max:200',
            'dosageForm' => 'nullable|string|max:100',
            'dosage' => 'nullable|string|max:100',
            'frequency' => 'nullable|string|max:191',
            'duration' => 'nullable|string|max:191',
            'instruction' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer',
            'isSynced' => 'nullable|boolean',
        ]);

        $id = (string) Str::uuid();

        $data = [
            'id' => $id,
            'prescriptionId' => $validated['prescriptionId'] ?? null,
            'patientId' => $validated['patientId'] ?? null,
            'visitId' => $validated['visitId'] ?? null,
            'medicineId' => $validated['medicineId'] ?? null,
            'medicineName' => $validated['medicineName'],
            'genericName' => $validated['genericName'] ?? null,
            'dosageForm' => $validated['dosageForm'] ?? null,
            'dosage' => $validated['dosage'] ?? null,
            'frequency' => $validated['frequency'] ?? null,
            'duration' => $validated['duration'] ?? null,
            'instruction' => $validated['instruction'] ?? null,
            'quantity' => $validated['quantity'] ?? 1,
            'isSynced' => $validated['isSynced'] ?? false,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('opd_medications')->insert($data);

        $medication = DB::table('opd_medications')->where('id', $id)->first();

        return response()->json($medication, 201);
    }

    public function sync(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'medications' => 'nullable|array',
        ]);

        $prescriptionId = $validated['prescriptionId'] ?? null;
        $patientId = $validated['patientId'] ?? null;
        $visitId = $validated['visitId'] ?? null;

        if ($prescriptionId) {
            DB::table('opd_medications')->where('prescriptionId', $prescriptionId)->delete();
        } elseif ($visitId) {
            DB::table('opd_medications')->where('visitId', $visitId)->delete();
        } elseif ($patientId) {
            DB::table('opd_medications')->where('patientId', $patientId)->delete();
        }

        $inserted = [];
        $medicationsList = $validated['medications'] ?? [];

        foreach ($medicationsList as $item) {
            if (!is_array($item)) continue;

            $name = $item['medicineName'] ?? $item['name'] ?? null;
            if (!$name) continue;

            $medicineId = $item['medicineId'] ?? null;
            if (!$medicineId && Str::isUuid($item['id'] ?? null)) {
                $medicineId = $item['id'];
            }

            $id = (string) Str::uuid();
            $data = [
                'id' => $id,
                'prescriptionId' => $prescriptionId,
                'patientId' => $patientId,
                'visitId' => $visitId,
                'medicineId' => $medicineId,
                'medicineName' => trim($name),
                'genericName' => $item['genericName'] ?? $item['generic_name'] ?? null,
                'dosageForm' => $item['dosageForm'] ?? $item['dosage_form_name'] ?? null,
                'dosage' => $item['dosage'] ?? null,
                'frequency' => $item['frequency'] ?? null,
                'duration' => $item['duration'] ?? null,
                'instruction' => $item['instruction'] ?? null,
                'quantity' => isset($item['quantity']) ? (int) $item['quantity'] : 1,
                'isSynced' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            DB::table('opd_medications')->insert($data);
            $inserted[] = $data;
        }

        return response()->json([
            'message' => 'Medications synced successfully',
            'data' => $inserted,
        ]);
    }

    public function show($id)
    {
        $medication = DB::table('opd_medications')->where('id', $id)->first();

        if (!$medication) {
            return response()->json(['message' => 'Medication record not found'], 404);
        }

        return response()->json($medication);
    }

    public function update(Request $request, $id)
    {
        $medication = DB::table('opd_medications')->where('id', $id)->first();

        if (!$medication) {
            return response()->json(['message' => 'Medication record not found'], 404);
        }

        $validated = $request->validate([
            'medicineId' => 'nullable|string',
            'medicineName' => 'required|string|max:200',
            'genericName' => 'nullable|string|max:200',
            'dosageForm' => 'nullable|string|max:100',
            'dosage' => 'nullable|string|max:100',
            'frequency' => 'nullable|string|max:191',
            'duration' => 'nullable|string|max:191',
            'instruction' => 'nullable|string|max:255',
            'quantity' => 'nullable|integer',
            'isSynced' => 'nullable|boolean',
        ]);

        $data = [
            'medicineId' => $validated['medicineId'] ?? $medication->medicineId,
            'medicineName' => $validated['medicineName'],
            'genericName' => $validated['genericName'] ?? $medication->genericName,
            'dosageForm' => $validated['dosageForm'] ?? $medication->dosageForm,
            'dosage' => $validated['dosage'] ?? $medication->dosage,
            'frequency' => $validated['frequency'] ?? $medication->frequency,
            'duration' => $validated['duration'] ?? $medication->duration,
            'instruction' => $validated['instruction'] ?? $medication->instruction,
            'quantity' => $validated['quantity'] ?? $medication->quantity,
            'isSynced' => $validated['isSynced'] ?? $medication->isSynced,
            'updated_at' => now(),
        ];

        DB::table('opd_medications')->where('id', $id)->update($data);

        $updated = DB::table('opd_medications')->where('id', $id)->first();

        return response()->json($updated);
    }

    public function destroy($id)
    {
        $deleted = DB::table('opd_medications')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Medication record not found'], 404);
        }

        return response()->json(['message' => 'Medication deleted successfully']);
    }
}
