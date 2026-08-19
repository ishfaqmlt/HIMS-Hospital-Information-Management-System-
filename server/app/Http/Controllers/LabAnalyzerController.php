<?php

namespace App\Http\Controllers;

use App\Models\LabAnalyzer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabAnalyzerController extends Controller
{
    /**
     * Display a listing of analyzers.
     */
    public function index(Request $request)
    {
        $query = DB::table('lab_analyzers');

        if ($request->has('search') && !empty($request->search)) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('manufacturer', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('protocol', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('name', 'asc')->get();

        return response()->json($items);
    }

    /**
     * Store a newly created analyzer.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'manufacturer' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'communicationType' => 'required|in:TCP,SERIAL',
            'protocol' => 'required|in:ASTM,HL7,CUSTOM',
            'direction' => 'required|in:UNIDIRECTIONAL,BIDIRECTIONAL',
            'host' => 'nullable|string|max:255',
            'port' => 'nullable|integer|min:1|max:65535',
            'comPort' => 'nullable|string|max:50',
            'baudRate' => 'nullable|integer',
            'parity' => 'nullable|in:None,Even,Odd,Mark,Space',
            'dataBits' => 'nullable|integer',
            'stopBits' => 'nullable|numeric',
            'isActive' => 'nullable|boolean',
        ]);

        $id = (string) Str::uuid();

        DB::table('lab_analyzers')->insert([
            'id' => $id,
            'name' => trim($validated['name']),
            'manufacturer' => isset($validated['manufacturer']) ? trim($validated['manufacturer']) : null,
            'model' => isset($validated['model']) ? trim($validated['model']) : null,
            'communicationType' => $validated['communicationType'],
            'protocol' => $validated['protocol'],
            'direction' => $validated['direction'],
            'host' => isset($validated['host']) ? trim($validated['host']) : null,
            'port' => $validated['port'] ?? null,
            'comPort' => isset($validated['comPort']) ? trim($validated['comPort']) : null,
            'baudRate' => $validated['baudRate'] ?? 9600,
            'parity' => $validated['parity'] ?? 'None',
            'dataBits' => $validated['dataBits'] ?? 8,
            'stopBits' => $validated['stopBits'] ?? 1.0,
            'isActive' => isset($validated['isActive']) ? (bool)$validated['isActive'] : true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $created = DB::table('lab_analyzers')->where('id', $id)->first();

        return response()->json([
            'message' => 'Analyzer created successfully',
            'data' => $created,
        ], 201);
    }

    /**
     * Display the specified analyzer.
     */
    public function show($id)
    {
        $analyzer = DB::table('lab_analyzers')->where('id', $id)->first();
        if (!$analyzer) {
            return response()->json(['message' => 'Analyzer not found'], 404);
        }

        return response()->json($analyzer);
    }

    /**
     * Update the specified analyzer.
     */
    public function update(Request $request, $id)
    {
        $analyzer = DB::table('lab_analyzers')->where('id', $id)->first();
        if (!$analyzer) {
            return response()->json(['message' => 'Analyzer not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'manufacturer' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'communicationType' => 'required|in:TCP,SERIAL',
            'protocol' => 'required|in:ASTM,HL7,CUSTOM',
            'direction' => 'required|in:UNIDIRECTIONAL,BIDIRECTIONAL',
            'host' => 'nullable|string|max:255',
            'port' => 'nullable|integer|min:1|max:65535',
            'comPort' => 'nullable|string|max:50',
            'baudRate' => 'nullable|integer',
            'parity' => 'nullable|in:None,Even,Odd,Mark,Space',
            'dataBits' => 'nullable|integer',
            'stopBits' => 'nullable|numeric',
            'isActive' => 'nullable|boolean',
        ]);

        DB::table('lab_analyzers')->where('id', $id)->update([
            'name' => trim($validated['name']),
            'manufacturer' => isset($validated['manufacturer']) ? trim($validated['manufacturer']) : null,
            'model' => isset($validated['model']) ? trim($validated['model']) : null,
            'communicationType' => $validated['communicationType'],
            'protocol' => $validated['protocol'],
            'direction' => $validated['direction'],
            'host' => isset($validated['host']) ? trim($validated['host']) : null,
            'port' => $validated['port'] ?? null,
            'comPort' => isset($validated['comPort']) ? trim($validated['comPort']) : null,
            'baudRate' => $validated['baudRate'] ?? 9600,
            'parity' => $validated['parity'] ?? 'None',
            'dataBits' => $validated['dataBits'] ?? 8,
            'stopBits' => $validated['stopBits'] ?? 1.0,
            'isActive' => isset($validated['isActive']) ? (bool)$validated['isActive'] : true,
            'updated_at' => now(),
        ]);

        $updated = DB::table('lab_analyzers')->where('id', $id)->first();

        return response()->json([
            'message' => 'Analyzer updated successfully',
            'data' => $updated,
        ]);
    }

    /**
     * Remove the specified analyzer.
     */
    public function destroy($id)
    {
        $analyzer = DB::table('lab_analyzers')->where('id', $id)->first();
        if (!$analyzer) {
            return response()->json(['message' => 'Analyzer not found'], 404);
        }

        DB::table('lab_analyzers')->where('id', $id)->delete();

        return response()->json(['message' => 'Analyzer deleted successfully']);
    }
}
