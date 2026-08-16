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
import { toLocalISOString, calculateAge, formatDate } from "@/lib/utils";

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
    contentStyle: "@page { size: 80mm auto; margin: 0; } @media print { body { margin: 0; } }",
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
              <SelectItem value="Registered">Registered</SelectItem>
              <SelectItem value="Sampled">Sampled</SelectItem>
              <SelectItem value="InProcess">In Process</SelectItem>
              <SelectItem value="Reported">Reported</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
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
                      ? formatDate(barcodeCase.caseDate)
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Lab Copy (Thermal)</DialogTitle>
          </DialogHeader>
          <div className="border rounded p-2 bg-white max-h-[60vh] overflow-auto flex justify-center">
            <div
              ref={labCopyPrintRef}
              style={{
                width: "280px",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                lineHeight: "1.4",
                color: "#000",
                padding: "10px",
              }}
            >
              {labCopyCase && (
                <>
                  {/* Header */}
                  <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "6px", marginBottom: "6px" }}>
                    <div style={{ fontWeight: "bold", fontSize: "13px" }}>LABORATORY COPY</div>
                  </div>

                  {/* Case Info */}
                  <div style={{ marginBottom: "6px" }}>
                    <div><b>Case:</b> {labCopyCase.caseNo}</div>
                    <div><b>Date:</b> {labCopyCase.caseDate ? formatDate(labCopyCase.caseDate) : "-"}</div>
                  </div>

                  {/* Patient Info */}
                  <div style={{ borderBottom: "1px dashed #000", paddingBottom: "6px", marginBottom: "6px" }}>
                    <div><b>Patient:</b> {labCopyCase.patient?.pName}</div>
                    <div><b>MRN:</b> {labCopyCase.patient?.mrn}</div>
                    <div><b>Age:</b> {calculateAge(labCopyCase.patient?.dob)}</div>
                    <div><b>Gender:</b> {labCopyCase.patient?.gender}</div>
                    <div><b>Doctor:</b> Dr. {labCopyCase.doctor?.Name}</div>
                    <div><b>Priority:</b> {labCopyCase.priority}</div>
                  </div>

                  {/* Parameters */}
                  <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>Parameters / Result</div>
                  {(labCopyCase.tests || []).map((test) => (
                    <div key={test.id} style={{ marginBottom: "6px" }}>
                      {test.parameters && test.parameters.length > 0 && (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginTop: "2px" }}>
                          <tbody>
                            {test.parameters.map((param, pIdx) => (
                              <tr key={pIdx}>
                                <td style={{ padding: "1px 2px" }}>{param.parameterName} : ____________________</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}

                  {/* Footer */}
                  <div style={{ marginTop: "50px", textAlign: "left", fontSize: "10px" }}>Signature: ________________________ </div>
                 
                </>
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
