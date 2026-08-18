<?php

namespace App\Http\Controllers;

use App\Models\CashHandover;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CashHandoverController extends Controller
{
    /**
     * List Cash Handovers
     */
    public function index(Request $request)
    {
        $query = DB::table('cash_handovers')
            ->leftJoin('users as cashier', 'cash_handovers.userId', '=', 'cashier.id')
            ->leftJoin('users as supervisor', 'cash_handovers.acceptedBy', '=', 'supervisor.id')
            ->select(
                'cash_handovers.*',
                'cashier.name as cashier_name',
                'supervisor.name as supervisor_name'
            );

        if ($request->has('fromDate') && $request->fromDate) {
            $query->where('cash_handovers.created_at', '>=', $request->fromDate);
        }

        if ($request->has('toDate') && $request->toDate) {
            $query->where('cash_handovers.created_at', '<=', $request->toDate);
        }

        if ($request->has('userId') && $request->userId && $request->userId !== 'all') {
            $query->where('cash_handovers.userId', $request->userId);
        }

        if ($request->has('status') && $request->status && $request->status !== 'all') {
            $query->where('cash_handovers.status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('cash_handovers.handoverNo', 'like', "%{$search}%")
                  ->orWhere('cashier.name', 'like', "%{$search}%");
            });
        }

        $handovers = $query->orderBy('cash_handovers.created_at', 'desc')->get();

        $data = $handovers->map(function ($row) {
            return [
                'id' => $row->id,
                'handoverNo' => $row->handoverNo,
                'userId' => $row->userId,
                'cashierName' => $row->cashier_name ?: 'Unknown Cashier',
                'supervisorName' => $row->supervisor_name ?: '-',
                'shiftType' => $row->shiftType,
                'shiftStartDate' => $row->shiftStartDate,
                'shiftEndDate' => $row->shiftEndDate,
                'openingBalance' => (float)$row->openingBalance,
                'systemExpectedCash' => (float)$row->systemExpectedCash,
                'physicalCashCounted' => (float)$row->physicalCashCounted,
                'cardCollected' => (float)$row->cardCollected,
                'onlineCollected' => (float)$row->onlineCollected,
                'totalGrossCollected' => (float)$row->totalGrossCollected,
                'totalRefunded' => (float)$row->totalRefunded,
                'varianceAmount' => (float)$row->varianceAmount,
                'varianceType' => $row->varianceType,
                'denominations' => json_decode($row->denominations, true) ?: [],
                'status' => $row->status,
                'acceptedAt' => $row->acceptedAt,
                'notes' => $row->notes,
                'createdAt' => $row->created_at,
            ];
        });

        return response()->json([
            'data' => $data,
            'summary' => [
                'total_handovers' => $data->count(),
                'pending_count' => $data->where('status', 'Pending')->count(),
                'accepted_count' => $data->where('status', 'Accepted')->count(),
                'total_physical_cash' => $data->sum('physicalCashCounted'),
                'total_expected_cash' => $data->sum('systemExpectedCash'),
                'total_variance' => $data->sum('varianceAmount'),
            ]
        ]);
    }

    /**
     * Get Real-time Shift Summary for Logged-in Cashier
     */
    public function getCurrentShiftSummary(Request $request)
    {
        $userId = Auth::id();

        // Get last handover date for this user to determine shift start time
        $lastHandover = DB::table('cash_handovers')
            ->where('userId', $userId)
            ->where('status', 'Accepted')
            ->orderBy('created_at', 'desc')
            ->first();

        $shiftStart = $lastHandover ? $lastHandover->shiftEndDate : now()->startOfDay()->toDateTimeString();
        $shiftEnd = now()->toDateTimeString();

        // Payments received in this shift
        $payments = DB::table('patient_payments')
            ->where('createdBy', $userId)
            ->whereBetween('created_at', [$shiftStart, $shiftEnd])
            ->where('status', 'Active')
            ->get();

        $cashTotal = $payments->whereIn('paymentMode', ['Cash', null])->sum('debit');
        $cardTotal = $payments->where('paymentMode', 'Card')->sum('debit');
        $onlineTotal = $payments->whereIn('paymentMode', ['Online', 'UPI'])->sum('debit');
        $totalRefunds = $payments->sum('credit');

        $openingBalance = $lastHandover ? 0.00 : 0.00;
        $expectedCash = max(0, $openingBalance + $cashTotal - $totalRefunds);

        return response()->json([
            'userId' => $userId,
            'userName' => Auth::user() ? Auth::user()->name : 'Cashier',
            'shiftStartDate' => $shiftStart,
            'shiftEndDate' => $shiftEnd,
            'openingBalance' => (float)$openingBalance,
            'totalTransactions' => $payments->count(),
            'cashTotal' => (float)$cashTotal,
            'cardTotal' => (float)$cardTotal,
            'onlineTotal' => (float)$onlineTotal,
            'totalGross' => (float)($cashTotal + $cardTotal + $onlineTotal),
            'totalRefunds' => (float)$totalRefunds,
            'expectedCashInDrawer' => (float)$expectedCash,
        ]);
    }

    /**
     * Submit Cash Handover
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shiftType' => 'required|in:Morning,Evening,Night,FullDay',
            'shiftStartDate' => 'required|date',
            'shiftEndDate' => 'required|date',
            'openingBalance' => 'required|numeric|min:0',
            'systemExpectedCash' => 'required|numeric|min:0',
            'physicalCashCounted' => 'required|numeric|min:0',
            'cardCollected' => 'nullable|numeric|min:0',
            'onlineCollected' => 'nullable|numeric|min:0',
            'totalGrossCollected' => 'nullable|numeric|min:0',
            'totalRefunded' => 'nullable|numeric|min:0',
            'denominations' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $userId = Auth::id();
        $expected = (float)$validated['systemExpectedCash'];
        $physical = (float)$validated['physicalCashCounted'];
        $variance = round($physical - $expected, 2);

        $varianceType = 'Exact';
        if ($variance < 0) {
            $varianceType = 'Shortage';
        } else if ($variance > 0) {
            $varianceType = 'Excess';
        }

        $handoverNo = CashHandover::generateHandoverNo();
        $id = (string) Str::uuid();

        DB::table('cash_handovers')->insert([
            'id' => $id,
            'handoverNo' => $handoverNo,
            'userId' => $userId,
            'shiftType' => $validated['shiftType'],
            'shiftStartDate' => date('Y-m-d H:i:s', strtotime($validated['shiftStartDate'])),
            'shiftEndDate' => date('Y-m-d H:i:s', strtotime($validated['shiftEndDate'])),
            'openingBalance' => $validated['openingBalance'],
            'systemExpectedCash' => $expected,
            'physicalCashCounted' => $physical,
            'cardCollected' => $validated['cardCollected'] ?? 0.00,
            'onlineCollected' => $validated['onlineCollected'] ?? 0.00,
            'totalGrossCollected' => $validated['totalGrossCollected'] ?? 0.00,
            'totalRefunded' => $validated['totalRefunded'] ?? 0.00,
            'varianceAmount' => $variance,
            'varianceType' => $varianceType,
            'denominations' => json_encode($validated['denominations'] ?? []),
            'status' => 'Pending',
            'notes' => $validated['notes'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $record = DB::table('cash_handovers')->where('id', $id)->first();

        return response()->json([
            'message' => 'Cash handover submitted successfully',
            'data' => $record,
        ], 201);
    }

    /**
     * Supervisor Action: Accept Handover
     */
    public function acceptHandover(Request $request, $id)
    {
        $handover = DB::table('cash_handovers')->where('id', $id)->first();
        if (!$handover) {
            return response()->json(['message' => 'Handover record not found'], 404);
        }

        if ($handover->status === 'Accepted') {
            return response()->json(['message' => 'Handover is already accepted'], 400);
        }

        DB::table('cash_handovers')->where('id', $id)->update([
            'status' => 'Accepted',
            'acceptedBy' => Auth::id(),
            'acceptedAt' => now(),
            'updated_at' => now(),
        ]);

        $updated = DB::table('cash_handovers')->where('id', $id)->first();

        return response()->json([
            'message' => 'Handover accepted and approved successfully',
            'data' => $updated,
        ]);
    }

    /**
     * Supervisor Action: Reject Handover
     */
    public function rejectHandover(Request $request, $id)
    {
        $handover = DB::table('cash_handovers')->where('id', $id)->first();
        if (!$handover) {
            return response()->json(['message' => 'Handover record not found'], 404);
        }

        DB::table('cash_handovers')->where('id', $id)->update([
            'status' => 'Rejected',
            'acceptedBy' => Auth::id(),
            'acceptedAt' => now(),
            'updated_at' => now(),
        ]);

        $updated = DB::table('cash_handovers')->where('id', $id)->first();

        return response()->json([
            'message' => 'Handover rejected',
            'data' => $updated,
        ]);
    }
}
