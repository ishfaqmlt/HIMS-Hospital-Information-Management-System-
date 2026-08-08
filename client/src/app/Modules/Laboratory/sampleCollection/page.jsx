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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RefreshCw, Loader2, Printer } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
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
  if (years > 0) return `${years} Years ${months} Months`;
  return `${months} Months`;
};

export default function SampleCollectionPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [cases, setCases] = useState([]);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0);
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);

  const [dtFrom, setDtFrom] = useState(toLocalISOString(todayStart));
  const [dtTo, setDtTo] = useState(toLocalISOString(todayEnd));
  const [statusFilter, setStatusFilter] = useState("All");

  // Barcode dialog
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [barcodeCase, setBarcodeCase] = useState(null);
  const barcodePrintRef = useRef(null);

  // Lab copy dialog
  const [labCopyDialogOpen, setLabCopyDialogOpen] = useState(false);
  const [labCopyCase, setLabCopyCase] = useState(null);
  const labCopyPrintRef = useRef(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = { fromDate: dtFrom, toDate: dtTo };
      if (statusFilter && statusFilter !== "All") {
        params.status = statusFilter;
      }
      const res = await labCaseService.getAll(params);
      setCases(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load cases." });
    } finally {
      setLoading(false);
    }
  };

  // Print Barcode
  const handleOpenBarcode = (c) => {
    setBarcodeCase(c);
    setBarcodeDialogOpen(true);
  };

  const handlePrintBarcode = useReactToPrint({
    contentRef: barcodePrintRef,
    documentTitle: `Barcode-${barcodeCase?.caseNo || ""}`,
    onAfterPrint: () => setBarcodeDialogOpen(false),
  });

  // Print Lab Copy
  const handleOpenLabCopy = (c) => {
    setLabCopyCase(c);
    setLabCopyDialogOpen(true);
  };

  const handlePrintLabCopy = useReactToPrint({
    contentRef: labCopyPrintRef,
    documentTitle: `LabCopy-${labCopyCase?.caseNo || ""}`,
    onAfterPrint: () => setLabCopyDialogOpen(false),
  });

  const columns = useMemo(
    () => getColumns({ onPrintBarcode: handleOpenBarcode, onPrintLabCopy: handleOpenLabCopy }),
    []
  );

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

      {/* Cases DataTable */}
      <DataTable columns={columns} data={cases} filterColumn="patientName" />

      {/* Print Barcode Dialog */}
      <Dialog open={barcodeDialogOpen} onOpenChange={setBarcodeDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Print Barcode</DialogTitle>
          </DialogHeader>
          <div className="border rounded p-4 bg-white">
            <div ref={barcodePrintRef} className="flex flex-col items-center gap-1">
              {barcodeCase && (
                <>
                  <span className="text-xs font-bold">{barcodeCase.patient?.pName || ""}</span>
                  <span className="text-[10px] text-gray-600">
                    Age: {calculateAge(barcodeCase.patient?.dob)}
                  </span>
                  <LabBarcode
                    value={barcodeCase.caseNo}
                    width={2}
                    height={50}
                    fontSize={12}
                    margin={5}
                  />
                  <span className="text-[10px] text-gray-600">
                    Date: {barcodeCase.caseDate
                      ? new Date(barcodeCase.caseDate).toLocaleDateString("en-GB")
                      : ""}
                  </span>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBarcodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => handlePrintBarcode()}>
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
          <div className="border rounded p-4 bg-white max-h-[60vh] overflow-auto">
            <div ref={labCopyPrintRef} className="p-2">
              {labCopyCase && (
                <div className="space-y-3 text-xs">
                  <div className="text-center font-bold text-sm border-b pb-2">
                    LABORATORY COPY
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Case No:</strong> {labCopyCase.caseNo}</div>
                    <div><strong>Date:</strong> {labCopyCase.caseDate
                      ? new Date(labCopyCase.caseDate).toLocaleDateString("en-GB")
                      : "-"}</div>
                    <div><strong>Patient:</strong> {labCopyCase.patient?.pName}</div>
                    <div><strong>MRN:</strong> {labCopyCase.patient?.mrn}</div>
                    <div><strong>Age:</strong> {calculateAge(labCopyCase.patient?.dob)}</div>
                    <div><strong>Gender:</strong> {labCopyCase.patient?.gender}</div>
                    <div><strong>Doctor:</strong> Dr. {labCopyCase.doctor?.Name}</div>
                    <div><strong>Priority:</strong> {labCopyCase.priority}</div>
                  </div>
                  <div className="border-t pt-2">
                    {(labCopyCase.tests || []).map((test, tIdx) => (
                      <div key={test.id} className="mb-3">
                        <div className="font-bold text-xs mb-1">
                          {tIdx + 1}. {test.testName} ({test.testCode})
                        </div>
                        {test.parameters && test.parameters.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow className="h-6">
                                <TableHead className="text-xs">Parameter</TableHead>
                                <TableHead className="text-xs">Result</TableHead>
                                <TableHead className="text-xs">Unit</TableHead>
                                <TableHead className="text-xs">Normal Range</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {test.parameters.map((param, pIdx) => (
                                <TableRow key={pIdx} className="h-6">
                                  <TableCell className="text-xs">{param.parameterName}</TableCell>
                                  <TableCell className="text-xs">{param.defaultValue || ""}</TableCell>
                                  <TableCell className="text-xs">{param.units || ""}</TableCell>
                                  <TableCell className="text-xs">{param.normalRange || ""}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-[10px] text-muted-foreground italic ml-2">
                            No printable parameters
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLabCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => handlePrintLabCopy()}>
              <Printer className="h-3 w-3 mr-1" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
