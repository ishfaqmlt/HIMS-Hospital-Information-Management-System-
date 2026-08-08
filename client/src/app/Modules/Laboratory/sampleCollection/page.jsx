"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  RefreshCw,
  Loader2,
  User,
  Printer,
  FileText,
} from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./testColumns";
import labCaseService from "@/services/labCase.service";
import LabBarcode from "@/components/lab/LabBarcode";
import { useReactToPrint } from "react-to-print";

const toLocalISOString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
};

export default function SampleCollectionPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0);
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);

  const [dtFrom, setDtFrom] = useState(toLocalISOString(todayStart));
  const [dtTo, setDtTo] = useState(toLocalISOString(todayEnd));
  const [statusFilter, setStatusFilter] = useState("All");

  // Barcode dialog state
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [barcodeQty, setBarcodeQty] = useState(1);
  const barcodePrintRef = useRef(null);

  // Lab copy dialog state
  const [labCopyDialogOpen, setLabCopyDialogOpen] = useState(false);
  const labCopyPrintRef = useRef(null);

  const testColumns = useMemo(() => getColumns(), []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {
        fromDate: dtFrom,
        toDate: dtTo,
      };
      if (statusFilter && statusFilter !== "All") {
        params.status = statusFilter;
      }
      const res = await labCaseService.getAll(params);
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

  // Print Barcode
  const handleOpenBarcodeDialog = () => {
    if (!selectedCase?.tests?.length) return;
    setBarcodeQty(1);
    setBarcodeDialogOpen(true);
  };

  const handlePrintBarcode = useReactToPrint({
    contentRef: barcodePrintRef,
    documentTitle: `Barcode-${selectedCase?.caseNo || ""}`,
    onAfterPrint: () => {
      setBarcodeDialogOpen(false);
    },
  });

  // Print Lab Copy
  const handleOpenLabCopy = () => {
    if (!selectedCase) return;
    setLabCopyDialogOpen(true);
  };

  const handlePrintLabCopy = useReactToPrint({
    contentRef: labCopyPrintRef,
    documentTitle: `LabCopy-${selectedCase?.caseNo || ""}`,
    onAfterPrint: () => {
      setLabCopyDialogOpen(false);
    },
  });

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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Sampled">Sampled</SelectItem>
              <SelectItem value="InProcess">In Process</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
            </SelectContent>
          </Select>
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
                <CardHeader className="px-3 py-1.5 bg-sky-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-sky-700 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {selectedCase.patient?.pName || "-"}
                    </span>
                    <span className="text-muted-foreground">|</span>
                    <span>MRN: {selectedCase.patient?.mrn || "-"}</span>
                    <span className="text-muted-foreground">|</span>
                    <span>Case: {selectedCase.caseNo}</span>
                    <span className="text-muted-foreground">|</span>
                    <span>Dr. {selectedCase.doctor?.Name || "-"}</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleOpenBarcodeDialog}
                      disabled={!selectedCase?.tests?.length}
                    >
                      <Printer className="h-3 w-3 mr-1" />
                      Print Barcode
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleOpenLabCopy}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Print Lab Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-1">
                  <DataTable
                    columns={testColumns}
                    data={selectedCase.tests || []}
                    filterColumn="testName"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Print Barcode Dialog */}
      <Dialog open={barcodeDialogOpen} onOpenChange={setBarcodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Print Barcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Number of Barcodes per Test</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={barcodeQty}
                onChange={(e) => setBarcodeQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-8 text-xs w-32"
              />
            </div>
            <div className="border rounded p-3 bg-white max-h-96 overflow-auto">
              <div ref={barcodePrintRef} className="flex flex-wrap gap-2 justify-center">
                {(selectedCase?.tests || []).map((test) =>
                  Array.from({ length: barcodeQty }).map((_, i) => (
                    <div key={`${test.id}-${i}`} className="flex flex-col items-center p-1">
                      <span className="text-[9px] font-medium mb-0.5">
                        {selectedCase.patient?.pName || ""}
                      </span>
                      <LabBarcode
                        value={test.testCode || test.id}
                        width={1.5}
                        height={35}
                        fontSize={10}
                        margin={3}
                      />
                      <span className="text-[8px] text-muted-foreground mt-0.5">
                        {selectedCase.caseNo} | {test.testCode}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBarcodeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handlePrintBarcode()}
            >
              <Printer className="h-3 w-3 mr-1" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Lab Copy Dialog */}
      <Dialog open={labCopyDialogOpen} onOpenChange={setLabCopyDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Lab Copy</DialogTitle>
          </DialogHeader>
          <div className="border rounded p-4 bg-white">
            <div ref={labCopyPrintRef} className="p-4">
              {selectedCase && (
                <div className="space-y-3 text-xs">
                  <div className="text-center font-bold text-sm border-b pb-2">
                    LABORATORY COPY
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Case No:</strong> {selectedCase.caseNo}</div>
                    <div><strong>Date:</strong> {selectedCase.caseDate}</div>
                    <div><strong>Patient:</strong> {selectedCase.patient?.pName}</div>
                    <div><strong>MRN:</strong> {selectedCase.patient?.mrn}</div>
                    <div><strong>Doctor:</strong> Dr. {selectedCase.doctor?.Name}</div>
                    <div><strong>Priority:</strong> {selectedCase.priority}</div>
                  </div>
                  <div className="border-t pt-2">
                    <strong>Tests:</strong>
                    <Table className="mt-1">
                      <TableHeader>
                        <TableRow className="h-6">
                          <TableHead className="text-xs">SL</TableHead>
                          <TableHead className="text-xs">Code</TableHead>
                          <TableHead className="text-xs">Test Name</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedCase.tests || []).map((test, idx) => (
                          <TableRow key={test.id} className="h-6">
                            <TableCell className="text-xs">{idx + 1}</TableCell>
                            <TableCell className="text-xs">{test.testCode}</TableCell>
                            <TableCell className="text-xs">{test.testName}</TableCell>
                            <TableCell className="text-xs">{test.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLabCopyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handlePrintLabCopy()}
            >
              <Printer className="h-3 w-3 mr-1" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
