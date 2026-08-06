"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, X, RotateCcw, CheckSquare, Printer, FileText } from "lucide-react";
import billingService from "@/services/billing.service";
import billingDetailService from "@/services/billingDetailService";
import patientPaymentService from "@/services/patientPaymentService";
import { printInvoiceSlip } from "../invoice/page";

function ReturnInvoiceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const invoiceNo = searchParams.get("invoiceNo");
  const mrn = searchParams.get("mrn");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [services, setServices] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [returnInvoiceNo, setReturnInvoiceNo] = useState(null);
  const [returnInvoiceData, setReturnInvoiceData] = useState(null);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (invoiceNo) loadInvoice();
  }, [invoiceNo]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const invoiceRes = await billingService.getAll({ search: invoiceNo });
      const invoice = invoiceRes.data?.[0];
      if (!invoice) {
        setMessage({ type: "error", text: "Invoice not found" });
        return;
      }
      setOriginalInvoice(invoice);

      const detailsRes = await billingDetailService.getAll({ BillingId: invoice.id });
      const details = detailsRes.data || [];

      const loadedServices = details.map((d, idx) => ({
        id: idx + 1,
        billingDetailId: d.Id,
        serviceId: d.serviceId || d.service?.id,
        serviceCode: d.service?.Code || "",
        serviceName: d.service?.ServiceName || "",
        rate: Number(d.Rate) || 0,
        originalQty: Number(d.Qty) || 1,
        returnQty: 0,
        amount: Number(d.Amount) || 0,
        selected: false,
      }));

      setServices(loadedServices);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load invoice" });
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, selected: !s.selected, returnQty: !s.selected ? s.originalQty : 0 } : s
      )
    );
  };

  const toggleAll = () => {
    const allSelected = services.every((s) => s.selected);
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        selected: !allSelected,
        returnQty: !allSelected ? s.originalQty : 0,
      }))
    );
  };

  const returnAll = () => {
    setServices((prev) =>
      prev.map((s) => ({
        ...s,
        selected: true,
        returnQty: s.originalQty,
      }))
    );
  };

  const updateReturnQty = (id, qty) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newQty = Math.min(Math.max(Number(qty) || 0, 0), s.originalQty);
        return { ...s, returnQty: newQty, selected: newQty > 0 };
      })
    );
  };

  const selectedCount = services.filter((s) => s.selected).length;
  const totalReturn = services
    .filter((s) => s.selected)
    .reduce((sum, s) => sum + s.rate * s.returnQty, 0);

  const handleReturnClick = () => {
    const toReturn = services.filter((s) => s.selected && s.returnQty > 0);
    if (toReturn.length === 0) {
      setMessage({ type: "error", text: "Please select at least one service to return" });
      return;
    }
    setShowConfirm(true);
  };

  const handleReturn = async () => {
    const toReturn = services.filter((s) => s.selected && s.returnQty > 0);
    if (toReturn.length === 0 || !originalInvoice) return;

    setShowConfirm(false);
    setLoading(true);
    try {
      const billingRes = await billingService.create({
        visitId: originalInvoice.visitId,
        DepartmentId: originalInvoice.department?.id || originalInvoice.DepartmentId || null,
        DoctorId: originalInvoice.doctor?.id || originalInvoice.DoctorId || null,
        InvoiceDate: new Date().toISOString(),
        SubTotal: totalReturn,
        Discount: 0,
        TotalAmount: totalReturn,
        PaymentStatus: "Pending",
        BillType: "Return",
        ReturnInvoiceNo: originalInvoice.InvoiceNo,
        Notes: remarks || `Return from ${invoiceNo}`,
      });

      const retInvNo = billingRes.data.InvoiceNo;
      setReturnInvoiceNo(retInvNo);
      setReturnInvoiceData(billingRes.data);

      for (const svc of toReturn) {
        await billingDetailService.create({
          invoiceNo: retInvNo,
          serviceId: svc.serviceId,
          Qty: svc.returnQty,
          Rate: svc.rate,
          Amount: svc.rate * svc.returnQty,
          SharePercent: 0,
          ShareAmount: 0,
        });
      }

      setMessage({ type: "success", text: `Return invoice created: ${retInvNo}` });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to create return" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReturn = async (format) => {
    if (!returnInvoiceData) return;
    await printInvoiceSlip(
      { ...returnInvoiceData, InvoiceNo: returnInvoiceNo },
      format,
      setMessage
    );
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Return Invoice</h1>
        <div className="flex gap-2">
          {returnInvoiceNo && (
            <>
              <Button variant="outline" size="sm" onClick={() => handlePrintReturn("thermal")}>
                <Printer className="h-4 w-4 mr-1" /> Print Thermal
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePrintReturn("a4")}>
                <FileText className="h-4 w-4 mr-1" /> Print A4
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => router.push("/Modules/Billing")}>
            <X className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>
      </div>

      {originalInvoice && (
        <Card>
          <CardHeader className="py-2 bg-muted">
            <CardTitle className="text-sm">Original Invoice: {originalInvoice.InvoiceNo}</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div><strong>MRN:</strong> {originalInvoice.patientVisit?.patient?.mrn || "-"}</div>
              <div><strong>Patient:</strong> {originalInvoice.patientVisit?.patient?.pName || "-"}</div>
              <div><strong>Date:</strong> {new Date(originalInvoice.InvoiceDate).toLocaleDateString("en-GB")}</div>
              <div><strong>Total:</strong> {Number(originalInvoice.TotalAmount).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="py-2 bg-primary text-primary-foreground flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Select Services to Return</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={toggleAll} disabled={services.length === 0}>
              <CheckSquare className="h-3 w-3 mr-1" />
              {services.every((s) => s.selected) ? "Deselect All" : "Select All"}
            </Button>
            <Button size="sm" variant="secondary" onClick={returnAll} disabled={services.length === 0}>
              <RotateCcw className="h-3 w-3 mr-1" /> Return All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs h-7 w-10"></TableHead>
                <TableHead className="text-xs h-7">Code</TableHead>
                <TableHead className="text-xs h-7">Service</TableHead>
                <TableHead className="text-xs h-7 text-center">Orig Qty</TableHead>
                <TableHead className="text-xs h-7 text-center">Return Qty</TableHead>
                <TableHead className="text-xs h-7 text-right">Rate</TableHead>
                <TableHead className="text-xs h-7 text-right">Return Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? (
                services.map((svc) => (
                  <TableRow key={svc.id} className={svc.selected ? "bg-red-50" : ""}>
                    <TableCell className="py-1">
                      <input
                        type="checkbox"
                        checked={svc.selected}
                        onChange={() => toggleService(svc.id)}
                        className="h-4 w-4"
                      />
                    </TableCell>
                    <TableCell className="text-xs py-1">{svc.serviceCode}</TableCell>
                    <TableCell className="text-xs py-1">{svc.serviceName}</TableCell>
                    <TableCell className="text-xs py-1 text-center">{svc.originalQty}</TableCell>
                    <TableCell className="text-xs py-1 text-center">
                      <Input
                        type="number"
                        value={svc.returnQty}
                        onChange={(e) => updateReturnQty(svc.id, e.target.value)}
                        className="h-6 text-xs w-16 text-center"
                        min={0}
                        max={svc.originalQty}
                        disabled={!svc.selected}
                      />
                    </TableCell>
                    <TableCell className="text-xs py-1 text-right">{Number(svc.rate).toFixed(2)}</TableCell>
                    <TableCell className="text-xs py-1 text-right font-medium">
                      {svc.selected ? (
                        <span className="text-destructive">
                          {Number(svc.rate * svc.returnQty).toFixed(2)}
                        </span>
                      ) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                    {loading ? "Loading..." : "No services found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Remarks / Return Reason</Label>
            <Input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="h-8 text-xs"
              placeholder="Enter return reason"
            />
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <div className="space-y-1">
              <div className="text-sm">
                Selected: <strong>{selectedCount}</strong> of {services.length} services
              </div>
              <div className="text-lg font-bold">
                Total Return: <span className="text-destructive">{totalReturn.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/Modules/Billing")} disabled={loading}>
                Cancel
              </Button>
              {!returnInvoiceNo ? (
                <Button
                  variant="destructive"
                  onClick={handleReturnClick}
                  disabled={loading || selectedCount === 0}
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RotateCcw className="h-4 w-4 mr-2" />}
                  Process Return
                </Button>
              ) : (
                <Button onClick={() => router.push("/Modules/Billing")}>
                  Back to Billing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">Are you sure you want to return the following services?</p>
            <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
              {services
                .filter((s) => s.selected && s.returnQty > 0)
                .map((svc) => (
                  <div key={svc.id} className="flex justify-between p-2 text-xs">
                    <span>{svc.serviceCode} - {svc.serviceName}</span>
                    <span>Qty: {svc.returnQty} | {Number(svc.rate * svc.returnQty).toFixed(2)}</span>
                  </div>
                ))}
            </div>
            <div className="text-right font-bold text-destructive">
              Total: {totalReturn.toFixed(2)}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReturn} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Confirm Return"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ReturnInvoicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ReturnInvoiceContent />
    </Suspense>
  );
}
