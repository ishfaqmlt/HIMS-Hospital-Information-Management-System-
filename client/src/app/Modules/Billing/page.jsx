"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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
import { Loader2, Plus, Save, Printer, X, Trash2, UserPlus, Search } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./invoiceColumns";
import PatientDetailsCard from "@/components/patients/PatientDetailsCard";
import patientTypeService from "@/services/patientTypeService";
import patientService from "@/services/patient.service";
import patientVisitService from "@/services/patientVisitService";
import doctorService from "@/services/doctor.service";
import departmentService from "@/services/department.service";
import serviceService from "@/services/serviceService";
import serviceChargeService from "@/services/serviceChargeService";
import billingService from "@/services/billing.service";
import billingDetailService from "@/services/billingDetailService";
import patientPaymentService from "@/services/patientPaymentService";
import { printInvoiceSlip } from "@/app/Modules/Reports/Reception/invoice/page";
import AddPatientDialog from "@/components/patients/AddPatientDialog";

export default function BillingPage() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [patientTypes, setPatientTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceCharges, setServiceCharges] = useState([]);
  const [serviceCodeSearch, setServiceCodeSearch] = useState("");

  const [mrnSearch, setMrnSearch] = useState("");
  const [patientIdSearch, setPatientIdSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [cnicSearch, setCnicSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [existingMrn, setExistingMrn] = useState(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [isMobileSelectDialogOpen, setIsMobileSelectDialogOpen] = useState(false);
  const [cnicSearchResults, setCnicSearchResults] = useState([]);
  const [isCnicSelectDialogOpen, setIsCnicSelectDialogOpen] = useState(false);

  const [patientType, setPatientType] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [regDate, setRegDate] = useState(new Date().toISOString().slice(0, 16));
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [selectedServices, setSelectedServices] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transacId, setTransacId] = useState("");
  const [totalBill, setTotalBill] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [pBalance, setPBalance] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [drShare, setDrShare] = useState(0);

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [searchMrn, setSearchMrn] = useState("");
  const [searchPatientId, setSearchPatientId] = useState("");
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const [fromDate, setFromDate] = useState(todayStart.toISOString().slice(0, 16));
  const [toDate, setToDate] = useState(todayEnd.toISOString().slice(0, 16));

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadPatientTypes = async () => {
    try {
      const res = await patientTypeService.getAll();
      setPatientTypes(res.data);
      if (res.data.length > 0) {
        const generalType = res.data.find((pt) => pt.patientType === "General");
        setPatientType(generalType ? generalType.id : res.data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await doctorService.getAll();
      setDoctors(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadServices = async () => {
    try {
      const res = await serviceService.getAll();
      setServices(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadServiceCharges = async () => {
    try {
      const res = await serviceChargeService.getAll();
      setServiceCharges(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getServiceFee = (serviceObj) => {
    if (!serviceObj) return 0;
    const dept = departments.find((d) => d.id === serviceObj.DepartmentId);
    if (dept && dept.ServingBy === "Doctor" && selectedConsultant) {
      const charge = serviceCharges.find(
        (sc) =>
          sc.doctorId === selectedConsultant &&
          sc.departmentId === serviceObj.DepartmentId &&
          sc.ServiceId === serviceObj.id
      );
      if (charge) return Number(charge.Charges) || 0;
    }
    return Number(serviceObj.DefaultCharges) || 0;
  };

  const handleServiceCodeSearch = () => {
    if (!serviceCodeSearch.trim()) {
      setMessage({ type: "error", text: "Please enter service code(s)" });
      return;
    }
    const codes = serviceCodeSearch.split(".").map((c) => c.trim()).filter(Boolean);
    const newServices = [];
    const notFound = [];
    const duplicates = [];

    for (const code of codes) {
      const serviceObj = services.find((s) => String(s.Code) === code);
      if (serviceObj) {
        const alreadyExists = selectedServices.some((s) => s.serviceId === serviceObj.id);
        if (alreadyExists) {
          duplicates.push(code);
          continue;
        }
        const fee = getServiceFee(serviceObj);
        newServices.push({
          id: selectedServices.length + newServices.length + 1,
          serviceId: serviceObj.id,
          serviceCode: serviceObj.Code,
          serviceName: serviceObj.ServiceName || "",
          fee,
          qty: 1,
          totalAmount: fee,
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
      const updated = [...selectedServices, ...newServices];
      setSelectedServices(updated);
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
      const res = await patientVisitService.getByMrn("mrn-" + mrnSearch);
      if (res.data) {
        setExistingMrn(res.data.mrn);
        setSelectedPatient(res.data.patient);
        setPatientIdSearch(res.data.patientId);
        setPatientType(res.data.patientTypeId || "");
        setSelectedConsultant(res.data.doctorId || "");
      }
    } catch {
      setMessage({ type: "error", text: "MRN not found" });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientIdSearch = async () => {
    if (!patientIdSearch.trim()) {
      setMessage({ type: "error", text: "Please enter Patient ID" });
      return;
    }
    setLoading(true);
    try {
      const res = await patientService.getAll({ patientId: "pid-" + patientIdSearch });
      if (res.data.length > 0) {
        setSelectedPatient(res.data[0]);
        setExistingMrn(null);
      } else {
        setMessage({ type: "error", text: "Patient not found" });
      }
    } catch {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
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
        setExistingMrn(null);
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
    setExistingMrn(null);
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
        setExistingMrn(null);
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
    setExistingMrn(null);
    setIsCnicSelectDialogOpen(false);
    setCnicSearchResults([]);
  };

  const handlePatientAdded = (newPatient) => {
    setSelectedPatient(newPatient);
    setMobileSearch(newPatient.mobile || "");
    setCnicSearch(newPatient.cnic || "");
    setIsPatientDialogOpen(false);
  };

  const addService = () => {
    if (!selectedService) {
      setMessage({ type: "error", text: "Please select a service" });
      return;
    }
    const alreadyExists = selectedServices.some((s) => s.serviceId === selectedService);
    if (alreadyExists) {
      setMessage({ type: "error", text: "This service is already added" });
      return;
    }
    const serviceObj = services.find((s) => s.id === selectedService);
    const fee = getServiceFee(serviceObj);
    const newService = {
      id: selectedServices.length + 1,
      serviceId: selectedService,
      serviceCode: serviceObj?.Code || "",
      serviceName: serviceObj?.ServiceName || "",
      fee,
      qty: 1,
      totalAmount: fee,
      sharePercent: 0,
      shareAmount: 0,
      flag: "I",
    };
    setSelectedServices([...selectedServices, newService]);
    setSelectedService("");
    updateTotals([...selectedServices, newService]);
  };

  const removeService = (id) => {
    const service = selectedServices.find((s) => s.id === id);
    if (editingInvoice && service && service.flag !== "I") {
      setMessage({ type: "error", text: "Cannot delete existing services in edit mode. Use Return Invoice to remove services." });
      return;
    }
    const updated = selectedServices.filter((s) => s.id !== id);
    setSelectedServices(updated);
    updateTotals(updated);
  };

  const updateServiceQty = (id, qty) => {
    const updated = selectedServices.map((s) =>
      s.id === id ? { ...s, qty: Number(qty) || 0, totalAmount: (Number(s.fee) || 0) * (Number(qty) || 0) } : s
    );
    setSelectedServices(updated);
    updateTotals(updated);
  };

  const updateServiceFee = (id, fee) => {
    const updated = selectedServices.map((s) =>
      s.id === id ? { ...s, fee: Number(fee) || 0, totalAmount: (Number(fee) || 0) * (Number(s.qty) || 0) } : s
    );
    setSelectedServices(updated);
    updateTotals(updated);
  };

  const updateTotals = (serviceList) => {
    const subtotal = serviceList.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    setTotalBill(subtotal);
    const disc = subtotal * (discountPercent / 100);
    setDiscount(disc);
    setNetAmount(subtotal - disc);
  };

  const handleNew = () => {
    setMrnSearch("");
    setPatientIdSearch("");
    setMobileSearch("");
    setCnicSearch("");
    setSelectedPatient(null);
    setExistingMrn(null);
    const generalType = patientTypes.find((pt) => pt.patientType === "General");
    setPatientType(generalType ? generalType.id : (patientTypes.length > 0 ? patientTypes[0].id : ""));
    setVoucherNo("");
    setRegDate(new Date().toISOString().slice(0, 16));
    setSelectedConsultant("");
    setSelectedDepartment("");
    setSelectedService("");
    setSelectedServices([]);
    setPaymentMethod("Cash");
    setTransacId("");
    setTotalBill(0);
    setDiscountPercent(0);
    setDiscount(0);
    setNetAmount(0);
    setPaid(0);
    setRemaining(0);
    setPBalance(0);
    setRemarks("");
    setDrShare(0);
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
      setEditingInvoiceId(invoice.Id);
      setExistingMrn(invoice.mrn);
      setSelectedPatient(invoice.patientVisit?.patient || null);
      setMrnSearch(invoice.mrn || "");
      setPatientType(invoice.patientType?.id || "");
      setSelectedConsultant(invoice.doctor?.id || "");
      setSelectedDepartment(invoice.department?.id || "");
      setRegDate(invoice.InvoiceDate ? new Date(invoice.InvoiceDate).toISOString().slice(0, 16) : "");
      setDiscountPercent(invoice.SubTotal > 0 ? ((invoice.Discount / invoice.SubTotal) * 100) : 0);
      setDiscount(Number(invoice.Discount) || 0);
      setPaid(payment ? Number(payment.debit) || 0 : 0);

      const loadedServices = details.map((d, idx) => ({
        id: idx + 1,
        billingDetailId: d.Id,
        serviceId: d.serviceId || d.service?.id,
        serviceCode: d.service?.Code || "",
        serviceName: d.service?.ServiceName || "",
        fee: Number(d.Rate) || 0,
        qty: Number(d.Qty) || 1,
        totalAmount: Number(d.Amount) || 0,
        sharePercent: Number(d.SharePercent) || 0,
        shareAmount: Number(d.ShareAmount) || 0,
        flag: "U",
      }));

      setSelectedServices(loadedServices);

      const subtotal = loadedServices.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
      setTotalBill(subtotal);
      const disc = Number(invoice.Discount) || 0;
      setNetAmount(subtotal - disc);
      setRemaining((subtotal - disc) - (payment ? Number(payment.debit) || 0 : 0));

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
      if (searchPatientId.trim()) params.patientId = searchPatientId.trim();
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
    router.push(`/Modules/Reports/Reception/return-invoice?invoiceNo=${invoice.InvoiceNo}&mrn=${invoice.mrn}`);
  };

  const invoiceColumns = getColumns({
    onPrint: handlePrintSlip,
    onPrintA4: handlePrintSlipA4,
    onEdit: handleEditInvoice,
    onReturn: handleReturnInvoice,
  });

  const handleSave = async () => {
    if (!selectedPatient) {
      setMessage({ type: "error", text: "Please search and select a patient first" });
      return;
    }
    if (selectedServices.length === 0) {
      setMessage({ type: "error", text: "Please add at least one service" });
      return;
    }

    setLoading(true);
    try {
      let mrnToUse = existingMrn;

      if (!mrnToUse) {
        const visitRes = await patientVisitService.create({
          patientId: selectedPatient.patientId,
          patientTypeId: patientType,
          InsuranceCompanyId: null,
          doctorId: selectedConsultant || null,
          UserId: user?.id || 1,
        });
        mrnToUse = visitRes.data.mrn;
        setExistingMrn(mrnToUse);
      }

      let billingRes;
      if (editingInvoiceId) {
        billingRes = await billingService.update(editingInvoiceId, {
          mrn: mrnToUse,
          patientTypeId: patientType,
          InsuranceCompanyId: null,
          DepartmentId: selectedDepartment || null,
          DoctorId: selectedConsultant || null,
          InvoiceDate: regDate || new Date().toISOString(),
          SubTotal: totalBill,
          Discount: discount,
          TotalAmount: netAmount,
          PaymentStatus: paid >= netAmount ? "Paid" : paid > 0 ? "Partial" : "Pending",
          BillType: "Normal",
          Notes: remarks || null,
        });
      } else {
        billingRes = await billingService.create({
          mrn: mrnToUse,
          patientTypeId: patientType,
          InsuranceCompanyId: null,
          DepartmentId: selectedDepartment || null,
          DoctorId: selectedConsultant || null,
          InvoiceDate: regDate || new Date().toISOString(),
          SubTotal: totalBill,
          Discount: discount,
          TotalAmount: netAmount,
          PaymentStatus: paid >= netAmount ? "Paid" : paid > 0 ? "Partial" : "Pending",
          BillType: "Normal",
          Notes: remarks || null,
        });
      }

      const invoiceNo = billingRes.data.InvoiceNo;

      for (const svc of selectedServices) {
        if (svc.flag === "U" && svc.billingDetailId) {
          await billingDetailService.update(svc.billingDetailId, {
            serviceId: svc.serviceId,
            Qty: svc.qty,
            Rate: svc.fee,
            Amount: svc.totalAmount,
            SharePercent: svc.sharePercent || 0,
            ShareAmount: svc.shareAmount || 0,
          });
        } else if (svc.flag === "I") {
          await billingDetailService.create({
            invoiceNo,
            serviceId: svc.serviceId,
            Qty: svc.qty,
            Rate: svc.fee,
            Amount: svc.totalAmount,
            SharePercent: svc.sharePercent || 0,
            ShareAmount: svc.shareAmount || 0,
          });
        }
      }

      if (paid > 0) {
        await patientPaymentService.create({
          mrn: mrnToUse,
          invoiceNo,
          debit: paid,
          credit: 0,
          remarks: remarks || null,
        });
      }

      setMessage({ type: "success", text: `${editingInvoiceId ? "Invoice updated" : "Bill saved"} successfully. Invoice: ${invoiceNo}, MRN: ${mrnToUse}` });
      handleNew();
      searchInvoices();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        loadPatientTypes(),
        loadDoctors(),
        loadDepartments(),
        loadServices(),
        loadServiceCharges(),
      ]);
    };
    init();
  }, []);

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {editingInvoice && (
        <div className="p-3 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-between">
          <span>Editing Invoice: <strong>{editingInvoice.InvoiceNo}</strong> | MRN: {editingInvoice.mrn}</span>
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
        patientIdSearch={patientIdSearch}
        onPatientIdSearchChange={setPatientIdSearch}
        onPatientIdSearch={handlePatientIdSearch}
        mobileSearch={mobileSearch}
        onMobileSearchChange={setMobileSearch}
        onMobileSearch={handleMobileSearch}
        cnicSearch={cnicSearch}
        onCnicSearchChange={setCnicSearch}
        onCnicSearch={handleCnicSearch}
        selectedPatient={selectedPatient}
        patientType={patientType}
        onPatientTypeChange={setPatientType}
        patientTypes={patientTypes}
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
                <Label className="text-xs">Consultant</Label>
                <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Department</Label>
                <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setSelectedService(""); }} disabled={selectedServices.length > 0}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.DepartmentName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-3 space-y-1">
                <Label className="text-xs">Search by Service Code</Label>
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
                <Button size="sm" variant="secondary" className="w-full" onClick={handleServiceCodeSearch} disabled={!serviceCodeSearch.trim()}>
                  <Plus className="h-3 w-3 mr-1" /> Add by Code
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {services
                      .filter((s) => !selectedDepartment || s.DepartmentId === selectedDepartment)
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.ServiceName}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button size="sm" className="w-full" onClick={addService} disabled={!selectedService}>
                <Plus className="h-3 w-3 mr-1" /> Add Service
              </Button>

              
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={handleNew} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" /> New 
            </Button>
            <Button className="w-full" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {editingInvoiceId ? "Update (Ctrl+S)" : "Save (Ctrl+S)"}
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
                    <TableHead className="text-xs h-7">Charges</TableHead>
                    <TableHead className="text-xs h-7">Qty</TableHead>
                    <TableHead className="text-xs h-7">Amount</TableHead>
                    <TableHead className="text-xs h-7">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedServices.length > 0 ? (
                    selectedServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="text-xs py-1 font-bold">{service.flag}</TableCell>
                        <TableCell className="text-xs py-1">{service.serviceCode}</TableCell>
                        <TableCell className="text-xs py-1">{service.serviceName}</TableCell>
                        <TableCell className="text-xs py-1">
                          <Input
                            type="number"
                            value={service.fee}
                            onChange={(e) => updateServiceFee(service.id, Number(e.target.value))}
                            className="h-6 text-xs w-20"
                          />
                        </TableCell>
                        <TableCell className="text-xs py-1">
                          <Input
                            type="number"
                            min={1}
                            value={service.qty}
                            onChange={(e) => updateServiceQty(service.id, Number(e.target.value))}
                            className="h-6 text-xs w-14"
                          />
                        </TableCell>
                        <TableCell className="text-xs py-1 font-medium">{service.totalAmount}</TableCell>
                        <TableCell className="text-xs py-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-destructive"
                            onClick={() => removeService(service.id)}
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
                <Label className="text-xs">Invoice No</Label>
                <Input
                  value={voucherNo || "Auto-generated"}
                  className="h-8 text-xs bg-muted"
                  disabled
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Date</Label>
                <Input
                  type="datetime-local"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
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
                  value={discountPercent}
                  onChange={(e) => {
                    const pct = Number(e.target.value);
                    setDiscountPercent(pct);
                    const disc = totalBill * (pct / 100);
                    setDiscount(disc);
                    setNetAmount(totalBill - disc);
                  }}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Discount</Label>
                <Input
                  type="number"
                  value={discount}
                  className="h-8 text-xs bg-muted"
                  disabled
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
                  value={paid}
                  onChange={(e) => {
                    const p = Number(e.target.value);
                    setPaid(p);
                    setRemaining(netAmount - p);
                  }}
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
                      {patient.patientId} | {patient.gender || "N/A"} | {patient.cnic || "No CNIC"}
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
                      {patient.patientId} | {patient.gender || "N/A"} | {patient.mobile || "No Mobile"}
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
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">MRN</Label>
                <Input
                  value={searchMrn}
                  onChange={(e) => setSearchMrn(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="Search MRN"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Patient ID</Label>
                <Input
                  value={searchPatientId}
                  onChange={(e) => setSearchPatientId(e.target.value)}
                  className="h-8 text-xs"
                  placeholder="Search Patient ID"
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

            <DataTable columns={invoiceColumns} data={invoices} filterColumn="InvoiceNo" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
