"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Save, Trash2, Search, Check, X, CreditCard, Wallet, RotateCcw } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import patientPaymentService from "@/services/patientPaymentService";
import patientVisitService from "@/services/patientVisitService";
import { patientPaymentSchema } from "@/lib/zodeSchema";

const PAYMENT_MODES = ["Cash", "Card", "BankTransfer", "Cheque", "Other"];

const formatMrn = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "-" + digits.slice(2);
};

export default function PatientPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paymentMode, setPaymentMode] = useState("invoice");

  const [mrnSearch, setMrnSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [dialogMessage, setDialogMessage] = useState(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMode, setRefundMode] = useState("Cash");
  const [refundRemarks, setRefundRemarks] = useState("");

  const toLocalISOString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 0, 0);
  const [dtFrom, setDtFrom] = useState(toLocalISOString(todayStart));
  const [dtTo, setDtTo] = useState(toLocalISOString(todayEnd));

  const { register, handleSubmit, watch, setValue, getValues, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(patientPaymentSchema),
    defaultValues: {
      visitId: "",
      mrn: "",
      invoiceNo: "",
      debit: 0,
      credit: 0,
      payerType: "Patient",
      insuranceCompanyId: "",
      remarks: "",
      paymentDetails: [{ paymentMode: "Cash", amount: 0 }],
      billingIds: [],
      billingAmounts: [],
    },
  });

  const { fields: paymentDetailFields, append, remove } = useFieldArray({
    control,
    name: "paymentDetails",
  });

  const watchedPaymentDetails = useWatch({ control, name: "paymentDetails" });

  const totalPaymentAmount = useMemo(() => {
    return (watchedPaymentDetails || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [watchedPaymentDetails]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dtFrom) params.dtFrom = dtFrom;
      if (dtTo) params.dtTo = dtTo;
      const res = await patientPaymentService.getAll(params);
      setPayments(res.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load payments" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPayments();
  };

  const handleMrnSearch = async () => {
    if (!mrnSearch.trim()) {
      setDialogMessage({ type: "error", text: "Please enter MRN" });
      return;
    }
    setLoading(true);
    setDialogMessage(null);
    try {
      const fullMrn = mrnSearch.startsWith("MRN-") ? mrnSearch : "MRN-" + mrnSearch;
      const res = await patientVisitService.getAll({ mrn: fullMrn });
      if (res.data && res.data.length > 0) {
        const visit = res.data[0];
        setSelectedPatient(visit.patient);
        setSelectedVisitId(visit.id);
        setMrnSearch(visit.patient?.mrn?.replace("MRN-", "") || "");
        setValue("visitId", visit.id);
        setValue("mrn", visit.patient?.mrn || "");
        setDialogMessage(null);
      } else {
        setDialogMessage({ type: "error", text: "No visit found for this MRN" });
        setSelectedPatient(null);
        setSelectedVisitId(null);
      }
    } catch {
      setDialogMessage({ type: "error", text: "MRN not found" });
      setSelectedPatient(null);
      setSelectedVisitId(null);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPayment(null);
    setSelectedInvoices([]);
    setSelectedPatient(null);
    setSelectedVisitId(null);
    setMrnSearch("");
    setPaymentMode("invoice");
    setDialogMessage(null);
    reset({
      visitId: "",
      mrn: "",
      invoiceNo: "",
      debit: 0,
      credit: 0,
      payerType: "Patient",
      insuranceCompanyId: "",
      remarks: "",
      paymentDetails: [{ paymentMode: "Cash", amount: 0 }],
      billingIds: [],
      billingAmounts: [],
    });
    setIsDialogOpen(true);
  };

  const openEdit = async (payment) => {
    setEditingPayment(payment);
    setSelectedInvoices(payment.linkedBills || []);
    setSelectedPatient(payment.patient || null);
    setPaymentMode(payment.invoiceNo ? "invoice" : "advance");
    setDialogMessage(null);
    const rawMrn = payment.mrn || payment.patient?.mrn || "";
    setMrnSearch(rawMrn.replace("MRN-", ""));
    reset({
      visitId: payment.visitId || "",
      mrn: payment.mrn || payment.patient?.mrn || "",
      invoiceNo: payment.invoiceNo || "",
      debit: Number(payment.debit) || 0,
      credit: Number(payment.credit) || 0,
      payerType: payment.payerType || "Patient",
      insuranceCompanyId: payment.insuranceCompanyId || "",
      remarks: payment.remarks || "",
      paymentDetails: payment.paymentDetails?.length > 0
        ? payment.paymentDetails.map((d) => ({
            paymentMode: d.paymentMode,
            amount: Number(d.amount) || 0,
          }))
        : [{ paymentMode: "Cash", amount: 0 }],
      billingIds: payment.linkedBills?.map((b) => b.billingId) || [],
      billingAmounts: payment.linkedBills?.map((b) => Number(b.amount)) || [],
    });
    setIsDialogOpen(true);
  };

  const updateInvoiceAmount = (billingId, amount) => {
    setSelectedInvoices(selectedInvoices.map((inv) =>
      inv.billingId === billingId ? { ...inv, amount: Number(amount) || 0 } : inv
    ));
  };

  const onSubmit = async (formData) => {
    if (totalPaymentAmount <= 0) {
      setDialogMessage({ type: "error", text: "Total payment amount must be greater than 0" });
      return;
    }

    if (paymentMode === "advance" && !formData.mrn) {
      setDialogMessage({ type: "error", text: "Please enter MRN for advance payment" });
      return;
    }

    if (paymentMode === "invoice" && !selectedPatient) {
      setDialogMessage({ type: "error", text: "Please search and select a patient first" });
      return;
    }

    setLoading(true);
    setDialogMessage(null);
    try {
      const payload = {
        visitId: paymentMode === "advance" ? null : (selectedVisitId || formData.visitId || null),
        mrn: selectedPatient?.mrn || formData.mrn || null,
        invoiceNo: formData.invoiceNo || null,
        debit: totalPaymentAmount,
        credit: Number(formData.credit) || 0,
        payerType: formData.payerType,
        insuranceCompanyId: formData.insuranceCompanyId || null,
        remarks: formData.remarks || null,
        paymentDetails: formData.paymentDetails,
        billingIds: paymentMode === "invoice" ? selectedInvoices.map((inv) => inv.billingId) : [],
        billingAmounts: paymentMode === "invoice" ? selectedInvoices.map((inv) => Number(inv.amount)) : [],
      };

      if (editingPayment) {
        await patientPaymentService.update(editingPayment.id, payload);
        setMessage({ type: "success", text: "Payment updated successfully" });
      } else {
        await patientPaymentService.create(payload);
        setMessage({ type: "success", text: paymentMode === "advance" ? "Advance payment recorded" : "Payment recorded successfully" });
      }
      setIsDialogOpen(false);
      fetchPayments();
    } catch (error) {
      setDialogMessage({ type: "error", text: error.response?.data?.message || "Failed to save payment" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this payment?")) return;
    try {
      await patientPaymentService.cancel(id);
      setMessage({ type: "success", text: "Payment cancelled" });
      fetchPayments();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to cancel payment" });
    }
  };

  const openRefundDialog = (payment) => {
    setRefundPayment(payment);
    setRefundAmount(Number(payment.advanceBalance) || 0);
    setRefundMode("Cash");
    setRefundRemarks("");
    setIsRefundDialogOpen(true);
  };

  const handleRefund = async () => {
    if (!refundPayment) return;
    if (refundAmount <= 0) {
      setMessage({ type: "error", text: "Refund amount must be greater than 0" });
      return;
    }
    if (refundAmount > Number(refundPayment.advanceBalance)) {
      setMessage({ type: "error", text: "Refund amount cannot exceed advance balance" });
      return;
    }
    try {
      await patientPaymentService.refundAdvance({
        paymentId: refundPayment.id,
        amount: refundAmount,
        paymentMode: refundMode,
        remarks: refundRemarks || `Refund advance for ${refundPayment.patient?.pName || "patient"}`,
      });
      setMessage({ type: "success", text: `Refund of ${refundAmount.toFixed(2)} processed successfully` });
      setIsRefundDialogOpen(false);
      fetchPayments();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to process refund" });
    }
  };

  const columns = [
    {
      id: "created_at",
      accessorFn: (row) => row.created_at,
      header: "Date",
      cell: ({ row }) => {
        const d = row.original.created_at;
        return d ? <span className="text-xs">{new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</span> : <span className="text-xs text-muted-foreground">N/A</span>;
      },
    },
    {
      id: "patient",
      accessorFn: (row) => row.patient?.pName || "",
      header: "Patient",
      cell: ({ row }) => {
        const p = row.original.patient;
        return p ? (
          <div>
            <p className="text-xs font-medium">{p.pName}</p>
            <p className="text-[10px] text-muted-foreground">{p.mrn}</p>
          </div>
        ) : <span className="text-xs text-muted-foreground">N/A</span>;
      },
    },
    {
      id: "type",
      accessorFn: (row) => {
        const isRefund = Number(row.credit) > 0 && Number(row.debit) === 0;
        if (isRefund) return "Refund";
        return row.invoiceNo ? "Invoice" : "Advance";
      },
      header: "Type",
      cell: ({ row }) => {
        const r = row.original;
        const isRefund = Number(r.credit) > 0 && Number(r.debit) === 0;
        const type = isRefund ? "Refund" : (r.invoiceNo ? "Invoice" : "Advance");
        const colors = {
          Invoice: "bg-blue-100 text-blue-700",
          Advance: "bg-amber-100 text-amber-700",
          Refund: "bg-purple-100 text-purple-700",
        };
        return <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors[type]}`}>{type}</span>;
      },
    },
    {
      id: "invoiceNo",
      accessorFn: (row) => row.invoiceNo || "",
      header: "Invoice No",
      cell: ({ row }) => <span className="text-xs">{row.original.invoiceNo || "-"}</span>,
    },
    {
      id: "paid",
      accessorFn: (row) => Number(row.debit) || 0,
      header: "Paid",
      cell: ({ row }) => {
        const val = Number(row.original.debit) || 0;
        return val > 0 ? <span className="text-xs font-semibold text-emerald-600">{val.toFixed(2)}</span> : <span className="text-xs text-muted-foreground">-</span>;
      },
    },
    {
      id: "refund",
      accessorFn: (row) => Number(row.credit) || 0,
      header: "Refund",
      cell: ({ row }) => {
        const val = Number(row.original.credit) || 0;
        return val > 0 ? <span className="text-xs font-semibold text-red-600">-{val.toFixed(2)}</span> : <span className="text-xs text-muted-foreground">-</span>;
      },
    },
    {
      id: "advanceBalance",
      accessorFn: (row) => Number(row.advanceBalance) || 0,
      header: "Balance",
      cell: ({ row }) => {
        const bal = Number(row.original.advanceBalance) || 0;
        return bal > 0 ? <span className="text-xs font-semibold text-emerald-600">{bal.toFixed(2)}</span> : <span className="text-xs text-muted-foreground">-</span>;
      },
    },
    {
      id: "paymentDetails",
      accessorFn: (row) => row.paymentDetails?.map((d) => d.paymentMode).join(", ") || "",
      header: "Mode",
      cell: ({ row }) => {
        const details = row.original.paymentDetails;
        return details?.length > 0 ? (
          <div className="flex flex-wrap gap-0.5">
            {details.map((d, i) => (
              <span key={i} className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                {d.paymentMode}
              </span>
            ))}
          </div>
        ) : <span className="text-xs text-muted-foreground">-</span>;
      },
    },
    {
      id: "status",
      accessorFn: (row) => row.status || "",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const colors = { Active: "bg-emerald-100 text-emerald-700", Cancelled: "bg-red-100 text-red-700", Refunded: "bg-purple-100 text-purple-700" };
        return <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${colors[s] || "bg-gray-100 text-gray-700"}`}>{s}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original;
        const hasAdvance = Number(payment.advanceBalance) > 0 && payment.status === "Active";
        return (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => openEdit(payment)}>
              Edit
            </Button>
            {hasAdvance && (
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-emerald-600" onClick={() => openRefundDialog(payment)}>
                <RotateCcw className="h-3 w-3 mr-0.5" /> Refund
              </Button>
            )}
            {payment.status === "Active" && (
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-red-600" onClick={() => handleCancel(payment.id)}>
                Cancel
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <Card className="shadow-sm border border-border/50">
        <CardHeader className="py-2.5 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Patient Payments
            </span>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white" onClick={openCreate}>
              <Plus className="h-3 w-3 mr-1" /> New Payment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-3 space-y-1">
              <Label className="text-[10px]">From</Label>
              <Input
                type="datetime-local"
                value={dtFrom}
                onChange={(e) => setDtFrom(e.target.value)}
                className="h-7 text-[11px]"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Label className="text-[10px]">To</Label>
              <Input
                type="datetime-local"
                value={dtTo}
                onChange={(e) => setDtTo(e.target.value)}
                className="h-7 text-[11px]"
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Label className="text-[10px]">Search (Patient/Invoice/MRN)</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-7 text-[11px]"
                placeholder=""
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-[10px]">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-7 text-[11px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 flex items-end">
              <Button size="sm" className="w-full h-7" onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <DataTable columns={columns} data={payments} filterColumn="patient" />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPayment ? "Edit Payment" : "New Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Dialog Error */}
            {dialogMessage && (
              <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${dialogMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {dialogMessage.type === "success" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                {dialogMessage.text}
              </div>
            )}

            {/* Payment Mode Toggle */}
            {!editingPayment && (
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  size="sm"
                  variant={paymentMode === "invoice" ? "default" : "ghost"}
                  className="flex-1 h-8 text-xs"
                  onClick={() => { setPaymentMode("invoice"); setDialogMessage(null); }}
                >
                  <CreditCard className="h-3 w-3 mr-1" /> Invoice Payment
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={paymentMode === "advance" ? "default" : "ghost"}
                  className="flex-1 h-8 text-xs"
                  onClick={() => { setPaymentMode("advance"); setDialogMessage(null); }}
                >
                  <Wallet className="h-3 w-3 mr-1" /> Advance (Deposit)
                </Button>
              </div>
            )}

            {/* MRN Search */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">MRN *</Label>
              <div className="flex gap-2">
                <Input
                  value={mrnSearch}
                  onChange={(e) => { setMrnSearch(formatMrn(e.target.value)); setDialogMessage(null); }}
                  className="h-9 text-xs font-mono"
                  placeholder="YY-#####"
                  onKeyDown={(e) => e.key === "Enter" && handleMrnSearch()}
                  disabled={!!editingPayment}
                  maxLength={8}
                />
                <Button type="button" size="sm" className="h-9 px-3" onClick={handleMrnSearch} disabled={!!editingPayment}>
                  <Search className="h-3 w-3" />
                </Button>
              </div>
              {selectedPatient && (
                <p className="text-xs text-emerald-600 font-medium">
                  {selectedPatient.pName} | {selectedPatient.mrn}
                </p>
              )}
            </div>

            {/* Payer Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payer Type *</Label>
                <Controller
                  name="payerType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Patient">Patient</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.payerType && <p className="text-xs text-destructive">{errors.payerType.message}</p>}
              </div>
              {watch("payerType") === "Insurance" && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Insurance Company</Label>
                  <Input {...register("insuranceCompanyId")} className="h-9 text-xs" placeholder="Enter insurance company ID" />
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Payment Methods *</Label>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => append({ paymentMode: "Cash", amount: 0 })}>
                  <Plus className="h-3 w-3 mr-1" /> Add Method
                </Button>
              </div>
              {paymentDetailFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Controller
                      name={`paymentDetails.${index}.paymentMode`}
                      control={control}
                      render={({ field: modeField }) => (
                        <Select value={modeField.value} onValueChange={modeField.onChange}>
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue placeholder="Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_MODES.map((mode) => (
                              <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Controller
                      name={`paymentDetails.${index}.amount`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          className="h-9 text-xs"
                          placeholder="Amount"
                        />
                      )}
                    />
                  </div>
                  {paymentDetailFields.length > 1 && (
                    <Button type="button" size="sm" variant="ghost" className="h-9 px-2 text-destructive" onClick={() => remove(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.paymentDetails && <p className="text-xs text-destructive">{errors.paymentDetails.message}</p>}
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Total: </span>
                <span className="text-sm font-semibold">{totalPaymentAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Invoice Linking (only in invoice mode) */}
            {paymentMode === "invoice" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Link to Invoices (Optional)</Label>
                {selectedInvoices.length > 0 ? (
                  <div className="border rounded-lg divide-y">
                    {selectedInvoices.map((inv) => (
                      <div key={inv.billingId} className="flex items-center gap-3 p-2">
                        <span className="text-xs font-medium flex-1">{inv.InvoiceNo}</span>
                        <Input
                          type="number"
                          value={inv.amount}
                          onChange={(e) => updateInvoiceAmount(inv.billingId, e.target.value)}
                          className="h-7 text-xs w-24"
                          placeholder="Amount"
                        />
                        <Button type="button" size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => setSelectedInvoices(selectedInvoices.filter((i) => i.billingId !== inv.billingId))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No invoices to link. Payment will be unlinked.</p>
                )}
              </div>
            )}

            {/* Remarks */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Remarks</Label>
              <Input {...register("remarks")} className="h-9 text-xs" placeholder="Optional" />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                {editingPayment ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Advance Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {dialogMessage && (
              <div className={`p-2 rounded text-xs ${dialogMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {dialogMessage.text}
              </div>
            )}

            {refundPayment && (
              <>
                <div className="bg-blue-50 p-2 rounded border border-blue-200">
                  <div className="text-xs text-blue-700 font-medium">Advance Balance</div>
                  <div className="text-lg font-bold text-blue-900">{Number(refundPayment.advanceBalance).toFixed(2)}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Refund Amount</Label>
                  <Input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                    min={0.01}
                    max={Number(refundPayment.advanceBalance)}
                    step={0.01}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Refund Method</Label>
                  <Select value={refundMode} onValueChange={setRefundMode}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode} className="text-xs">
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Remarks</Label>
                  <Input
                    value={refundRemarks}
                    onChange={(e) => setRefundRemarks(e.target.value)}
                    placeholder="Optional"
                    className="h-9 text-xs"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRefund} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <RotateCcw className="h-4 w-4 mr-1" />
                Confirm Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
