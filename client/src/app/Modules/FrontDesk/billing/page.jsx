"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Loader2, Plus, Save, Printer, X, Trash2, UserPlus, Search, Check, ChevronsUpDown, Wallet } from "lucide-react";
import ShiftSummaryDialog from "@/components/billing/ShiftSummaryDialog";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./invoiceColumns";
import PatientDetailsCard from "@/components/patients/PatientDetailsCard";
import patientService from "@/services/patient.service";
import patientVisitService from "@/services/patientVisitService";
import billingService from "@/services/billing.service";
import billingDetailService from "@/services/billingDetailService";
import patientPaymentService from "@/services/patientPaymentService";
import patientAppointmentService from "@/services/patientAppointmentService";
import { printInvoiceSlip } from "@/app/Modules/Reports/Reception/invoice/page";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import {
  fetchBillingDoctors,
  fetchBillingDepartments,
  fetchBillingServices,
  fetchBillingServiceCharges,
} from "@/reduxToolKit/slices/billingDataSlice";
import { billingFormSchema } from "@/lib/zodeSchema";
import { toLocalISOString } from "@/lib/utils";

export default function BillingPage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { doctors, departments, services, serviceCharges } = useSelector((state) => state.billingData);
  const fromVisit = searchParams.get("fromVisit") === "1";

  const { register, handleSubmit, watch, setValue, getValues, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      regDate: toLocalISOString(new Date()),
      tokenNo: "",
      selectedConsultant: "",
      selectedDepartment: "",
      selectedService: "",
      discountPercent: 0,
      discount: 0,
      paid: 0,
      remarks: "",
      services: [],
    },
  });

  const { fields: serviceFields, append, update, remove, replace } = useFieldArray({
    control,
    name: "services",
    keyName: "fieldId",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [serviceCodeSearch, setServiceCodeSearch] = useState("");
  const [servicePopoverOpen, setServicePopoverOpen] = useState(false);
  const serviceTriggerRef = useRef(null);

  const [mrnSearch, setMrnSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [cnicSearch, setCnicSearch] = useState("");
  const [visitNoSearch, setVisitNoSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [existingVisitId, setExistingVisitId] = useState(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [isMobileSelectDialogOpen, setIsMobileSelectDialogOpen] = useState(false);
  const [cnicSearchResults, setCnicSearchResults] = useState([]);
  const [isCnicSelectDialogOpen, setIsCnicSelectDialogOpen] = useState(false);

  const [existingPaymentId, setExistingPaymentId] = useState(null);
  const [advanceBalance, setAdvanceBalance] = useState(0);
  const [applyAdvance, setApplyAdvance] = useState(false);
  const [advancePaymentId, setAdvancePaymentId] = useState(null);

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [isShiftSummaryOpen, setIsShiftSummaryOpen] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [searchMrn, setSearchMrn] = useState("");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 0, 0);
  const [fromDate, setFromDate] = useState(toLocalISOString(todayStart));
  const [toDate, setToDate] = useState(toLocalISOString(todayEnd));

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const watchedConsultant = watch("selectedConsultant");
  const watchedServices = watch("services");
  const watchedDiscountPercent = watch("discountPercent");
  const watchedDiscount = watch("discount");
  const watchedPaid = watch("paid");

  const totalBill = useMemo(() => {
    return (watchedServices || []).reduce((sum, s) => sum + (Number(s.fee) || 0) * (Number(s.qty) || 0), 0);
  }, [watchedServices]);

  const netAmount = useMemo(() => {
    return totalBill - (Number(watchedDiscount) || 0);
  }, [totalBill, watchedDiscount]);

  const remaining = useMemo(() => {
    return netAmount - (Number(watchedPaid) || 0);
  }, [netAmount, watchedPaid]);

  const getServiceFee = (serviceObj) => {
    if (!serviceObj) return 0;
    const consultant = getValues("selectedConsultant");
    const dept = departments.find((d) => d.id === serviceObj.DepartmentId);
    if (dept && dept.ServingBy === "Doctor" && consultant) {
      const charge = serviceCharges.find(
        (sc) =>
          sc.doctorId === consultant &&
          sc.departmentId === serviceObj.DepartmentId &&
          sc.ServiceId === serviceObj.id
      );
      if (charge) return Number(charge.Charges) || 0;
    }
    return Number(serviceObj.DefaultCharges) || 0;
  };

  const fetchTokenNo = async (serviceList) => {
    const consultant = getValues("selectedConsultant");
    const hasPrintToken = (serviceList || []).some((s) => {
      const svc = services.find((sv) => sv.id === s.serviceId);
      return svc && svc.printToken;
    });
    if (!hasPrintToken || !consultant || consultant === "self" || !selectedPatient) {
      setValue("tokenNo", "");
      return;
    }
    try {
      const today = new Date().toISOString().split("T")[0];
      const existingAppt = await patientAppointmentService.getAll({
        DoctorId: consultant,
        mrn: selectedPatient.mrn,
        date: today,
        status: "Pending",
      });
      if (existingAppt.data && existingAppt.data.length > 0) {
        setValue("tokenNo", String(existingAppt.data[0].TokenNo));
        return;
      }
      const allAppts = await patientAppointmentService.getAll({
        DoctorId: consultant,
        date: today,
      });
      const bookedTokens = (allAppts.data || [])
        .filter((a) => a.Status === "Pending" || a.Status === "Booked")
        .map((a) => Number(a.TokenNo));
      let nextToken = 1;
      for (let i = 1; i <= 200; i++) {
        if (!bookedTokens.includes(i)) { nextToken = i; break; }
      }
      setValue("tokenNo", String(nextToken));
    } catch (error) {
      console.error("Failed to fetch token no:", error);
    }
  };

  const updateTotals = (serviceList, discPctOverride) => {
    const discPct = discPctOverride !== undefined ? discPctOverride : getValues("discountPercent");
    const subtotal = (serviceList || []).reduce((sum, s) => sum + (Number(s.fee) || 0) * (Number(s.qty) || 0), 0);
    const disc = subtotal * (discPct / 100);
    setValue("discount", disc);
    setValue("discountPercent", discPct);
    setValue("paid", subtotal - disc);
  };

  const addService = () => {
    const serviceId = getValues("selectedService");
    if (!serviceId) {
      setMessage({ type: "error", text: "Please select a service" });
      return;
    }
    const currentServices = getValues("services");
    const alreadyExists = currentServices.some((s) => s.serviceId === serviceId);
    if (alreadyExists) {
      setMessage({ type: "error", text: "This service is already added" });
      return;
    }
    const serviceObj = services.find((s) => s.id === serviceId);
    const fee = getServiceFee(serviceObj);
    append({
      id: Date.now(),
      serviceId: serviceObj.id,
      serviceCode: serviceObj?.Code || "",
      serviceName: serviceObj?.ServiceName || "",
      fee,
      qty: 1,
      sharePercent: 0,
      shareAmount: 0,
      flag: "I",
    });
    const updatedServices = [...currentServices, { id: Date.now(), serviceId: serviceObj.id, fee, qty: 1 }];
    if (!getValues("selectedDepartment") && serviceObj) {
      setValue("selectedDepartment", serviceObj.DepartmentId);
    }
    setValue("selectedService", "");
    setServicePopoverOpen(false);
    updateTotals(updatedServices);
    setTimeout(() => serviceTriggerRef.current?.focus(), 0);
  };

  const removeService = (index) => {
    const service = serviceFields[index];
    if (editingInvoice && service && service.flag !== "I") {
      setMessage({ type: "error", text: "Cannot delete existing services in edit mode. Use Return Invoice to remove services." });
      return;
    }
    remove(index);
    const updatedServices = getValues("services").filter((_, i) => i !== index);
    updateTotals(updatedServices);
  };

  const handleServiceCodeSearch = () => {
    if (!serviceCodeSearch.trim()) {
      setMessage({ type: "error", text: "Please enter service code(s)" });
      return;
    }
    const codes = serviceCodeSearch.split(".").map((c) => c.trim()).filter(Boolean);
    const currentServices = getValues("services");
    const newServices = [];
    const notFound = [];
    const duplicates = [];

    for (const code of codes) {
      const serviceObj = services.find((s) => String(s.Code) === code);
      if (serviceObj) {
        const alreadyExists = currentServices.some((s) => s.serviceId === serviceObj.id);
        if (alreadyExists) {
          duplicates.push(code);
          continue;
        }
        const fee = getServiceFee(serviceObj);
        newServices.push({
          id: Date.now() + newServices.length,
          serviceId: serviceObj.id,
          serviceCode: serviceObj.Code,
          serviceName: serviceObj.ServiceName || "",
          fee,
          qty: 1,
          sharePercent: 0,
          shareAmount: 0,
          flag: "I",
        });
      } else {
        notFound.push(code);
      }
    }

    const errors = [];
    if (notFound.length > 0) errors.push(`Not found: ${notFound.join(", ")}`);
    if (duplicates.length > 0) errors.push(`Already added: ${duplicates.join(", ")}`);
    if (errors.length > 0) {
      setMessage({ type: "error", text: errors.join(". ") });
    }
    if (newServices.length > 0) {
      if (!getValues("selectedDepartment") && newServices.length > 0) {
        const firstSvc = services.find((s) => s.id === newServices[0].serviceId);
        if (firstSvc) setValue("selectedDepartment", firstSvc.DepartmentId);
      }
      const updated = [...currentServices, ...newServices];
      replace(updated);
      updateTotals(updated);
    }
    setServiceCodeSearch("");
  };

  const handleMrnSearch = async () => {
    if (!mrnSearch.trim()) {
      setMessage({ type: "error", text: "Please enter MRN" });
      return;
    }
    setLoading(true);
    try {
      const fullMrn = mrnSearch.startsWith("MRN-") ? mrnSearch : "MRN-" + mrnSearch;
      const res = await patientVisitService.getAll({ mrn: fullMrn });

      const now = new Date();
      const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const todayVisit = res.data && res.data.find((v) => {
        const vDateStr = (v.visitDate || v.created_at || "").substring(0, 10);
        return vDateStr === localToday;
      });

      if (todayVisit) {
        setExistingVisitId(todayVisit.id);
        setSelectedPatient(todayVisit.patient);
        setMrnSearch(todayVisit.patient?.mrn?.replace("MRN-", "") || "");
        setVisitNoSearch(todayVisit.visitNo?.replace("V-", "") || "");
        setValue("selectedConsultant", todayVisit.doctorId || "");
        setMessage(null);
      } else {
        setExistingVisitId(null);
        setVisitNoSearch("");
        if (res.data && res.data.length > 0 && res.data[0].patient) {
          setSelectedPatient(res.data[0].patient);
          setMrnSearch(res.data[0].patient?.mrn?.replace("MRN-", "") || "");
        } else {
          try {
            const pRes = await patientService.getAll({ search: fullMrn });
            if (pRes.data && pRes.data.length > 0) {
              setSelectedPatient(pRes.data[0]);
              setMrnSearch(pRes.data[0].mrn?.replace("MRN-", "") || "");
            }
          } catch (pErr) {
            console.error(pErr);
          }
        }
        setMessage({
          type: "error",
          text: "This patient visit is not created today. Please create the visit first.",
        });
      }
      fetchAdvanceBalance(fullMrn);
    } catch {
      setMessage({ type: "error", text: "MRN not found" });
    } finally {
      setLoading(false);
    }
  };

  const handleVisitNoSearch = async () => {
    if (!visitNoSearch.trim()) {
      setMessage({ type: "error", text: "Please enter Visit No" });
      return;
    }
    setLoading(true);
    try {
      const res = await patientVisitService.getByVisitNo("V-" + visitNoSearch);
      if (res.data) {
        setExistingVisitId(res.data.id);
        setSelectedPatient(res.data.patient);
        setMrnSearch(res.data.patient?.mrn?.replace("MRN-", "") || "");
        setValue("selectedConsultant", res.data.doctorId || "");
      }
    } catch {
      setMessage({ type: "error", text: "Visit not found" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetCard = () => {
    setMrnSearch("");
    setMobileSearch("");
    setCnicSearch("");
    setVisitNoSearch("");
    setSelectedPatient(null);
    setExistingVisitId(null);
    setAdvanceBalance(0);
    setApplyAdvance(false);
    setAdvancePaymentId(null);
    setValue("selectedConsultant", "");
  };

  const fetchAdvanceBalance = async (mrn) => {
    if (!mrn) {
      setAdvanceBalance(0);
      setAdvancePaymentId(null);
      return;
    }
    try {
      console.log("Fetching advance balance for MRN:", mrn);
      const res = await patientPaymentService.getAdvanceBalance(mrn);
      console.log("Advance balance response:", res.data);
      setAdvanceBalance(res.data.advanceBalance || 0);
      if (res.data.advanceBalance > 0) {
        const advRes = await patientPaymentService.getAll({ type: "advance" });
        console.log("Advance payments:", advRes.data);
        const advPayment = advRes.data?.find((p) => p.mrn === mrn && Number(p.advanceBalance) > 0);
        setAdvancePaymentId(advPayment?.id || null);
      } else {
        setAdvancePaymentId(null);
      }
    } catch (error) {
      console.error("Failed to fetch advance balance:", error);
      setAdvanceBalance(0);
      setAdvancePaymentId(null);
    }
  };

  const handleMobileSearch = async () => {
    if (!mobileSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a mobile number" });
      return;
    }
    setLoading(true);
    try {
      const res = await patientService.getAll({ mobile: mobileSearch });
      if (res.data.length === 1) {
        setSelectedPatient(res.data[0]);
        setExistingVisitId(null);
      } else if (res.data.length > 1) {
        setMobileSearchResults(res.data);
        setIsMobileSelectDialogOpen(true);
      } else {
        setMessage({ type: "error", text: "No patient found for this mobile number" });
        setIsPatientDialogOpen(true);
      }
    } catch {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMobilePatient = (patient) => {
    setSelectedPatient(patient);
    setExistingVisitId(null);
    setIsMobileSelectDialogOpen(false);
    setMobileSearchResults([]);
  };

  const handleCnicSearch = async () => {
    if (!cnicSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a CNIC number" });
      return;
    }
    setLoading(true);
    try {
      const res = await patientService.getAll({ cnic: cnicSearch });
      if (res.data.length === 1) {
        setSelectedPatient(res.data[0]);
        setExistingVisitId(null);
      } else if (res.data.length > 1) {
        setCnicSearchResults(res.data);
        setIsCnicSelectDialogOpen(true);
      } else {
        setMessage({ type: "error", text: "No patient found for this CNIC" });
        setIsPatientDialogOpen(true);
      }
    } catch {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCnicPatient = (patient) => {
    setSelectedPatient(patient);
    setExistingVisitId(null);
    setIsCnicSelectDialogOpen(false);
    setCnicSearchResults([]);
  };

  const handlePatientAdded = (newPatient) => {
    setSelectedPatient(newPatient);
    setMobileSearch(newPatient.mobile || "");
    setCnicSearch(newPatient.cnic || "");
    setIsPatientDialogOpen(false);
  };

  const handleNew = () => {
    reset({
      regDate: toLocalISOString(new Date()),
      tokenNo: "",
      selectedConsultant: "",
      selectedDepartment: "",
      selectedService: "",
      discountPercent: 0,
      discount: 0,
      paid: 0,
      remarks: "",
      services: [],
    });
    setVisitNoSearch("");
    setMrnSearch("");
    setMobileSearch("");
    setCnicSearch("");
    setSelectedPatient(null);
    setExistingVisitId(null);
    setExistingPaymentId(null);
    setAdvanceBalance(0);
    setApplyAdvance(false);
    setAdvancePaymentId(null);
    setEditingInvoice(null);
    setEditingInvoiceId(null);
  };

  const handleNewInvoice = () => {
    const currentConsultant = getValues("selectedConsultant");
    reset({
      regDate: toLocalISOString(new Date()),
      tokenNo: "",
      selectedConsultant: currentConsultant,
      selectedDepartment: "",
      selectedService: "",
      discountPercent: 0,
      discount: 0,
      paid: 0,
      remarks: "",
      services: [],
    });
    if (!selectedPatient) {
      setExistingVisitId(null);
    }
    setExistingPaymentId(null);
    setAdvanceBalance(0);
    setApplyAdvance(false);
    setAdvancePaymentId(null);
    setEditingInvoice(null);
    setEditingInvoiceId(null);
  };

  const handleEditInvoice = async (invoice) => {
    if (invoice.BillType === "Return") {
      setMessage({ type: "error", text: "Cannot edit a Return invoice" });
      return;
    }
    if (invoice.PaymentStatus === "Cancelled") {
      setMessage({ type: "error", text: "Cannot edit a Cancelled invoice" });
      return;
    }

    handleNew();
    setLoading(true);
    try {
      const detailsRes = await billingDetailService.getAll({ BillingId: invoice.id });
      const details = detailsRes.data || [];

      let payment = null;
      try {
        const payRes = await patientPaymentService.getAll({ invoiceNo: invoice.InvoiceNo });
        payment = payRes.data?.[0] || null;
      } catch {}

      setEditingInvoice(invoice);
      setEditingInvoiceId(invoice.id);
      setExistingVisitId(invoice.visitId);
      setExistingPaymentId(payment?.id || null);
      setSelectedPatient(invoice.patientVisit?.patient || null);
      setMrnSearch(invoice.patientVisit?.patient?.mrn || "");
      setVisitNoSearch(invoice.patientVisit?.visitNo?.replace("V-", "") || "");
      // alert(invoice.patientVisit?.visitNo);
      const loadedServices = details.map((d, idx) => ({
        id: Date.now() + idx,
        billingDetailId: d.Id,
        serviceId: d.serviceId || d.service?.id,
        serviceCode: d.service?.Code || "",
        serviceName: d.service?.ServiceName || "",
        fee: Number(d.Rate) || 0,
        qty: Number(d.Qty) || 1,
        sharePercent: Number(d.SharePercent) || 0,
        shareAmount: Number(d.ShareAmount) || 0,
        flag: "U",
      }));

      reset({
        regDate: invoice.InvoiceDate ? toLocalISOString(new Date(invoice.InvoiceDate)) : "",
        tokenNo: invoice.tokenNo ? String(invoice.tokenNo) : "",
        selectedConsultant: invoice.doctor?.id || "",
        selectedDepartment: invoice.department?.id || "",
        selectedService: "",
        discountPercent: invoice.SubTotal > 0 ? ((invoice.Discount / invoice.SubTotal) * 100) : 0,
        discount: Number(invoice.Discount) || 0,
        paid: payment ? Number(payment.debit) || 0 : 0,
        remarks: invoice.Notes || "",
        services: loadedServices,
      });

      setMessage({ type: "success", text: `Editing invoice: ${invoice.InvoiceNo}` });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load invoice for editing" });
    } finally {
      setLoading(false);
    }
  };

  const searchInvoices = async () => {
    setInvoiceLoading(true);
    try {
      const params = {};
      if (searchMrn.trim()) params.mrn = searchMrn.trim();
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const res = await billingService.getAll(params);
      setInvoices(res.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load invoices" });
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handlePrintSlip = async (invoice) => {
    await printInvoiceSlip(invoice, "thermal", setMessage);
  };

  const handlePrintSlipA4 = async (invoice) => {
    await printInvoiceSlip(invoice, "a4", setMessage);
  };

  const handleReturnInvoice = async (invoice) => {
    router.push(`/Modules/Reports/Reception/return-invoice?invoiceNo=${invoice.InvoiceNo}`);
  };

  const handlePostInvoice = async (invoice) => {
    const targetId = invoice?.id || invoice?.Id;
    if (!targetId || loading) return;
    const isAlreadyPosted = invoice.isPosted === 1 || invoice.isPosted === true || invoice.isPosted === "1" || invoice.isPosted === "true";
    if (isAlreadyPosted) {
      setMessage({ type: "error", text: `Invoice ${invoice.InvoiceNo} is already posted.` });
      return;
    }

    try {
      setLoading(true);
      await billingService.post(targetId);
      setMessage({ type: "success", text: `Invoice ${invoice.InvoiceNo} posted and locked successfully.` });
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === targetId || inv.Id === targetId ? { ...inv, isPosted: 1 } : inv))
      );
      await searchInvoices();
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to post invoice",
      });
    } finally {
      setLoading(false);
    }
  };

  const invoiceColumns = getColumns({
    onPrint: handlePrintSlip,
    onPrintA4: handlePrintSlipA4,
    onEdit: handleEditInvoice,
    onReturn: handleReturnInvoice,
    onPost: handlePostInvoice,
  });

  const onSubmit = async (formData) => {
    if (loading) return;
    if (!selectedPatient) {
      setMessage({ type: "error", text: "Please search and select a patient first" });
      return;
    }
    if (!existingVisitId) {
      setMessage({
        type: "error",
        text: "No Visit No found for this patient. Please search and select a valid Visit No first.",
      });
      return;
    }
    if (formData.services.length === 0) {
      setMessage({ type: "error", text: "Please add at least one service" });
      return;
    }

    const serviceIds = formData.services.map((s) => s.serviceId);
    if (new Set(serviceIds).size !== serviceIds.length) {
      setMessage({
        type: "error",
        text: "Duplicate services detected in this invoice. Each service can only be added once.",
      });
      return;
    }

    setLoading(true);
    try {
      let visitIdToUse = existingVisitId;

      let billingRes;
      if (editingInvoiceId) {
        billingRes = await billingService.update(editingInvoiceId, {
          visitId: visitIdToUse,
          DepartmentId: formData.selectedDepartment || null,
          DoctorId: formData.selectedConsultant || null,
          tokenNo: formData.tokenNo ? Number(formData.tokenNo) : null,
          InvoiceDate: formData.regDate || new Date().toISOString(),
          SubTotal: totalBill,
          Discount: formData.discount,
          TotalAmount: netAmount,
          PaymentStatus: formData.paid >= netAmount ? "Paid" : formData.paid > 0 ? "Partial" : "Pending",
          BillType: "Normal",
          Notes: formData.remarks || null,
        });
      } else {
        billingRes = await billingService.create({
          visitId: visitIdToUse,
          DepartmentId: formData.selectedDepartment || null,
          DoctorId: formData.selectedConsultant || null,
          tokenNo: formData.tokenNo ? Number(formData.tokenNo) : null,
          InvoiceDate: formData.regDate || new Date().toISOString(),
          SubTotal: totalBill,
          Discount: formData.discount,
          TotalAmount: netAmount,
          PaymentStatus: formData.paid >= netAmount ? "Paid" : formData.paid > 0 ? "Partial" : "Pending",
          BillType: "Normal",
          Notes: formData.remarks || null,
        });
      }

      const billingId = billingRes.data.id || billingRes.data.Id;
      const invoiceNo = billingRes.data.InvoiceNo;

      for (const svc of formData.services) {
        if (svc.flag === "U" && svc.billingDetailId) {
          await billingDetailService.update(svc.billingDetailId, {
            serviceId: svc.serviceId,
            Qty: svc.qty,
            Rate: svc.fee,
            Amount: (Number(svc.fee) || 0) * (Number(svc.qty) || 0),
            SharePercent: svc.sharePercent || 0,
            ShareAmount: svc.shareAmount || 0,
          });
        } else if (svc.flag === "I") {
          await billingDetailService.create({
            BillingId: billingId,
            serviceId: svc.serviceId,
            Qty: svc.qty,
            Rate: svc.fee,
            Amount: (Number(svc.fee) || 0) * (Number(svc.qty) || 0),
            SharePercent: svc.sharePercent || 0,
            ShareAmount: svc.shareAmount || 0,
          });
        }
      }

      if (formData.paid > 0) {
        const billingId = billingRes.data?.id || billingRes.data?.Id;
        const paymentPayload = {
          visitId: visitIdToUse,
          mrn: selectedPatient?.mrn || null,
          invoiceNo,
          debit: formData.paid,
          credit: 0,
          payerType: "Patient",
          paymentDetails: [{ paymentMode: "Cash", amount: formData.paid }],
          billingIds: billingId ? [billingId] : [],
          billingAmounts: billingId ? [formData.paid] : [],
          remarks: formData.remarks || null,
        };
        if (existingPaymentId) {
          await patientPaymentService.update(existingPaymentId, paymentPayload);
        } else {
          await patientPaymentService.create(paymentPayload);
        }
      } else if (existingPaymentId) {
        await patientPaymentService.update(existingPaymentId, {
          visitId: visitIdToUse,
          invoiceNo,
          debit: 0,
          credit: 0,
          remarks: formData.remarks || null,
        });
      }

      if (applyAdvance && advancePaymentId && advanceBalance > 0) {
        const applyAmount = Math.min(advanceBalance, netAmount - (formData.paid || 0));
        if (applyAmount > 0) {
          await patientPaymentService.applyAdvance({
            paymentId: advancePaymentId,
            billingId: billingRes.data.id || billingRes.data.Id,
            amount: applyAmount,
          });
        }
      }

      if (formData.tokenNo && formData.selectedConsultant && formData.selectedConsultant !== "self" && selectedPatient) {
        const today = new Date().toISOString().split("T")[0];
        const existingAppt = await patientAppointmentService.getAll({
          DoctorId: formData.selectedConsultant,
          mrn: selectedPatient.mrn,
          date: today,
        });
        if (!existingAppt.data || existingAppt.data.length === 0) {
          await patientAppointmentService.create({
            DoctorId: formData.selectedConsultant,
            mrn: selectedPatient.mrn,
            Appointmentat: new Date().toISOString(),
            TokenNo: Number(formData.tokenNo),
            Status: "Pending",
            CreatedBy: user?.id || 1,
          });
        }
      }

      setMessage({ type: "success", text: `${editingInvoiceId ? "Invoice updated" : "Bill saved"} successfully. Invoice: ${invoiceNo}` });

      // Automatically call thermal print right after saving the invoice
      try {
        const fullInvRes = await billingService.getById(billingId);
        if (fullInvRes?.data) {
          handlePrintSlip(fullInvRes.data);
        }
      } catch (printErr) {
        console.error("Auto thermal print error:", printErr);
      }

      handleNewInvoice();
      searchInvoices();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  // Keyboard Shortcuts Listener (Ctrl + S for Save/Update Invoice)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, onSubmit]);

  useEffect(() => {
    if (doctors.length === 0) dispatch(fetchBillingDoctors());
    if (departments.length === 0) dispatch(fetchBillingDepartments());
    if (services.length === 0) dispatch(fetchBillingServices());
    if (serviceCharges.length === 0) dispatch(fetchBillingServiceCharges());
  }, [dispatch]);

  useEffect(() => {
    const mrn = searchParams.get("mrn");
    const visitId = searchParams.get("visitId");
    const doctorId = searchParams.get("doctorId");
    if (mrn) {
      setMrnSearch(mrn.replace("MRN-", ""));
      const loadFromVisit = async () => {
        setLoading(true);
        try {
          const res = await patientVisitService.getAll({ mrn: mrn });
          if (res.data && res.data.length > 0) {
            const visit = res.data[0];
            setExistingVisitId(visitId || visit.id);
            setSelectedPatient(visit.patient);
            setMrnSearch(visit.patient?.mrn?.replace("MRN-", "") || "");
            setVisitNoSearch(visit.visitNo?.replace("V-", "") || "");
            setValue("selectedConsultant", doctorId || visit.doctorId || "");
            fetchAdvanceBalance(visit.patient?.mrn);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      loadFromVisit();
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTokenNo(watchedServices);
  }, [watchedServices, watchedConsultant, selectedPatient, services]);

  return (
    <div className="space-y-4">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 rounded-xl text-white shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Front Desk Billing & Invoicing
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">Generate patient OPD/IPD invoices, record payments, and manage shift closures</p>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs border-0"
          onClick={() => setIsShiftSummaryOpen(true)}
        >
          <Wallet className="h-3.5 w-3.5 mr-1.5 text-teal-100" />
          Shift Handover Report
        </Button>
      </div>

      <ShiftSummaryDialog open={isShiftSummaryOpen} onOpenChange={setIsShiftSummaryOpen} />

      {message && (
        <div className={`px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs border ${message.type === "success" ? "bg-emerald-50 text-emerald-900 border-emerald-300" : "bg-rose-50 text-rose-900 border-rose-300"}`}>
          {message.type === "success" ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-rose-600" />}
          {message.text}
        </div>
      )}

      {editingInvoice && (
        <div className="px-4 py-2.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-300 flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-5 px-2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">EDITING MODE</span>
            Invoice: <strong className="font-mono">{editingInvoice.InvoiceNo}</strong> | MRN: <span className="font-mono">{editingInvoice.patientVisit?.patient?.mrn}</span>
          </span>
          <Button size="sm" variant="ghost" onClick={handleNew} className="text-amber-900 hover:bg-amber-100 h-7 text-xs">
            <X className="h-3.5 w-3.5 mr-1" /> Cancel Edit
          </Button>
        </div>
      )}

      {/* Patient Details Section */}
      <PatientDetailsCard
        mrnSearch={mrnSearch}
        onMrnSearchChange={setMrnSearch}
        onMrnSearch={handleMrnSearch}
        mobileSearch={mobileSearch}
        onMobileSearchChange={setMobileSearch}
        onMobileSearch={handleMobileSearch}
        cnicSearch={cnicSearch}
        onCnicSearchChange={setCnicSearch}
        onCnicSearch={handleCnicSearch}
        visitNoSearch={visitNoSearch}
        onVisitNoSearchChange={setVisitNoSearch}
        onVisitNoSearch={handleVisitNoSearch}
        selectedPatient={selectedPatient}
        onReset={handleResetCard}
      />

      {/* Three Column Layout: Left (Select Service) | Center (Selected Services) | Right (Bill Details) */}
      <div className="grid grid-cols-12 gap-3 items-start">
        {/* Left Column - Select Service */}
        <Card className="col-span-12 lg:col-span-3 shadow-xs border border-slate-200">
          <CardHeader className="py-2.5 bg-gradient-to-r from-teal-800 to-slate-800 text-white rounded-t-lg">
            <CardTitle className="text-xs font-bold tracking-wide flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-400/20 text-teal-200 text-[10px] font-bold border border-teal-400/30">1</span>
              SELECT SERVICE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 bg-slate-50/40">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Token No</Label>
              <Input
                type="number"
                {...register("tokenNo")}
                className="h-8 text-xs font-mono bg-white border-slate-200 focus:border-teal-500"
                placeholder="Auto"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Consultant Doctor</Label>
              <Controller
                name="selectedConsultant"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("selectedDepartment", "");
                      setValue("selectedService", "");
                    }}
                    disabled={fromVisit || serviceFields.length > 0}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select consultant..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Self / OPD Direct</SelectItem>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Department</Label>
              <Controller
                name="selectedDepartment"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("selectedService", "");
                    }}
                    disabled={serviceFields.length > 0}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Select department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(watchedConsultant === "self"
                        ? departments.filter((d) => d.ServingBy === "Department")
                        : departments
                      ).map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.DepartmentName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Service Code Search</Label>
              <div className="flex gap-1">
                <Input
                  value={serviceCodeSearch}
                  onChange={(e) => setServiceCodeSearch(e.target.value)}
                  className="h-8 text-xs font-mono bg-white border-slate-200"
                  placeholder="e.g. 401.402"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleServiceCodeSearch();
                    }
                  }}
                />
                <Button size="sm" className="h-8 px-2.5 shrink-0 bg-teal-700 hover:bg-teal-800 text-white" onClick={handleServiceCodeSearch} disabled={!serviceCodeSearch.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Select Service Name</Label>
              <div className="flex gap-1">
                <Controller
                  name="selectedService"
                  control={control}
                  render={({ field }) => {
                    const filteredServices = services
                      .filter((s) => !watch("selectedDepartment") || s.DepartmentId === watch("selectedDepartment"));
                    const selectedSvc = filteredServices.find((s) => s.id === field.value);
                    return (
                      <Popover open={servicePopoverOpen} onOpenChange={setServicePopoverOpen} className="flex-1 min-w-0">
                        <PopoverTrigger
                          ref={serviceTriggerRef}
                          nativeButton={false}
                          render={<div />}
                          className="flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none cursor-pointer"
                        >
                          <span className="truncate">{selectedSvc ? selectedSvc.ServiceName : "Select service..."}</span>
                          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50 text-slate-500" />
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search service..." className="h-8 text-xs" />
                            <CommandList>
                              <CommandEmpty>No service found.</CommandEmpty>
                              <CommandGroup>
                                {filteredServices.map((s) => (
                                  <CommandItem
                                    key={s.id}
                                    value={s.ServiceName}
                                    onSelect={() => {
                                      field.onChange(s.id);
                                      setServicePopoverOpen(false);
                                    }}
                                  >
                                    <Check className={`mr-2 h-3 w-3 ${field.value === s.id ? "opacity-100 text-teal-600" : "opacity-0"}`} />
                                    {s.ServiceName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                <Button size="sm" className="h-8 px-2.5 shrink-0 bg-teal-700 hover:bg-teal-800 text-white" onClick={addService} disabled={!watch("selectedService")}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Center Column - Selected Services Table */}
        <Card className="col-span-12 lg:col-span-6 shadow-xs border border-slate-200">
          <CardHeader className="py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-t-lg">
            <CardTitle className="text-xs font-bold tracking-wide flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-600">2</span>
              SELECTED SERVICES
              {serviceFields.length > 0 && (
                <span className="ml-auto inline-flex items-center justify-center h-5 px-2.5 rounded-full bg-slate-700/80 text-teal-300 font-mono text-[11px] font-bold border border-slate-600">
                  {serviceFields.length} Item(s)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto min-h-[260px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100/80 hover:bg-slate-100/80">
                  <TableHead className="text-[11px] h-8 font-bold text-slate-700 w-10">Flag</TableHead>
                  <TableHead className="text-[11px] h-8 font-bold text-slate-700">Code</TableHead>
                  <TableHead className="text-[11px] h-8 font-bold text-slate-700">Service Name</TableHead>
                  <TableHead className="text-[11px] h-8 font-bold text-slate-700">Charges</TableHead>
                  <TableHead className="text-[11px] h-8 font-bold text-slate-700 w-16">Qty</TableHead>
                  <TableHead className="text-[11px] h-8 font-bold text-slate-700">Amount</TableHead>
                  <TableHead className="text-[11px] h-8 font-bold text-slate-700 text-center w-12">Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceFields.length > 0 ? (
                  serviceFields.map((field, index) => (
                    <TableRow key={field.fieldId} className={index % 2 === 0 ? "bg-white hover:bg-teal-50/30" : "bg-slate-50/50 hover:bg-teal-50/30"}>
                      <TableCell className="text-xs py-1.5">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${field.flag === "I" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-sky-100 text-sky-800 border-sky-300"}`}>
                          {field.flag}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs py-1.5 font-mono text-slate-600 font-medium">{field.serviceCode}</TableCell>
                      <TableCell className="text-xs py-1.5 font-medium text-slate-900">{field.serviceName}</TableCell>
                      <TableCell className="text-xs py-1.5 font-mono font-medium text-slate-700">{field.fee}</TableCell>
                      <TableCell className="text-xs py-1.5">
                        <Input
                          type="number"
                          min={1}
                          {...register(`services.${index}.qty`, {
                            valueAsNumber: true,
                            onChange: () => {
                              setTimeout(() => {
                                updateTotals(getValues("services"));
                              }, 0);
                            },
                          })}
                          className="h-6 text-xs w-14 font-mono text-center border-slate-200"
                        />
                      </TableCell>
                      <TableCell className="text-xs py-1.5 font-mono font-bold text-emerald-700">
                        {((Number(field.fee) || 0) * (Number(field.qty) || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs py-1.5 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                          onClick={() => removeService(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-xs text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Plus className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-600">No services added yet</p>
                        <p className="text-[11px] text-slate-400">Select a service on the left or search by service code</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column - Bill Details */}
        <Card className="col-span-12 lg:col-span-3 shadow-xs border border-slate-200">
          <CardHeader className="py-2.5 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-t-lg">
            <CardTitle className="text-xs font-bold tracking-wide flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-bold border border-emerald-400/30">3</span>
              BILL DETAILS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 bg-slate-50/30">
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-slate-700">Date & Time</Label>
              <Input
                type="datetime-local"
                {...register("regDate")}
                className="h-8 text-xs font-mono bg-white border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">SubTotal</Label>
                <Input
                  type="number"
                  value={totalBill}
                  className="h-8 text-xs font-mono font-bold bg-slate-100 text-slate-800 border-slate-200"
                  disabled
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Discount %</Label>
                <Input
                  type="number"
                  value={watchedDiscountPercent}
                  onChange={(e) => {
                    const pct = Number(e.target.value);
                    setValue("discountPercent", pct);
                    const disc = totalBill * (pct / 100);
                    setValue("discount", disc);
                    setValue("paid", totalBill - disc);
                  }}
                  className="h-8 text-xs font-mono bg-white border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Discount Amt</Label>
                <Input
                  type="number"
                  value={watchedDiscount}
                  onChange={(e) => {
                    const disc = Number(e.target.value) || 0;
                    setValue("discount", disc);
                    const pct = totalBill > 0 ? (disc / totalBill) * 100 : 0;
                    setValue("discountPercent", pct);
                    setValue("paid", totalBill - disc);
                  }}
                  className="h-8 text-xs font-mono bg-white border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-emerald-800">Net Total</Label>
                <Input
                  type="number"
                  value={netAmount}
                  className="h-8 text-xs font-mono font-extrabold bg-emerald-50 text-emerald-950 border-2 border-emerald-300"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Paid Amount</Label>
                <Input
                  type="number"
                  {...register("paid", { valueAsNumber: true })}
                  className="h-8 text-xs font-mono font-bold text-emerald-800 bg-white border-slate-200 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-slate-700">Balance</Label>
                <Input
                  type="number"
                  value={remaining}
                  className={`h-8 text-xs font-mono font-extrabold ${remaining > 0 ? "bg-amber-50 text-amber-900 border-amber-300" : "bg-emerald-50 text-emerald-900 border-emerald-300"}`}
                  disabled
                />
              </div>
            </div>

            {advanceBalance > 0 && !editingInvoiceId && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border-2 border-emerald-400 flex flex-col gap-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950">Patient Advance Available</span>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-900 border-emerald-400 font-mono font-bold text-xs">
                    Rs. {advanceBalance.toFixed(2)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyAdvance}
                      onChange={(e) => {
                        const nextState = e.target.checked;
                        setApplyAdvance(nextState);
                        if (nextState) {
                          const maxApplicable = Math.min(advanceBalance, netAmount);
                          setValue("paid", maxApplicable);
                        }
                      }}
                      className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-emerald-900">Use Advance Payment</span>
                  </label>

                  <Button
                    type="button"
                    size="sm"
                    className="h-6 text-[10px] px-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                    onClick={() => {
                      const nextState = !applyAdvance;
                      setApplyAdvance(nextState);
                      if (nextState) {
                        const maxApplicable = Math.min(advanceBalance, netAmount);
                        setValue("paid", maxApplicable);
                      }
                    }}
                  >
                    {applyAdvance ? "Remove" : "One-Click Apply"}
                  </Button>
                </div>

                {applyAdvance && (
                  <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100/80 p-1 rounded text-center font-mono">
                    Applying Rs. {Math.min(advanceBalance, netAmount).toFixed(2)} towards invoice net total
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2 items-center justify-end pt-3 border-t border-slate-200 mt-2">
              <Button variant="outline" size="sm" className="h-8 flex-1 text-xs font-medium border-slate-200" onClick={handleNewInvoice} disabled={loading}>
                <Plus className="h-3.5 w-3.5 mr-1" /> New
              </Button>
              <Button size="sm" className="h-8 flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide shadow-sm" onClick={handleSubmit(onSubmit)} disabled={loading}>
                {loading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                {editingInvoiceId ? "Update Bill (Ctrl+S)" : "Save Invoice (Ctrl+S)"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Patient Select Dialog */}
      <Dialog open={isMobileSelectDialogOpen} onOpenChange={setIsMobileSelectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {mobileSearchResults.length} patients found with this mobile number. Select one:
            </p>
            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {mobileSearchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectMobilePatient(patient)}
                >
                  <div>
                    <p className="font-medium">{patient.pName}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.mrn} | {patient.gender || "N/A"} | {patient.cnic || "No CNIC"}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Select</Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsMobileSelectDialogOpen(false);
                setIsPatientDialogOpen(true);
              }}>
                <UserPlus className="h-4 w-4 mr-1" /> Add New Patient
              </Button>
              <Button variant="outline" onClick={() => setIsMobileSelectDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CNIC Patient Select Dialog */}
      <Dialog open={isCnicSelectDialogOpen} onOpenChange={setIsCnicSelectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {cnicSearchResults.length} patients found with this CNIC. Select one:
            </p>
            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {cnicSearchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                  onClick={() => handleSelectCnicPatient(patient)}
                >
                  <div>
                    <p className="font-medium">{patient.pName}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.mrn} | {patient.gender || "N/A"} | {patient.mobile || "No Mobile"}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Select</Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsCnicSelectDialogOpen(false);
                setIsPatientDialogOpen(true);
              }}>
                <UserPlus className="h-4 w-4 mr-1" /> Add New Patient
              </Button>
              <Button variant="outline" onClick={() => setIsCnicSelectDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddPatientDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
        prefillMobile={mobileSearch}
        prefillCnic={cnicSearch}
      />

      {/* Invoice List Section */}
      <div className="mt-6 space-y-4">
        <Card className="shadow-xs border border-slate-200">
          <CardHeader className="py-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-t-lg">
            <CardTitle className="text-xs font-bold tracking-wide">INVOICE HISTORY & SEARCH</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 space-y-1">
                <Label className="text-xs font-semibold text-slate-700">MRN</Label>
                <Input
                  value={searchMrn}
                  onChange={(e) => setSearchMrn(e.target.value)}
                  className="h-8 text-xs font-mono bg-white border-slate-200"
                  placeholder=""
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs font-semibold text-slate-700">From Date</Label>
                <Input
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-8 text-xs font-mono bg-white border-slate-200"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs font-semibold text-slate-700">To Date</Label>
                <Input
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-8 text-xs font-mono bg-white border-slate-200"
                />
              </div>
              <div className="col-span-2 flex items-end">
                <Button size="sm" className="w-full h-8 text-xs bg-slate-800 hover:bg-slate-900 text-white font-medium" onClick={searchInvoices} disabled={invoiceLoading}>
                  {invoiceLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Search className="h-3.5 w-3.5 mr-1" />}
                  Search
                </Button>
              </div>
            </div>

            <DataTable columns={invoiceColumns} data={invoices} filterColumn="patientName" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
