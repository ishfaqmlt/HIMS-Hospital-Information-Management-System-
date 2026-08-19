<?php

namespace App\Http\Controllers;

use App\Models\LabAnalyzerData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LabAnalyzerDataController extends Controller
{
    /**
     * Display a listing of analyzer raw data.
     */
    public function index(Request $request)
    {
        $query = DB::table('lab_analyzer_data')
            ->leftJoin('lab_analyzers', 'lab_analyzer_data.analyzerId', '=', 'lab_analyzers.id')
            ->select('lab_analyzer_data.*', 'lab_analyzers.name as analyzerName');

        if ($request->has('caseNo') && !empty($request->caseNo)) {
            $query->where('lab_analyzer_data.caseNo', trim($request->caseNo));
        }

        if ($request->has('analyzerId') && !empty($request->analyzerId)) {
            $query->where('lab_analyzer_data.analyzerId', $request->analyzerId);
        }

        if ($request->has('isSynced')) {
            $query->where('lab_analyzer_data.isSynced', filter_var($request->isSynced, FILTER_VALIDATE_BOOLEAN));
        }

        $items = $query->orderBy('lab_analyzer_data.tdate', 'desc')->get();

        return response()->json($items);
    }

    /**
     * Store raw analyzer data packet(s) from socket daemon / HTTP bridge.
     */
    public function store(Request $request)
    {
        $payload = $request->all();

        // Support bulk array or single payload
        $records = isset($payload['results']) && is_array($payload['results'])
            ? $payload['results']
            : (isset($payload[0]) && is_array($payload) ? $payload : [$payload]);

        $inserted = [];

        foreach ($records as $item) {
            if (empty($item['caseNo']) || empty($item['paramName'])) {
                continue;
            }

            $id = (string) Str::uuid();
            $tdate = !empty($item['tdate']) ? $item['tdate'] : now();

            DB::table('lab_analyzer_data')->insert([
                'id' => $id,
                'analyzerId' => $item['analyzerId'] ?? null,
                'caseNo' => trim($item['caseNo']),
                'tdate' => $tdate,
                'paramName' => trim($item['paramName']),
                'result' => isset($item['result']) ? trim((string)$item['result']) : null,
                'unit' => isset($item['unit']) ? trim((string)$item['unit']) : null,
                'flag' => isset($item['flag']) ? trim((string)$item['flag']) : null,
                'isSynced' => isset($item['isSynced']) ? filter_var($item['isSynced'], FILTER_VALIDATE_BOOLEAN) : false,
            ]);

            $inserted[] = $id;
        }

        return response()->json([
            'message' => 'Analyzer data stored successfully',
            'count' => count($inserted),
        ], 201);
    }

    /**
     * Fetch unsynced analyzer results by Case Number (for testPerform auto-fill)
     */
    public function getByCaseNo($caseNo)
    {
        $results = DB::table('lab_analyzer_data')
            ->where('caseNo', trim($caseNo))
            ->orderBy('tdate', 'desc')
            ->get();

        return response()->json($results);
    }

    /**
     * Mark analyzer data as synced
     */
    public function markSynced(Request $request)
    {
        $ids = $request->input('ids', []);
        $caseNo = $request->input('caseNo');

        $query = DB::table('lab_analyzer_data');

        if (!empty($ids) && is_array($ids)) {
            $query->whereIn('id', $ids);
        } elseif (!empty($caseNo)) {
            $query->where('caseNo', trim($caseNo));
        } else {
            return response()->json(['message' => 'Specify ids or caseNo to mark synced'], 422);
        }

        $affected = $query->update(['isSynced' => true]);

        return response()->json([
            'message' => 'Analyzer data marked as synced',
            'updatedCount' => $affected,
        ]);
    }

    /**
     * Remove raw analyzer record
     */
    public function destroy($id)
    {
        $record = DB::table('lab_analyzer_data')->where('id', $id)->first();
        if (!$record) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        DB::table('lab_analyzer_data')->where('id', $id)->delete();

        return response()->json(['message' => 'Analyzer raw data deleted']);
    }
}
