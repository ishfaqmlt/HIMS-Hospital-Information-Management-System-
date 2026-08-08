"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCw, Loader2, User, CheckCircle2, XCircle } from "lucide-react";
import acceptSampleService from "@/services/acceptSample.service";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};

const calculateAge = (dob) => {
  if (!dob) return "-";
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years > 0) return `${years}Y ${months}M`;
  return `${months}M`;
};

export default function AcceptSamplePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0);
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);

  const [dtFrom, setDtFrom] = useState(toLocalISOString(todayStart));
  const [dtTo, setDtTo] = useState(toLocalISOString(todayEnd));

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTest, setRejectTest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await acceptSampleService.getAll({
        fromDate: dtFrom,
        toDate: dtTo,
        status: "Sampled",
      });
      setCases(res.data || []);
      setSelectedCase(null);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load cases." });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = (c) => {
    setSelectedCase(c);
  };

  const handleAcceptSample = async (testId) => {
    try {
      await acceptSampleService.acceptSample(testId);
      setSelectedCase((prev) => ({
        ...prev,
        tests: prev.tests.map((t) =>
          t.id === testId ? { ...t, sampleStatus: "Accepted" } : t
        ),
      }));
      setMessage({ type: "success", text: "Sample accepted." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to accept sample." });
    }
  };

  const handleOpenReject = (test) => {
    setRejectTest(test);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectSample = async () => {
    if (!rejectReason.trim()) return;
    try {
      setRejectLoading(true);
      await acceptSampleService.rejectSample(rejectTest.id, {
        rejectReason: rejectReason.trim(),
      });
      setSelectedCase((prev) => ({
        ...prev,
        tests: prev.tests.map((t) =>
          t.id === rejectTest.id
            ? { ...t, sampleStatus: "Rejected", rejectReason: rejectReason.trim() }
            : t
        ),
      }));
      setRejectDialogOpen(false);
      setMessage({ type: "success", text: "Sample rejected." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to reject sample." });
    } finally {
      setRejectLoading(false);
    }
  };

  const sampleStatusColor = (s) => {
    if (s === "Accepted") return "text-green-600 bg-green-50";
    if (s === "Rejected") return "text-red-600 bg-red-50";
    return "text-gray-400 bg-gray-50";
  };

  return (
    <div className="p-4 max-w-full mx-auto space-y-4">
      {message && (
        <div
          className={`px-4 py-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Top Filters */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">From Date</Label>
          <Input
            type="datetime-local"
            value={dtFrom}
            onChange={(e) => setDtFrom(e.target.value)}
            className="h-8 text-xs w-48"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">To Date</Label>
          <Input
            type="datetime-local"
            value={dtTo}
            onChange={(e) => setDtTo(e.target.value)}
            className="h-8 text-xs w-48"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">Case Status</Label>
          <Input
            value="Sampled"
            disabled
            className="h-8 text-xs w-36 bg-muted"
          />
        </div>
        <Button size="sm" className="h-8" onClick={fetchCases} disabled={loading}>
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
          )}
          Refresh List
        </Button>
      </div>

      {/* Two Panel Layout */}
      <div className="flex gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Left Panel - Patients List */}
        <div className="w-1/4 border rounded-md flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 bg-sky-50 border-b">
            <h3 className="text-xs font-semibold text-sky-700">
              Patients List ({cases.length})
            </h3>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="h-8">
                  <TableHead className="text-xs">SL</TableHead>
                  <TableHead className="text-xs">Patient</TableHead>
                  <TableHead className="text-xs">Case No</TableHead>
                  <TableHead className="text-xs text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-8">
                      {loading ? "Loading..." : "No cases found. Click Refresh List."}
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c, idx) => (
                    <TableRow
                      key={c.id}
                      className={`h-8 cursor-pointer hover:bg-muted/50 ${
                        selectedCase?.id === c.id ? "bg-sky-100" : ""
                      }`}
                      onClick={() => handleSelectCase(c)}
                    >
                      <TableCell className="text-xs">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {c.patient?.pName || "-"}
                      </TableCell>
                      <TableCell className="text-xs">{c.caseNo}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCase(c);
                          }}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Panel - Patient Tests */}
        <div className="w-3/4 border rounded-md flex flex-col overflow-hidden">
          <div className="px-3 py-1.5 bg-sky-50 border-b">
            <h3 className="text-xs font-semibold text-sky-700">
              {selectedCase ? "Patient Tests" : "Select a patient from the list"}
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {!selectedCase ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Click &quot;Select&quot; on a patient to view their tests.
              </div>
            ) : (
              <Card className="shadow-sm border border-border/50">
                <CardHeader className="px-3 py-1.5 bg-sky-50">
                  <CardTitle className="text-xs font-semibold text-sky-700 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {selectedCase.patient?.pName || "-"}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span>MRN: {selectedCase.patient?.mrn || "-"}</span>
                    <span className="text-muted-foreground">|</span>
                    <span>Age: {calculateAge(selectedCase.patient?.dob)}</span>
                    <span className="text-muted-foreground">|</span>
                    <span>Case: {selectedCase.caseNo}</span>
                    <span className="text-muted-foreground">|</span>
                    <span>Dr. {selectedCase.doctor?.Name || "-"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="h-8">
                        <TableHead className="text-xs w-10">SL</TableHead>
                        <TableHead className="text-xs">Test Code</TableHead>
                        <TableHead className="text-xs">Test Name</TableHead>
                        <TableHead className="text-xs w-24 text-center">Status</TableHead>
                        <TableHead className="text-xs w-28 text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedCase.tests || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                            No tests found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (selectedCase.tests || []).map((test, idx) => (
                          <TableRow key={test.id} className="h-8">
                            <TableCell className="text-xs">{idx + 1}</TableCell>
                            <TableCell className="text-xs font-medium">{test.testCode}</TableCell>
                            <TableCell className="text-xs">{test.testName}</TableCell>
                            <TableCell className="text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sampleStatusColor(test.sampleStatus)}`}>
                                {test.sampleStatus || "Pending"}
                              </span>
                              {test.rejectReason && (
                                <div className="text-[9px] text-red-500 mt-0.5" title={test.rejectReason}>
                                  {test.rejectReason.length > 20
                                    ? test.rejectReason.substring(0, 20) + "..."
                                    : test.rejectReason}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {!test.sampleStatus ? (
                                <div className="flex gap-1 justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-green-600 hover:text-green-700"
                                    onClick={() => handleAcceptSample(test.id)}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Accept
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                                    onClick={() => handleOpenReject(test)}
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Reject Sample</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Test: <span className="font-medium text-foreground">{rejectTest?.testName}</span> ({rejectTest?.testCode})
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Reason for Rejection</Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="h-8 text-xs"
                placeholder="Enter reason (max 100 chars)"
                maxLength={100}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rejectReason.trim()) {
                    e.preventDefault();
                    handleRejectSample();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRejectSample}
              disabled={!rejectReason.trim() || rejectLoading}
            >
              {rejectLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
