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
import { Loader2, Plus, Save, Printer, X, Trash2, UserPlus, Search, Check, ChevronsUpDown } from "lucide-react";
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
  fetchBillingPatientTypes,
} from "@/reduxToolKit/slices/billingDataSlice";
import { billingFormSchema } from "@/lib/zodeSchema";

export default function BillingPage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { doctors, departments, services, serviceCharges, patientTypes } = useSelector((state) => state.billingData);
  const fromVisit = searchParams.get("fromVisit") === "1";

  const toLocalISOString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${h}:${min}`;
  };

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

  const [patientType, setPatientType] = useState("");
  const [existingPaymentId, setExistingPaymentId] = useState(null);

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

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

  const effectivePatientType = patientType || patientTypes.find((pt) => pt.patientType === "General")?.id || patientTypes[0]?.id || "";

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
      const res = await patientVisitService.getAll({ mrn: "MRN-" + mrnSearch, today: true });
      if (res.data && res.data.length > 0) {
        const visit = res.data[0];
        setExistingVisitId(visit.id);
        setSelectedPatient(visit.patient);
        setMrnSearch(visit.patient?.mrn?.replace("MRN-", "") || "");
        setVisitNoSearch(visit.visitNo?.replace("V-", "") || "");
        setPatientType(visit.patientTypeId || "");
        setValue("selectedConsultant", visit.doctorId || "");
      } else {
        setMessage({ type: "error", text: "No visit found today for this MRN" });
      }
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
        setPatientType(res.data.patientTypeId || "");
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
    setPatientType("");
    setValue("selectedConsultant", "");
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
    const generalType = patientTypes.find((pt) => pt.patientType === "General");
    setPatientType(generalType ? generalType.id : (patientTypes.length > 0 ? patientTypes[0].id : ""));
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
      const detailsRes = await billingDetailService.getAll({ invoiceNo: invoice.InvoiceNo });
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
      setPatientType(invoice.patientType?.id || "");

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

  const invoiceColumns = getColumns({
    onPrint: handlePrintSlip,
    onPrintA4: handlePrintSlipA4,
    onEdit: handleEditInvoice,
    onReturn: handleReturnInvoice,
  });

  const onSubmit = async (formData) => {
    if (!selectedPatient) {
      setMessage({ type: "error", text: "Please search and select a patient first" });
      return;
    }
    if (formData.services.length === 0) {
      setMessage({ type: "error", text: "Please add at least one service" });
      return;
    }

    setLoading(true);
    try {
      let visitIdToUse = existingVisitId;

      if (!visitIdToUse) {
        const visitRes = await patientVisitService.create({
          patientId: selectedPatient.id,
          patientTypeId: effectivePatientType,
          insuranceCompanyId: null,
          doctorId: formData.selectedConsultant || null,
          userId: user?.id || 1,
          visitDate: formData.regDate || new Date().toISOString(),
          status: "In Progress",
        });
        visitIdToUse = visitRes.data.id;
        setExistingVisitId(visitIdToUse);
      }

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
            invoiceNo,
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
        const paymentPayload = {
          visitId: visitIdToUse,
          invoiceNo,
          debit: formData.paid,
          credit: 0,
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
      handleNew();
      searchInvoices();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctors.length === 0) dispatch(fetchBillingDoctors());
    if (departments.length === 0) dispatch(fetchBillingDepartments());
    if (services.length === 0) dispatch(fetchBillingServices());
    if (serviceCharges.length === 0) dispatch(fetchBillingServiceCharges());
    if (patientTypes.length === 0) dispatch(fetchBillingPatientTypes());
  }, [dispatch]);

  useEffect(() => {
    const mrn = searchParams.get("mrn");
    const visitId = searchParams.get("visitId");
    const doctorId = searchParams.get("doctorId");
    const patientTypeId = searchParams.get("patientTypeId");
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
            setPatientType(patientTypeId || visit.patientTypeId || "");
            setValue("selectedConsultant", doctorId || visit.doctorId || "");
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
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {editingInvoice && (
        <div className="p-3 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-between">
          <span>Editing Invoice: <strong>{editingInvoice.InvoiceNo}</strong> | MRN: {editingInvoice.patientVisit?.patient?.mrn}</span>
          <Button size="sm" variant="outline" onClick={handleNew}>
            <X className="h-4 w-4 mr-1" /> Cancel Edit
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
        patientType={effectivePatientType}
        onPatientTypeChange={setPatientType}
        patientTypes={patientTypes}
        onReset={handleResetCard}
      />

      {/* Three Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Service Selection + Actions */}
        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader className="py-2 bg-primary text-primary-foreground">
              <CardTitle className="text-sm font-semibold">Select Service</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Token No</Label>
                <Input
                  type="number"
                  {...register("tokenNo")}
                  className="h-8 text-xs"
                  placeholder="Auto-filled when printToken service added"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Consultant</Label>
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
                      disabled={fromVisit}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
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
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select" />
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
              <div className="border-t pt-3 space-y-1">
                <Label className="text-xs">Search by Service Code</Label>
                <div className="flex gap-2">
                  <Input
                    value={serviceCodeSearch}
                    onChange={(e) => setServiceCodeSearch(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="e.g. 401.402.403"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleServiceCodeSearch();
                      }
                    }}
                  />
                  <Button size="sm" onClick={handleServiceCodeSearch} disabled={!serviceCodeSearch.trim()}>
                    <Plus className="h-4 w-3 mr-1" /> Add
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Service</Label>
                <div className="flex gap-2">
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
                            className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          >
                            {selectedSvc ? selectedSvc.ServiceName : "Select service..."}
                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Search service..." className="h-8" />
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
                                      <Check className={`mr-2 h-3 w-3 ${field.value === s.id ? "opacity-100" : "opacity-0"}`} />
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
                  <Button size="sm" onClick={addService} disabled={!watch("selectedService")}>
                    <Plus className="h-4 w-3 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={handleNew} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" /> New
            </Button>
            <Button className="w-full" onClick={handleSubmit(onSubmit)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {editingInvoiceId ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        {/* Center Column - Selected Services Table */}
        <div className="col-span-6">
          <Card className="h-full">
            <CardHeader className="py-2 bg-primary text-primary-foreground">
              <CardTitle className="text-sm font-semibold">Selected Services</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs h-7">Flag</TableHead>
                    <TableHead className="text-xs h-7">Code</TableHead>
                    <TableHead className="text-xs h-7">Service Name</TableHead>
                    <TableHead className="text-xs h-7" >Charges</TableHead>
                    <TableHead className="text-xs h-7">Qty</TableHead>
                    <TableHead className="text-xs h-7">Amount</TableHead>
                    <TableHead className="text-xs h-7">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceFields.length > 0 ? (
                    serviceFields.map((field, index) => (
                      <TableRow key={field.fieldId}>
                        <TableCell className="text-xs py-1 font-bold">{field.flag}</TableCell>
                        <TableCell className="text-xs py-1">{field.serviceCode}</TableCell>
                        <TableCell className="text-xs py-1">{field.serviceName}</TableCell>
                        <TableCell className="text-xs py-1">{field.fee}</TableCell>
                        <TableCell className="text-xs py-1">
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
                            className="h-6 text-xs w-14"
                          />
                        </TableCell>
                        <TableCell className="text-xs py-1 font-medium">
                          {(Number(field.fee) || 0) * (Number(field.qty) || 0)}
                        </TableCell>
                        <TableCell className="text-xs py-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-destructive"
                            onClick={() => removeService(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-xs text-muted-foreground py-8">
                        No services added yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bill Details */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="py-2 bg-primary text-primary-foreground">
              <CardTitle className="text-sm font-semibold">Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="datetime-local"
                  {...register("regDate")}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">SubTotal</Label>
                <Input
                  type="number"
                  value={totalBill}
                  className="h-8 text-xs bg-muted"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Discount %</Label>
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
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Discount</Label>
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
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">TotalAmount</Label>
                <Input
                  type="number"
                  value={netAmount}
                  className="h-8 text-xs bg-muted"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Paid</Label>
                <Input
                  type="number"
                  {...register("paid", { valueAsNumber: true })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Patient Balance</Label>
                <Input
                  type="number"
                  value={remaining}
                  className="h-8 text-xs bg-muted"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Remarks</Label>
                <Input
                  {...register("remarks")}
                  className="h-8 text-xs"
                  placeholder="Optional remarks"
                />
              </div>
            </CardContent>
          </Card>
        </div>
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
        <Card>
          <CardHeader className="py-2 bg-primary text-primary-foreground">
            <CardTitle className="text-sm font-semibold">Invoice List</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">MRN</Label>
                <Input
                  value={searchMrn}
                  onChange={(e) => setSearchMrn(e.target.value)}
                  className="h-8 text-xs"
                  placeholder=""
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">From Date</Label>
                <Input
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">To Date</Label>
                <Input
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-2 flex items-end">
                <Button size="sm" className="w-full" onClick={searchInvoices} disabled={invoiceLoading}>
                  {invoiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
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
