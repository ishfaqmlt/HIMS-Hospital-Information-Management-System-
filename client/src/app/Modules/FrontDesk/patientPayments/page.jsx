"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  Search,
  Check,
  X,
  CreditCard,
  Wallet,
  RotateCcw,
} from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import patientPaymentService from "@/services/patientPaymentService";
import patientVisitService from "@/services/patientVisitService";
import patientService from "@/services/patient.service";
import billingService from "@/services/billing.service";
import { patientPaymentSchema } from "@/lib/zodeSchema";
import { toLocalISOString, formatDate } from "@/lib/utils";

const PAYMENT_MODES = ["Cash", "Card", "BankTransfer", "Cheque", "Other"];

export default function PatientPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [paymentMode, setPaymentMode] = useState("invoice");

  const [mrnSearch, setMrnSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientAdvanceBalance, setSelectedPatientAdvanceBalance] = useState(0);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [dialogMessage, setDialogMessage] = useState(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMode, setRefundMode] = useState("Cash");
  const [refundRemarks, setRefundRemarks] = useState("");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 0, 0);
  const [dtFrom, setDtFrom] = useState(toLocalISOString(todayStart));
  const [dtTo, setDtTo] = useState(toLocalISOString(todayEnd));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm({
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

  const {
    fields: paymentDetailFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "paymentDetails",
  });

  const watchedPaymentDetails = useWatch({ control, name: "paymentDetails" });

  const totalPaymentAmount = useMemo(() => {
    return (watchedPaymentDetails || []).reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );
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
      setDialogMessage({ type: "error", text: "Please enter MRN to search" });
      return;
    }
    setLoading(true);
    setDialogMessage(null);
    try {
      const fullMrn = mrnSearch.startsWith("MRN-")
        ? mrnSearch.trim()
        : `MRN-${mrnSearch.trim()}`;

      let patient = null;
      let visitId = null;

      // 1. First check visits
      const visitRes = await patientVisitService.getAll({ mrn: fullMrn });
      if (visitRes.data && visitRes.data.length > 0) {
        const visit = visitRes.data[0];
        patient = visit.patient;
        visitId = visit.id;
      } else {
        // Fallback to patient master directly
        const patRes = await patientService.getAll({ mrn: fullMrn });
        if (patRes.data && patRes.data.length > 0) {
          patient = patRes.data[0];
        }
      }

      if (patient) {
        setSelectedPatient(patient);
        setSelectedVisitId(visitId);
        setValue("visitId", visitId || "");
        setValue("mrn", patient.mrn || "");

        // Fetch advance balance if any
        try {
          const advRes = await patientPaymentService.getAdvanceBalance(patient.mrn);
          setSelectedPatientAdvanceBalance(Number(advRes.data?.advanceBalance) || 0);
        } catch {
          setSelectedPatientAdvanceBalance(0);
        }

        // In invoice payment mode, look up pending unpaid invoices
        if (paymentMode === "invoice" && !editingPayment) {
          try {
            const billRes = await billingService.getAll({ mrn: patient.mrn });
            if (billRes.data && billRes.data.length > 0) {
              const pendingBills = billRes.data.filter(
                (b) => b.PaymentStatus !== "Paid" && Number(b.TotalAmount) > 0
              );
              setAvailableInvoices(pendingBills);
              if (pendingBills.length > 0) {
                const autoLinked = pendingBills.map((b) => ({
                  billingId: b.id,
                  InvoiceNo: b.InvoiceNo,
                  TotalAmount: b.TotalAmount,
                  amount: Number(b.TotalAmount) || 0,
                }));
                setSelectedInvoices(autoLinked);

                const totalPending = autoLinked.reduce((s, b) => s + b.amount, 0);
                if (totalPending > 0) {
                  setValue("paymentDetails", [{ paymentMode: "Cash", amount: totalPending }]);
                }
              }
            }
          } catch (e) {
            console.error("Failed to fetch pending invoices", e);
          }
        }
        setDialogMessage(null);
      } else {
        setDialogMessage({ type: "error", text: "No patient found for this MRN" });
        setSelectedPatient(null);
        setSelectedVisitId(null);
        setSelectedPatientAdvanceBalance(0);
        setAvailableInvoices([]);
      }
    } catch {
      setDialogMessage({ type: "error", text: "MRN search failed" });
      setSelectedPatient(null);
      setSelectedVisitId(null);
      setSelectedPatientAdvanceBalance(0);
      setAvailableInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPayment(null);
    setSelectedInvoices([]);
    setAvailableInvoices([]);
    setSelectedPatient(null);
    setSelectedPatientAdvanceBalance(0);
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
    setAvailableInvoices([]);
    setSelectedPatient(payment.patient || null);
    setSelectedPatientAdvanceBalance(Number(payment.advanceBalance) || 0);
    setPaymentMode(payment.invoiceNo ? "invoice" : "advance");
    setDialogMessage(null);
    const rawMrn = payment.mrn || payment.patient?.mrn || "";
    setMrnSearch(rawMrn);
    reset({
      visitId: payment.visitId || "",
      mrn: payment.mrn || payment.patient?.mrn || "",
      invoiceNo: payment.invoiceNo || "",
      debit: Number(payment.debit) || 0,
      credit: Number(payment.credit) || 0,
      payerType: payment.payerType || "Patient",
      insuranceCompanyId: payment.insuranceCompanyId || "",
      remarks: payment.remarks || "",
      paymentDetails:
        payment.paymentDetails?.length > 0
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
    setSelectedInvoices(
      selectedInvoices.map((inv) =>
        inv.billingId === billingId
          ? { ...inv, amount: Number(amount) || 0 }
          : inv
      )
    );
  };

  const linkAllUnpaidInvoices = () => {
    if (availableInvoices.length > 0) {
      const autoLinked = availableInvoices.map((b) => ({
        billingId: b.id,
        InvoiceNo: b.InvoiceNo,
        TotalAmount: b.TotalAmount,
        amount: Number(b.TotalAmount) || 0,
      }));
      setSelectedInvoices(autoLinked);
      const totalPending = autoLinked.reduce((s, b) => s + b.amount, 0);
      if (totalPending > 0) {
        setValue("paymentDetails", [{ paymentMode: "Cash", amount: totalPending }]);
      }
    }
  };

  const onSubmit = async (formData) => {
    if (totalPaymentAmount <= 0) {
      setDialogMessage({
        type: "error",
        text: "Total payment amount must be greater than 0",
      });
      return;
    }

    if (paymentMode === "advance" && !formData.mrn && !selectedPatient?.mrn) {
      setDialogMessage({
        type: "error",
        text: "Please enter patient MRN for advance payment",
      });
      return;
    }

    if (paymentMode === "invoice" && !selectedPatient && !formData.mrn) {
      setDialogMessage({
        type: "error",
        text: "Please search and select a patient first",
      });
      return;
    }

    setLoading(true);
    setDialogMessage(null);
    try {
      const payload = {
        visitId:
          paymentMode === "advance"
            ? null
            : selectedVisitId || formData.visitId || null,
        mrn: selectedPatient?.mrn || formData.mrn || null,
        invoiceNo: formData.invoiceNo || null,
        debit: totalPaymentAmount,
        credit: Number(formData.credit) || 0,
        payerType: formData.payerType,
        insuranceCompanyId: formData.insuranceCompanyId || null,
        remarks: formData.remarks || null,
        paymentDetails: formData.paymentDetails,
        billingIds:
          paymentMode === "invoice"
            ? selectedInvoices.map((inv) => inv.billingId)
            : [],
        billingAmounts:
          paymentMode === "invoice"
            ? selectedInvoices.map((inv) => Number(inv.amount))
            : [],
      };

      if (editingPayment) {
        await patientPaymentService.update(editingPayment.id, payload);
        setMessage({ type: "success", text: "Payment updated successfully" });
      } else {
        await patientPaymentService.create(payload);
        setMessage({
          type: "success",
          text:
            paymentMode === "advance"
              ? "Advance payment recorded successfully"
              : "Payment recorded successfully",
        });
      }
      setIsDialogOpen(false);
      fetchPayments();
    } catch (error) {
      setDialogMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save payment",
      });
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
      console.error(error);
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
      setMessage({
        type: "error",
        text: "Refund amount must be greater than 0",
      });
      return;
    }
    if (refundAmount > Number(refundPayment.advanceBalance)) {
      setMessage({
        type: "error",
        text: "Refund amount cannot exceed advance balance",
      });
      return;
    }
    try {
      await patientPaymentService.refundAdvance({
        paymentId: refundPayment.id,
        amount: refundAmount,
        paymentMode: refundMode,
        remarks:
          refundRemarks ||
          `Refund advance for ${refundPayment.patient?.pName || refundPayment.patient_name || "patient"}`,
      });
      setMessage({
        type: "success",
        text: `Refund of Rs. ${refundAmount.toFixed(2)} processed successfully`,
      });
      setIsRefundDialogOpen(false);
      fetchPayments();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to process refund",
      });
    }
  };

  const columns = [
    {
      id: "created_at",
      accessorFn: (row) => row.created_at,
      header: "Date",
      cell: ({ row }) => {
        const d = row.original.created_at;
        return d ? (
          <span className="text-xs font-mono font-medium text-slate-700">
            {formatDate(d)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "patient",
      accessorFn: (row) => row.patient?.pName || row.patient_name || "",
      header: "Patient Details",
      cell: ({ row }) => {
        const pName = row.original.patient?.pName || row.original.patient_name;
        const mrn =
          row.original.patient?.mrn ||
          row.original.patient_mrn ||
          row.original.mrn;
        return pName ? (
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {pName}
            </p>
            <p className="text-[11px] font-mono text-slate-500">{mrn}</p>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-600">
            {mrn || "N/A"}
          </span>
        );
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
        const type = isRefund ? "Refund" : r.invoiceNo ? "Invoice" : "Advance";
        const badgeClasses = {
          Invoice: "bg-blue-50 text-blue-700 border border-blue-200",
          Advance: "bg-amber-50 text-amber-700 border border-amber-200",
          Refund: "bg-purple-50 text-purple-700 border border-purple-200",
        };
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${badgeClasses[type] || "bg-slate-100 text-slate-700"}`}
          >
            {type}
          </span>
        );
      },
    },
    {
      id: "invoiceNo",
      accessorFn: (row) => row.invoiceNo || "",
      header: "Invoice No",
      cell: ({ row }) => (
        <span className="text-xs font-mono font-semibold text-slate-800">
          {row.original.invoiceNo || "-"}
        </span>
      ),
    },
    {
      id: "paid",
      accessorFn: (row) => Number(row.debit) || 0,
      header: "Paid (Debit)",
      cell: ({ row }) => {
        const val = Number(row.original.debit) || 0;
        return val > 0 ? (
          <span className="text-xs font-mono font-bold text-emerald-700">
            Rs. {val.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "refund",
      accessorFn: (row) => Number(row.credit) || 0,
      header: "Refund (Credit)",
      cell: ({ row }) => {
        const val = Number(row.original.credit) || 0;
        return val > 0 ? (
          <span className="text-xs font-mono font-bold text-rose-600">
            -Rs. {val.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "advanceBalance",
      accessorFn: (row) => Number(row.advanceBalance) || 0,
      header: "Adv. Balance",
      cell: ({ row }) => {
        const bal = Number(row.original.advanceBalance) || 0;
        return bal > 0 ? (
          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Rs. {bal.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">-</span>
        );
      },
    },
    {
      id: "paymentDetails",
      accessorFn: (row) =>
        row.paymentDetails?.map((d) => d.paymentMode).join(", ") || "",
      header: "Payment Mode",
      cell: ({ row }) => {
        const details = row.original.paymentDetails;
        return details?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {details.map((d, i) => (
              <span
                key={i}
                className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
              >
                {d.paymentMode}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "status",
      accessorFn: (row) => row.status || "",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const badgeClasses = {
          Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
          Cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
          Refunded: "bg-purple-50 text-purple-700 border border-purple-200",
        };
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${badgeClasses[s] || "bg-slate-100 text-slate-700"}`}
          >
            {s}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original;
        const hasAdvance =
          Number(payment.advanceBalance) > 0 && payment.status === "Active";
        return (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
              onClick={() => openEdit(payment)}
            >
              Edit
            </Button>
            {hasAdvance && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                onClick={() => openRefundDialog(payment)}
              >
                <RotateCcw className="h-3 w-3 mr-1" /> Refund
              </Button>
            )}
            {payment.status === "Active" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                onClick={() => handleCancel(payment.id)}
              >
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
        <Alert
          variant={message.type === "success" ? "default" : "destructive"}
          className={
            message.type === "success"
              ? "border-emerald-500 text-emerald-800 bg-emerald-50 shadow-2xs"
              : "shadow-2xs"
          }
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <AlertDescription className="font-semibold text-sm">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Listing Card */}
      <Card className="shadow-xs border border-slate-200/90 rounded-xl overflow-hidden">
        <CardHeader className="py-2.5 px-4 bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-t-xl">
          <CardTitle className="text-xs font-bold tracking-wide flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-teal-400" />
              PATIENT PAYMENTS & SEARCH
            </span>
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-xs cursor-pointer"
              onClick={openCreate}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> New Payment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4 bg-white">
          {/* Top Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
            <div className="lg:col-span-3 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">From Date</Label>
              <Input
                type="datetime-local"
                value={dtFrom}
                onChange={(e) => setDtFrom(e.target.value)}
                className="h-9 text-sm font-mono bg-white border-slate-300 rounded-md shadow-2xs focus:border-teal-500"
              />
            </div>
            <div className="lg:col-span-3 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">To Date</Label>
              <Input
                type="datetime-local"
                value={dtTo}
                onChange={(e) => setDtTo(e.target.value)}
                className="h-9 text-sm font-mono bg-white border-slate-300 rounded-md shadow-2xs focus:border-teal-500"
              />
            </div>
            <div className="lg:col-span-3 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Search (Patient / Invoice / MRN)
              </Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-sm font-medium bg-white border-slate-300 rounded-md shadow-2xs focus:border-teal-500"
                placeholder="Search patient, invoice, MRN..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="lg:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-9 text-sm bg-white border-slate-300 rounded-md shadow-2xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="lg:col-span-1">
              <Button
                size="sm"
                className="w-full h-9 text-sm bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-md shadow-xs flex items-center justify-center cursor-pointer"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* DataTable Component */}
          <DataTable columns={columns} data={payments} filterColumn="patient" />
        </CardContent>
      </Card>

      {/* Create / Edit Payment Widescreen Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[95vw] md:w-[850px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-600" />
              {editingPayment ? "Edit Payment" : "New Patient Payment"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Inline Dialog Alert */}
            {dialogMessage && (
              <Alert
                variant={
                  dialogMessage.type === "success" ? "default" : "destructive"
                }
                className={
                  dialogMessage.type === "success"
                    ? "border-emerald-500 text-emerald-800 bg-emerald-50"
                    : ""
                }
              >
                {dialogMessage.type === "success" ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <AlertDescription className="text-xs font-semibold">
                  {dialogMessage.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Mode Segmented Selector (Create Mode Only) */}
            {!editingPayment && (
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <Button
                  type="button"
                  variant={paymentMode === "invoice" ? "default" : "ghost"}
                  className={`flex-1 h-9 text-sm font-semibold transition-all cursor-pointer ${
                    paymentMode === "invoice"
                      ? "bg-white text-slate-900 shadow-xs hover:bg-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={() => {
                    setPaymentMode("invoice");
                    setDialogMessage(null);
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2 text-teal-600" /> Invoice Payment
                </Button>
                <Button
                  type="button"
                  variant={paymentMode === "advance" ? "default" : "ghost"}
                  className={`flex-1 h-9 text-sm font-semibold transition-all cursor-pointer ${
                    paymentMode === "advance"
                      ? "bg-white text-slate-900 shadow-xs hover:bg-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  onClick={() => {
                    setPaymentMode("advance");
                    setDialogMessage(null);
                  }}
                >
                  <Wallet className="h-4 w-4 mr-2 text-amber-600" /> Advance (Deposit)
                </Button>
              </div>
            )}

            {/* 2-Column Spacious Grid for Wide Input Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Field 1: MRN & Patient Search */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Patient MRN
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={mrnSearch}
                    onChange={(e) => {
                      setMrnSearch(e.target.value);
                      setDialogMessage(null);
                    }}
                    className="h-10 text-sm font-mono border-slate-300 rounded-md focus:border-teal-500"
                    placeholder="e.g. 26-1 or MRN-26-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleMrnSearch();
                      }
                    }}
                    disabled={!!editingPayment}
                  />
                  <Button
                    type="button"
                    className="h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-2xs cursor-pointer shrink-0"
                    onClick={handleMrnSearch}
                    disabled={!!editingPayment || loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-1.5" />
                    )}
                    Search
                  </Button>
                </div>
                {selectedPatient && (
                  <div className="mt-2 px-3 py-2 bg-emerald-50/90 border border-emerald-200/90 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-emerald-950">
                        {selectedPatient.pName}
                      </p>
                      <p className="text-xs text-emerald-800 font-mono">
                        {selectedPatient.mrn} • {selectedPatient.gender || "N/A"}
                        {selectedPatient.mobileNo || selectedPatient.mobile
                          ? ` • ${selectedPatient.mobileNo || selectedPatient.mobile}`
                          : ""}
                      </p>
                    </div>
                    {selectedPatientAdvanceBalance > 0 && (
                      <Badge className="bg-emerald-600 text-white font-mono text-xs">
                        Adv: Rs. {Number(selectedPatientAdvanceBalance).toFixed(2)}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Field 2: Payer Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Payer Type
                </Label>
                <Controller
                  name="payerType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue placeholder="Select Payer Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Patient">Patient</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.payerType && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.payerType.message}
                  </p>
                )}
              </div>

              {/* Conditional Field: Insurance Company */}
              {watch("payerType") === "Insurance" && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">
                    Insurance Company / Reference
                  </Label>
                  <Input
                    {...register("insuranceCompanyId")}
                    className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500"
                    placeholder="Enter insurance company name or authorization ID"
                  />
                </div>
              )}

              {/* Invoice Allocation Section (Invoice Payment Mode Only) */}
              {paymentMode === "invoice" && (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700">
                      Link to Invoices (Allocation)
                    </Label>
                    {availableInvoices.length > 0 && selectedInvoices.length === 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold text-teal-700 border-teal-300 hover:bg-teal-50 cursor-pointer"
                        onClick={linkAllUnpaidInvoices}
                      >
                        Link Pending Invoices ({availableInvoices.length})
                      </Button>
                    )}
                  </div>
                  {selectedInvoices.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white shadow-2xs">
                      {selectedInvoices.map((inv) => (
                        <div
                          key={inv.billingId}
                          className="flex items-center gap-4 p-3 bg-white hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-bold font-mono text-slate-900">
                              {inv.InvoiceNo}
                            </span>
                            {inv.TotalAmount && (
                              <span className="text-xs text-slate-500 ml-2 font-mono">
                                (Bill Total: Rs. {Number(inv.TotalAmount).toFixed(2)})
                              </span>
                            )}
                          </div>
                          <div className="w-44">
                            <Input
                              type="number"
                              value={inv.amount}
                              onChange={(e) =>
                                updateInvoiceAmount(inv.billingId, e.target.value)
                              }
                              className="h-10 text-sm font-mono font-bold border-slate-300 text-right rounded-md focus:border-teal-500"
                              placeholder="Amount"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-10 w-10 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md shrink-0 cursor-pointer"
                            onClick={() =>
                              setSelectedInvoices(
                                selectedInvoices.filter(
                                  (i) => i.billingId !== inv.billingId
                                )
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                      <p className="text-xs text-slate-500 font-medium">
                        No invoices linked. Payment will be recorded as general credit for the patient.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Methods Section */}
              <div className="space-y-2.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Payment Methods & Amounts
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    onClick={() => append({ paymentMode: "Cash", amount: 0 })}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1 text-teal-700" /> Add Method
                  </Button>
                </div>

                {paymentDetailFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-3 items-end bg-slate-50/80 p-3 rounded-xl border border-slate-200/90"
                  >
                    <div className="w-1/3 space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">
                        Payment Mode
                      </Label>
                      <Controller
                        name={`paymentDetails.${index}.paymentMode`}
                        control={control}
                        render={({ field: modeField }) => (
                          <Select
                            value={modeField.value}
                            onValueChange={modeField.onChange}
                          >
                            <SelectTrigger className="w-full h-10 text-sm font-medium bg-white border-slate-300 rounded-md focus:border-teal-500">
                              <SelectValue placeholder="Mode" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_MODES.map((mode) => (
                                <SelectItem key={mode} value={mode}>
                                  {mode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-600">
                        Amount (Rs.)
                      </Label>
                      <Controller
                        name={`paymentDetails.${index}.amount`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                            className="h-10 text-sm font-mono font-bold bg-white border-slate-300 rounded-md focus:border-teal-500"
                            placeholder="0.00"
                          />
                        )}
                      />
                    </div>
                    {paymentDetailFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 w-10 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md shrink-0 cursor-pointer"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {errors.paymentDetails && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.paymentDetails.message}
                  </p>
                )}

                {/* Total Payment Summary Banner */}
                <div className="flex justify-between items-center px-4 py-2.5 bg-slate-100/90 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-700">
                    Total Payment Amount:
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-700">
                    Rs. {totalPaymentAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Remarks / Notes */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Remarks / Notes
                </Label>
                <Input
                  {...register("remarks")}
                  className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500"
                  placeholder="Optional transaction reference or cashier remarks..."
                />
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 mt-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-5 text-sm font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 px-6 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingPayment ? "Update Payment" : "Save Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Advance Payment Widescreen Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="!max-w-2xl sm:!max-w-2xl w-[95vw] md:w-[600px] max-h-[90vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-emerald-600" />
              Refund Advance Payment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {dialogMessage && (
              <Alert
                variant={
                  dialogMessage.type === "success" ? "default" : "destructive"
                }
                className={
                  dialogMessage.type === "success"
                    ? "border-emerald-500 text-emerald-800 bg-emerald-50"
                    : ""
                }
              >
                {dialogMessage.type === "success" ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <AlertDescription className="text-xs font-semibold">
                  {dialogMessage.text}
                </AlertDescription>
              </Alert>
            )}

            {refundPayment && (
              <>
                {/* Advance Balance Card */}
                <div className="bg-emerald-50/80 border border-emerald-200/90 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                      Available Advance Balance
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-950 mt-1 block">
                      Rs. {Number(refundPayment.advanceBalance).toFixed(2)}
                    </span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-semibold px-3 py-1 text-xs">
                    {refundPayment.patient_name ||
                      refundPayment.patient?.pName ||
                      "Patient"}
                  </Badge>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Refund Amount (Rs.) *
                    </Label>
                    <Input
                      type="number"
                      value={refundAmount}
                      onChange={(e) =>
                        setRefundAmount(Number(e.target.value) || 0)
                      }
                      min={0.01}
                      max={Number(refundPayment.advanceBalance)}
                      step={0.01}
                      className="h-10 text-sm font-mono font-bold border-slate-300 rounded-md focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Refund Method *
                    </Label>
                    <Select value={refundMode} onValueChange={setRefundMode}>
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_MODES.map((mode) => (
                          <SelectItem key={mode} value={mode} className="text-sm">
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold text-slate-700">
                      Remarks / Reason
                    </Label>
                    <Input
                      value={refundRemarks}
                      onChange={(e) => setRefundRemarks(e.target.value)}
                      placeholder="Optional refund reason..."
                      className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Action Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 mt-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-5 text-sm font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
                onClick={() => setIsRefundDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleRefund}
                className="h-10 px-6 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 mr-1.5" /> Confirm Refund
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
