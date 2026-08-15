"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Printer, Wallet, DollarSign, RefreshCw, Calendar, UserCheck } from "lucide-react";
import axios from "@/lib/axios";

export default function ShiftSummaryDialog({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (open) {
      fetchShiftSummary();
    }
  }, [open]);

  const fetchShiftSummary = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/patient-payments/shift-summary");
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch shift summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white text-black font-sans">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-sky-700" />
            Cashier Shift Reconciliation
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
          </div>
        ) : data ? (
          <div className="space-y-4 pt-2">
            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-semibold">Date:</span> {data.date}
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-semibold">Cashier:</span> {data.user}
              </div>
            </div>

            {/* Net Cash in Drawer Highlight Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-xs uppercase font-medium tracking-wider text-emerald-100">
                Net Cash in Drawer
              </span>
              <span className="text-2xl font-black tracking-tight">
                Rs. {data.netCashInDrawer.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-100">
                Total Cash Collected minus Refunds Issued
              </span>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Total Transactions</span>
                <Badge variant="secondary" className="font-bold">{data.totalTransactions}</Badge>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Cash Collected</span>
                <span className="font-bold text-emerald-700">Rs. {data.cashTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Card Payments</span>
                <span className="font-bold text-sky-700">Rs. {data.cardTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Online / Bank Transfers</span>
                <span className="font-bold text-indigo-700">Rs. {data.onlineTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Advance Payments Received</span>
                <span className="font-bold text-emerald-800">Rs. {data.advanceCollected.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-slate-600 font-medium">Refunds / Returns Issued</span>
                <span className="font-bold text-red-600">- Rs. {data.totalCreditRefunds.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-3 border-t">
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button size="sm" className="bg-sky-700 hover:bg-sky-800 text-white font-medium" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print Handover
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
