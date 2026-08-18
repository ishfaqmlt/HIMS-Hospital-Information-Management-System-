"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Printer, Wallet, DollarSign, RefreshCw, Calendar, UserCheck, CheckCircle2, AlertTriangle, Calculator } from "lucide-react";
import cashHandoverService from "@/services/cashHandover.service";

export default function ShiftSummaryDialog({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState(null);
  const [submittedHandover, setSubmittedHandover] = useState(null);

  // Shift & Denomination States
  const [shiftType, setShiftType] = useState("Morning");
  const [notes, setNotes] = useState("");
  const [denominations, setDenominations] = useState({
    n5000: 0,
    n1000: 0,
    n500: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
  });

  const [physicalTotal, setPhysicalTotal] = useState(0);

  useEffect(() => {
    if (open) {
      fetchShiftSummary();
      setSubmittedHandover(null);
      setMessage(null);
    }
  }, [open]);

  useEffect(() => {
    const total =
      (Number(denominations.n5000) || 0) * 5000 +
      (Number(denominations.n1000) || 0) * 1000 +
      (Number(denominations.n500) || 0) * 500 +
      (Number(denominations.n100) || 0) * 100 +
      (Number(denominations.n50) || 0) * 50 +
      (Number(denominations.n20) || 0) * 20 +
      (Number(denominations.n10) || 0) * 10;
    setPhysicalTotal(total);
  }, [denominations]);

  const fetchShiftSummary = async () => {
    try {
      setLoading(true);
      const res = await cashHandoverService.getCurrentSummary();
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch shift summary:", error);
      setMessage({ type: "error", text: "Failed to load active shift summary." });
    } finally {
      setLoading(false);
    }
  };

  const handleDenominationChange = (key, value) => {
    const val = parseInt(value, 10) || 0;
    setDenominations((prev) => ({ ...prev, [key]: Math.max(0, val) }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitHandover = async () => {
    if (!data) return;
    try {
      setSubmitting(true);
      const payload = {
        shiftType,
        shiftStartDate: data.shiftStartDate,
        shiftEndDate: data.shiftEndDate,
        openingBalance: data.openingBalance || 0,
        systemExpectedCash: data.expectedCashInDrawer || 0,
        physicalCashCounted: physicalTotal,
        cardCollected: data.cardTotal || 0,
        onlineCollected: data.onlineTotal || 0,
        totalGrossCollected: data.totalGross || 0,
        totalRefunded: data.totalRefunds || 0,
        denominations,
        notes,
      };

      const res = await cashHandoverService.create(payload);
      setSubmittedHandover(res.data.data);
      setMessage({ type: "success", text: "Shift cash handover submitted successfully!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to submit cash handover." });
    } finally {
      setSubmitting(false);
    }
  };

  const expectedCash = data?.expectedCashInDrawer || 0;
  const variance = physicalTotal - expectedCash;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-white text-black font-sans">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-sky-700" />
            Cashier Shift Closure & Cash Handover
          </DialogTitle>
        </DialogHeader>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
          </div>
        ) : data ? (
          <div className="space-y-4 pt-2">
            {/* Shift Meta & Controls */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700">
                <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-semibold">Cashier:</span> {data.userName}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-semibold">Shift:</span>
                <Select value={shiftType} onValueChange={setShiftType} disabled={!!submittedHandover}>
                  <SelectTrigger className="h-6 text-[11px] w-24 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                    <SelectItem value="Night">Night</SelectItem>
                    <SelectItem value="FullDay">FullDay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expected vs Physical Cash Highlighters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  System Expected Cash
                </span>
                <span className="text-xl font-bold font-mono">
                  PKR {expectedCash.toFixed(2)}
                </span>
              </div>

              <div className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center ${
                variance === 0
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : variance < 0
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : "bg-blue-50 border-blue-300 text-blue-900"
              }`}>
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Physical Cash Counted
                </span>
                <span className="text-xl font-bold font-mono">
                  PKR {physicalTotal.toFixed(2)}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-semibold">Variance:</span>
                  <Badge variant="outline" className={`text-[9px] px-1 py-0 ${
                    variance === 0
                      ? "bg-emerald-600 text-white"
                      : variance < 0
                      ? "bg-rose-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}>
                    {variance === 0 ? "Exact Match" : variance < 0 ? `Shortage: ${variance.toFixed(2)}` : `Excess: +${variance.toFixed(2)}`}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Physical Currency Denomination Breakdown */}
            {!submittedHandover && (
              <div className="border rounded-lg p-3 bg-slate-50/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 pb-1 border-b">
                  <Calculator className="h-3.5 w-3.5 text-sky-700" />
                  Physical Currency Note Count
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <Label className="text-[10px]">5000 x</Label>
                    <Input
                      type="number"
                      min="0"
                      value={denominations.n5000}
                      onChange={(e) => handleDenominationChange("n5000", e.target.value)}
                      className="h-7 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">1000 x</Label>
                    <Input
                      type="number"
                      min="0"
                      value={denominations.n1000}
                      onChange={(e) => handleDenominationChange("n1000", e.target.value)}
                      className="h-7 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">500 x</Label>
                    <Input
                      type="number"
                      min="0"
                      value={denominations.n500}
                      onChange={(e) => handleDenominationChange("n500", e.target.value)}
                      className="h-7 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">100 x</Label>
                    <Input
                      type="number"
                      min="0"
                      value={denominations.n100}
                      onChange={(e) => handleDenominationChange("n100", e.target.value)}
                      className="h-7 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">50 x</Label>
                    <Input
                      type="number"
                      min="0"
                      value={denominations.n50}
                      onChange={(e) => handleDenominationChange("n50", e.target.value)}
                      className="h-7 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">20 x</Label>
                    <Input
                      type="number"
                      min="0"
                      value={denominations.n20}
                      onChange={(e) => handleDenominationChange("n20", e.target.value)}
                      className="h-7 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px]">10 x</Label>
                    <Input
                      type="number"
                      min="0"
                      value={denominations.n10}
                      onChange={(e) => handleDenominationChange("n10", e.target.value)}
                      className="h-7 text-xs font-mono bg-white"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-[10px] font-semibold text-slate-500">Count Total</span>
                    <span className="text-xs font-bold font-mono text-emerald-700">PKR {physicalTotal}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shift Breakdown List */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Total Transactions Count</span>
                <Badge variant="secondary" className="font-bold">{data.totalTransactions}</Badge>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Cash Collected</span>
                <span className="font-bold text-emerald-700">PKR {data.cashTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Card Payments</span>
                <span className="font-bold text-sky-700">PKR {data.cardTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Online / UPI Transfers</span>
                <span className="font-bold text-indigo-700">PKR {data.onlineTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Refunds / Returns Issued</span>
                <span className="font-bold text-red-600">- PKR {data.totalRefunds.toFixed(2)}</span>
              </div>
            </div>

            {/* Handover Status Banner if submitted */}
            {submittedHandover && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Handover #{submittedHandover.handoverNo} Submitted
                  </p>
                  <p className="text-[11px] text-emerald-700">Status: {submittedHandover.status} (Awaiting Supervisor Approval)</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs bg-white" onClick={handlePrint}>
                  <Printer className="h-3.5 w-3.5 mr-1" /> Print Slip
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-3 border-t">
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {!submittedHandover && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  onClick={handleSubmitHandover}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                  Submit Cash Handover
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
