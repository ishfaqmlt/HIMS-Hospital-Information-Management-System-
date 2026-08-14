<?php

namespace App\Http\Controllers;

use App\Models\LabMasterTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabMasterTestController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('lab_master_tests')
            ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
            ->leftJoin('lab_headers', 'lab_master_tests.lab_headers_id', '=', 'lab_headers.id')
            ->leftJoin('lab_required_samples', 'lab_master_tests.lab_required_sample_id', '=', 'lab_required_samples.id')
            ->select(
                'lab_master_tests.*',
                'services.ServiceName as serviceName',
                'services.Code as serviceCode',
                'lab_headers.header_name as header_name',
                'lab_required_samples.required_sample_name as required_sample_name'
            );

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('services.ServiceName', 'like', "%{$search}%")
                  ->orWhere('services.Code', 'like', "%{$search}%")
                  ->orWhere('lab_headers.header_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('isActive') && $request->isActive !== '') {
            $query->where('lab_master_tests.isActive', $request->isActive === 'true');
        }

        return response()->json($query->orderBy('lab_master_tests.testSort')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'serviceId' => 'required|uuid|exists:services,id',
            'lab_headers_id' => 'nullable|exists:lab_headers,id',
            'lab_required_sample_id' => 'nullable|exists:lab_required_samples,id',
            'testSort' => 'nullable|integer',
            'expectedTime' => 'nullable|string',
            'interpretation' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        $validated['id'] = Str::uuid();
        DB::table('lab_master_tests')->insert([
            'id' => $validated['id'],
            'serviceId' => $validated['serviceId'],
            'lab_headers_id' => $validated['lab_headers_id'] ?? null,
            'lab_required_sample_id' => $validated['lab_required_sample_id'] ?? null,
            'testSort' => $validated['testSort'] ?? 1,
            'expectedTime' => $validated['expectedTime'] ?? '60',
            'interpretation' => $validated['interpretation'] ?? null,
            'isActive' => $validated['isActive'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $item = DB::table('lab_master_tests')
            ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
            ->leftJoin('lab_headers', 'lab_master_tests.lab_headers_id', '=', 'lab_headers.id')
            ->leftJoin('lab_required_samples', 'lab_master_tests.lab_required_sample_id', '=', 'lab_required_samples.id')
            ->where('lab_master_tests.id', $validated['id'])
            ->select(
                'lab_master_tests.*',
                'services.ServiceName as serviceName',
                'services.Code as serviceCode',
                'lab_headers.header_name as header_name',
                'lab_required_samples.required_sample_name as required_sample_name'
            )
            ->first();

        return response()->json($item, 201);
    }

    public function show($id)
    {
        $item = DB::table('lab_master_tests')
            ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
            ->leftJoin('lab_headers', 'lab_master_tests.lab_headers_id', '=', 'lab_headers.id')
            ->leftJoin('lab_required_samples', 'lab_master_tests.lab_required_sample_id', '=', 'lab_required_samples.id')
            ->where('lab_master_tests.id', $id)
            ->select(
                'lab_master_tests.*',
                'services.ServiceName as serviceName',
                'services.Code as serviceCode',
                'lab_headers.header_name as header_name',
                'lab_required_samples.required_sample_name as required_sample_name'
            )
            ->first();

        if (!$item) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'serviceId' => 'required|uuid|exists:services,id',
            'lab_headers_id' => 'nullable|exists:lab_headers,id',
            'lab_required_sample_id' => 'nullable|exists:lab_required_samples,id',
            'testSort' => 'nullable|integer',
            'expectedTime' => 'nullable|string',
            'interpretation' => 'nullable|string',
            'isActive' => 'nullable|boolean',
        ]);

        DB::table('lab_master_tests')->where('id', $id)->update([
            'serviceId' => $validated['serviceId'],
            'lab_headers_id' => $validated['lab_headers_id'] ?? null,
            'lab_required_sample_id' => $validated['lab_required_sample_id'] ?? null,
            'testSort' => $validated['testSort'] ?? 1,
            'expectedTime' => $validated['expectedTime'] ?? '60',
            'interpretation' => $validated['interpretation'] ?? null,
            'isActive' => $validated['isActive'] ?? true,
            'updated_at' => now(),
        ]);

        $item = DB::table('lab_master_tests')
            ->leftJoin('services', 'lab_master_tests.serviceId', '=', 'services.id')
            ->leftJoin('lab_headers', 'lab_master_tests.lab_headers_id', '=', 'lab_headers.id')
            ->leftJoin('lab_required_samples', 'lab_master_tests.lab_required_sample_id', '=', 'lab_required_samples.id')
            ->where('lab_master_tests.id', $id)
            ->select(
                'lab_master_tests.*',
                'services.ServiceName as serviceName',
                'services.Code as serviceCode',
                'lab_headers.header_name as header_name',
                'lab_required_samples.required_sample_name as required_sample_name'
            )
            ->first();

        return response()->json($item);
    }

    public function destroy($id)
    {
        DB::table('lab_master_tests')->where('id', $id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
