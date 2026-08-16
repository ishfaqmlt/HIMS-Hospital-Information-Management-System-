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
import axios from "@/lib/axios";
import billingService from "@/services/billing.service";
import billingDetailService from "@/services/billingDetailService";
import patientPaymentService from "@/services/patientPaymentService";
import { printInvoiceSlip } from "../invoice/page";
import { formatDate, toLocalISOString } from "@/lib/utils";

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
      // Parallel Batch 1: Concurrently fetch target invoice & any existing return vouchers using exact parameter indexing
      const [invoiceRes, existingReturnsRes] = await Promise.all([
        billingService.getAll({ invoiceNo }),
        billingService.getAll({ ReturnInvoiceNo: invoiceNo }).catch(() => ({ data: [] })),
      ]);

      const invoice = invoiceRes.data?.[0];
      if (!invoice) {
        setMessage({ type: "error", text: "Invoice not found" });
        return;
      }

      if (invoice.BillType === "Return") {
        setMessage({ type: "error", text: "Cannot process return on a Return Voucher." });
        setOriginalInvoice(invoice);
        setServices([]);
        return;
      }

      setOriginalInvoice(invoice);

      const existingReturnInvoices = existingReturnsRes.data || [];
      const returnDetailPromises = existingReturnInvoices.map((retInv) =>
        billingDetailService.getAll({ BillingId: retInv.id }).catch(() => ({ data: [] }))
      );

      // Parallel Batch 2: Concurrently fetch line details for target invoice and all return vouchers
      const [detailsRes, ...retDetailsResults] = await Promise.all([
        billingDetailService.getAll({ BillingId: invoice.id }),
        ...returnDetailPromises,
      ]);

      const details = detailsRes.data || [];

      // Calculate previously returned quantities per service
      let returnedQtyMap = {};
      for (const retRes of retDetailsResults) {
        const retDetails = retRes.data || [];
        for (const rd of retDetails) {
          const sId = rd.serviceId || rd.service?.id;
          if (sId) {
            returnedQtyMap[sId] = (returnedQtyMap[sId] || 0) + (Number(rd.Qty) || 0);
          }
        }
      }

      const loadedServices = details
        .map((d, idx) => {
          const sId = d.serviceId || d.service?.id;
          const totalOriginalQty = Number(d.Qty) || 1;
          const alreadyReturnedQty = returnedQtyMap[sId] || 0;
          const availableQty = Math.max(0, totalOriginalQty - alreadyReturnedQty);

          return {
            id: idx + 1,
            billingDetailId: d.Id,
            serviceId: sId,
            serviceCode: d.service?.Code || "",
            serviceName: d.service?.ServiceName || "",
            rate: Number(d.Rate) || 0,
            originalQty: availableQty,
            totalOriginalQty,
            alreadyReturnedQty,
            returnQty: 0,
            amount: Number(d.Amount) || 0,
            selected: false,
          };
        })
        .filter((s) => s.originalQty > 0);

      setServices(loadedServices);

      const totalAvailable = loadedServices.reduce((sum, s) => sum + s.originalQty, 0);
      if (totalAvailable === 0 || invoice.PaymentStatus === "Returned") {
        setMessage({ type: "error", text: `Invoice ${invoice.InvoiceNo} has already been fully returned.` });
      } else if (invoice.PaymentStatus === "Partially Returned" || loadedServices.some((s) => s.alreadyReturnedQty > 0)) {
        setMessage({ type: "info", text: `Note: Invoice ${invoice.InvoiceNo} has previous partial returns. You can return the remaining items below.` });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load invoice" });
    } finally {
      setLoading(false);
    }
  };

  const getSelectedReturnServices = () => {
    return services
      .filter((s) => s.selected || s.returnQty > 0)
      .map((s) => {
        const qty = s.returnQty > 0 ? s.returnQty : (s.originalQty > 0 ? s.originalQty : 1);
        return { ...s, selected: true, returnQty: qty };
      })
      .filter((s) => s.returnQty > 0);
  };

  const toggleService = (id) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextSelected = !s.selected;
        const defaultQty = s.originalQty > 0 ? s.originalQty : (s.totalOriginalQty > 0 ? s.totalOriginalQty : 1);
        return {
          ...s,
          selected: nextSelected,
          returnQty: nextSelected ? (s.returnQty > 0 ? s.returnQty : defaultQty) : 0,
        };
      })
    );
  };

  const toggleAll = () => {
    const allSelected = services.every((s) => s.selected);
    setServices((prev) =>
      prev.map((s) => {
        const nextSelected = !allSelected;
        const defaultQty = s.originalQty > 0 ? s.originalQty : 1;
        return {
          ...s,
          selected: nextSelected,
          returnQty: nextSelected ? (s.returnQty > 0 ? s.returnQty : defaultQty) : 0,
        };
      })
    );
  };

  const returnAll = () => {
    setServices((prev) =>
      prev.map((s) => {
        const defaultQty = s.originalQty > 0 ? s.originalQty : 1;
        return {
          ...s,
          selected: true,
          returnQty: defaultQty,
        };
      })
    );
  };

  const updateReturnQty = (id, qty) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const maxLimit = s.originalQty > 0 ? s.originalQty : 999;
        const parsed = Number(qty);
        const newQty = Math.min(Math.max(isNaN(parsed) ? 0 : parsed, 0), maxLimit);
        return { ...s, returnQty: newQty, selected: newQty > 0 };
      })
    );
  };

  const selectedReturnServices = getSelectedReturnServices();
  const selectedCount = selectedReturnServices.length;
  const subTotalReturn = selectedReturnServices.reduce((sum, s) => sum + s.rate * s.returnQty, 0);

  const origSubTotal = Number(originalInvoice?.SubTotal) || 0;
  const origDiscount = Number(originalInvoice?.Discount) || 0;
  const discountRatio = origSubTotal > 0 ? origDiscount / origSubTotal : 0;

  const discountReturn = subTotalReturn * discountRatio;
  const totalReturn = subTotalReturn - discountReturn;

  const handleReturnClick = () => {
    if (selectedReturnServices.length === 0) {
      setMessage({ type: "error", text: "Please select at least one service to return." });
      return;
    }
    setShowConfirm(true);
  };

  const handleReturn = async () => {
    const toReturn = selectedReturnServices;
    if (toReturn.length === 0 || !originalInvoice) return;

    setShowConfirm(false);
    setLoading(true);
    try {
      const billingRes = await billingService.create({
        visitId: originalInvoice.visitId,
        DepartmentId: originalInvoice.department?.id || originalInvoice.DepartmentId || null,
        DoctorId: originalInvoice.doctor?.id || originalInvoice.DoctorId || null,
        InvoiceDate: toLocalISOString(new Date()),
        SubTotal: subTotalReturn,
        Discount: discountReturn,
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
          BillingId: billingRes.data.id,
          invoiceNo: retInvNo,
          serviceId: svc.serviceId,
          Qty: svc.returnQty,
          Rate: svc.rate,
          Amount: svc.rate * svc.returnQty,
          SharePercent: 0,
          ShareAmount: 0,
        });
      }

      // Create refund credit payment entry
      try {
        await patientPaymentService.create({
          visitId: originalInvoice.visitId,
          mrn: originalInvoice.patientVisit?.patient?.mrn || mrn,
          invoiceNo: retInvNo,
          debit: 0,
          credit: totalReturn,
          payerType: "Patient",
          remarks: remarks || `Refund for Return Invoice ${retInvNo} (Original: ${originalInvoice.InvoiceNo})`,
          paymentDetails: [{ paymentMode: "Cash", amount: totalReturn }],
        });
      } catch (payErr) {
        console.warn("Refund payment creation warning:", payErr);
      }

      // Cancel linked lab case tests for returned services
      const returnedServiceIds = toReturn.map((s) => s.serviceId);
      if (returnedServiceIds.length > 0) {
        try {
          await axios.post("/lab-cases/cancel-returned-tests", {
            originalInvoiceNo: originalInvoice.InvoiceNo,
            serviceIds: returnedServiceIds,
          });
        } catch (labErr) {
          console.warn("Lab case test cancellation warning:", labErr);
        }
      }

      // Update original invoice status to "Returned" (fully returned) or "Partially Returned"
      const remainingTotal = services.reduce((sum, s) => {
        const itemReturnedNow = toReturn.find((tr) => tr.serviceId === s.serviceId)?.returnQty || 0;
        return sum + Math.max(0, s.originalQty - itemReturnedNow);
      }, 0);

      const nextStatus = remainingTotal === 0 ? "Returned" : "Partially Returned";

      try {
        await billingService.update(originalInvoice.id, {
          ...originalInvoice,
          PaymentStatus: nextStatus,
        });
      } catch (updErr) {
        console.warn(`Failed to update original invoice PaymentStatus to ${nextStatus}:`, updErr);
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
          <Button variant="outline" onClick={() => router.push("/Modules/FrontDesk/billing")}>
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
              <div><strong>Date:</strong> {formatDate(originalInvoice.InvoiceDate)}</div>
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
                    <TableCell className="text-xs py-1">
                      <span>{svc.serviceName}</span>
                      {svc.alreadyReturnedQty > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded ml-1.5 font-medium border border-amber-200">
                          Prev Returned: {svc.alreadyReturnedQty} of {svc.totalOriginalQty}
                        </span>
                      )}
                    </TableCell>
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
              <div className="text-xs text-muted-foreground">
                Selected: <strong>{selectedCount}</strong> of {services.length} services
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span>Items SubTotal: <strong>Rs. {subTotalReturn.toFixed(2)}</strong></span>
                {discountReturn > 0 && (
                  <span className="text-amber-700 font-medium">Discount Deducted: <strong>-Rs. {discountReturn.toFixed(2)}</strong></span>
                )}
              </div>
              <div className="text-base font-bold">
                Net Refund Amount: <span className="text-destructive">Rs. {totalReturn.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/Modules/FrontDesk/billing")} disabled={loading}>
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
                <Button onClick={() => router.push("/Modules/FrontDesk/billing")}>
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
            <div className="space-y-1 text-right border-t pt-2 text-xs">
              <div className="text-muted-foreground">Items SubTotal: Rs. {subTotalReturn.toFixed(2)}</div>
              {discountReturn > 0 && (
                <div className="text-amber-700 font-medium">Discount Deducted: -Rs. {discountReturn.toFixed(2)}</div>
              )}
              <div className="font-bold text-destructive text-sm pt-0.5">
                Net Refund Amount: Rs. {totalReturn.toFixed(2)}
              </div>
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
