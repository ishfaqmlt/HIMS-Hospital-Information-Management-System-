<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OpdInvestigationController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('opd_investigations')
            ->leftJoin('services', 'opd_investigations.serviceId', '=', 'services.id')
            ->leftJoin('departments', 'opd_investigations.departmentId', '=', 'departments.id')
            ->leftJoin('patients', 'opd_investigations.patientId', '=', 'patients.id')
            ->select(
                'opd_investigations.*',
                'services.ServiceName as serviceName',
                'services.ServiceName as name',
                'services.Code as serviceCode',
                'services.DefaultCharges as charges',
                'departments.DepartmentName as departmentName',
                'patients.mrn',
                'patients.pName as patientName'
            );

        if ($request->has('prescriptionId') && !empty($request->prescriptionId)) {
            $query->where('opd_investigations.prescriptionId', $request->prescriptionId);
        }

        if ($request->has('patientId') && !empty($request->patientId)) {
            $query->where('opd_investigations.patientId', $request->patientId);
        }

        if ($request->has('visitId') && !empty($request->visitId)) {
            $query->where('opd_investigations.visitId', $request->visitId);
        }

        if ($request->has('departmentId') && !empty($request->departmentId)) {
            $query->where('opd_investigations.departmentId', $request->departmentId);
        }

        $investigations = $query->get();

        return response()->json($investigations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'departmentId' => 'nullable|string',
            'serviceId' => 'nullable|string',
            'name' => 'nullable|string|max:191',
            'instructions' => 'nullable|string|max:255',
            'isSynced' => 'nullable|boolean',
        ]);

        $serviceId = $validated['serviceId'] ?? null;
        $departmentId = $validated['departmentId'] ?? null;

        // If serviceId not given but name given, search in services table
        if (!$serviceId && !empty($validated['name'])) {
            $trimmedName = trim($validated['name']);
            $existingService = DB::table('services')
                ->whereRaw('LOWER(ServiceName) = ?', [strtolower($trimmedName)])
                ->first();

            if ($existingService) {
                $serviceId = $existingService->id;
                if (!$departmentId) {
                    $departmentId = $existingService->DepartmentId;
                }
            }
        }

        // If serviceId exists, fetch departmentId if not already set
        if ($serviceId && !$departmentId) {
            $svc = DB::table('services')->where('id', $serviceId)->first();
            if ($svc) {
                $departmentId = $svc->DepartmentId;
            }
        }

        if (!$serviceId) {
            return response()->json(['message' => 'A valid serviceId or service name is required.'], 422);
        }

        $id = (string) Str::uuid();

        $data = [
            'id' => $id,
            'prescriptionId' => $validated['prescriptionId'] ?? null,
            'patientId' => $validated['patientId'] ?? null,
            'visitId' => $validated['visitId'] ?? null,
            'departmentId' => $departmentId,
            'serviceId' => $serviceId,
            'instructions' => $validated['instructions'] ?? null,
            'isSynced' => $validated['isSynced'] ?? false,
        ];

        DB::table('opd_investigations')->insert($data);

        $investigation = DB::table('opd_investigations')
            ->leftJoin('services', 'opd_investigations.serviceId', '=', 'services.id')
            ->leftJoin('departments', 'opd_investigations.departmentId', '=', 'departments.id')
            ->select(
                'opd_investigations.*',
                'services.ServiceName as serviceName',
                'services.ServiceName as name',
                'services.Code as serviceCode',
                'departments.DepartmentName as departmentName'
            )
            ->where('opd_investigations.id', $id)
            ->first();

        return response()->json($investigation, 201);
    }

    public function sync(Request $request)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'investigations' => 'nullable|array',
        ]);

        $prescriptionId = $validated['prescriptionId'] ?? null;
        $patientId = $validated['patientId'] ?? null;
        $visitId = $validated['visitId'] ?? null;

        if ($prescriptionId) {
            DB::table('opd_investigations')->where('prescriptionId', $prescriptionId)->delete();
        } elseif ($visitId) {
            DB::table('opd_investigations')->where('visitId', $visitId)->delete();
        } elseif ($patientId) {
            DB::table('opd_investigations')->where('patientId', $patientId)->delete();
        }

        $inserted = [];
        $investigationsList = $validated['investigations'] ?? [];

        foreach ($investigationsList as $item) {
            $serviceId = null;
            $departmentId = null;
            $instructions = null;

            if (is_array($item)) {
                $serviceId = $item['serviceId'] ?? $item['id'] ?? null;
                $departmentId = $item['departmentId'] ?? null;
                $instructions = $item['instructions'] ?? null;
                $name = $item['serviceName'] ?? $item['name'] ?? null;

                if (!$serviceId && $name) {
                    $existingService = DB::table('services')
                        ->whereRaw('LOWER(ServiceName) = ?', [strtolower(trim($name))])
                        ->first();
                    if ($existingService) {
                        $serviceId = $existingService->id;
                        if (!$departmentId) $departmentId = $existingService->DepartmentId;
                    }
                }
            } elseif (is_string($item)) {
                if (Str::isUuid($item) && DB::table('services')->where('id', $item)->exists()) {
                    $serviceId = $item;
                } else {
                    $name = trim($item);
                    $existingService = DB::table('services')
                        ->whereRaw('LOWER(ServiceName) = ?', [strtolower($name)])
                        ->first();
                    if ($existingService) {
                        $serviceId = $existingService->id;
                        $departmentId = $existingService->DepartmentId;
                    }
                }
            }

            if ($serviceId) {
                if (!$departmentId) {
                    $svc = DB::table('services')->where('id', $serviceId)->first();
                    if ($svc) {
                        $departmentId = $svc->DepartmentId;
                    }
                }

                $id = (string) Str::uuid();
                $record = [
                    'id' => $id,
                    'prescriptionId' => $prescriptionId,
                    'patientId' => $patientId,
                    'visitId' => $visitId,
                    'departmentId' => $departmentId,
                    'serviceId' => $serviceId,
                    'instructions' => $instructions,
                    'isSynced' => false,
                ];

                DB::table('opd_investigations')->insert($record);
                $inserted[] = $id;
            }
        }

        $results = DB::table('opd_investigations')
            ->leftJoin('services', 'opd_investigations.serviceId', '=', 'services.id')
            ->leftJoin('departments', 'opd_investigations.departmentId', '=', 'departments.id')
            ->select(
                'opd_investigations.*',
                'services.ServiceName as serviceName',
                'services.ServiceName as name',
                'services.Code as serviceCode',
                'departments.DepartmentName as departmentName'
            )
            ->whereIn('opd_investigations.id', $inserted)
            ->get();

        return response()->json($results);
    }

    public function show($id)
    {
        $investigation = DB::table('opd_investigations')
            ->leftJoin('services', 'opd_investigations.serviceId', '=', 'services.id')
            ->leftJoin('departments', 'opd_investigations.departmentId', '=', 'departments.id')
            ->select(
                'opd_investigations.*',
                'services.ServiceName as serviceName',
                'services.ServiceName as name',
                'services.Code as serviceCode',
                'departments.DepartmentName as departmentName'
            )
            ->where('opd_investigations.id', $id)
            ->first();

        if (!$investigation) {
            return response()->json(['message' => 'Investigation record not found'], 404);
        }

        return response()->json($investigation);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'prescriptionId' => 'nullable|string',
            'patientId' => 'nullable|string',
            'visitId' => 'nullable|string',
            'departmentId' => 'nullable|string',
            'serviceId' => 'nullable|string',
            'instructions' => 'nullable|string|max:255',
            'isSynced' => 'nullable|boolean',
        ]);

        $data = array_filter([
            'prescriptionId' => $validated['prescriptionId'] ?? null,
            'patientId' => $validated['patientId'] ?? null,
            'visitId' => $validated['visitId'] ?? null,
            'departmentId' => $validated['departmentId'] ?? null,
            'serviceId' => $validated['serviceId'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'isSynced' => $validated['isSynced'] ?? null,
        ], fn($v) => !is_null($v));

        DB::table('opd_investigations')->where('id', $id)->update($data);

        $investigation = DB::table('opd_investigations')
            ->leftJoin('services', 'opd_investigations.serviceId', '=', 'services.id')
            ->leftJoin('departments', 'opd_investigations.departmentId', '=', 'departments.id')
            ->select(
                'opd_investigations.*',
                'services.ServiceName as serviceName',
                'services.ServiceName as name',
                'services.Code as serviceCode',
                'departments.DepartmentName as departmentName'
            )
            ->where('opd_investigations.id', $id)
            ->first();

        return response()->json($investigation);
    }

    public function destroy($id)
    {
        DB::table('opd_investigations')->where('id', $id)->delete();
        return response()->json(['message' => 'Investigation deleted successfully']);
    }
}
