"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Save,
  Trash2,
  Check,
  RotateCcw,
  FlaskConical,
  UserPlus,
  RefreshCw,
  Pencil,
  X,
  EllipsisVertical,
  Printer,
  FileText,
  User,
} from "lucide-react";
import { labCaseSchema } from "@/lib/zodeSchema";
import patientVisitService from "@/services/patientVisitService";
import doctorService from "@/services/doctor.service";
import labCaseService from "@/services/labCase.service";
import masterTestService from "@/services/masterTests.service";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import LabBarcode from "@/components/lab/LabBarcode";
import { useReactToPrint } from "react-to-print";
import { toLocalISOString, calculateAge, formatDate } from "@/lib/utils";

export default function PatientRegistrationPage() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);

  const [mrnSearch, setMrnSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [cnicSearch, setCnicSearch] = useState("");
  const [visitNoSearch, setVisitNoSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [existingVisitId, setExistingVisitId] = useState(null);

  const [doctors, setDoctors] = useState([]);

  // Waiting Invoices
  const [waitingInvoices, setWaitingInvoices] = useState([]);
  const [waitingLoading, setWaitingLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [waitingSearch, setWaitingSearch] = useState("");

  const [todayCases, setTodayCases] = useState([]);
  const [todayCasesLoading, setTodayCasesLoading] = useState(false);
  const [caseStatusFilter, setCaseStatusFilter] = useState("All");
  const [editingCase, setEditingCase] = useState(null);
  const [testSearch, setTestSearch] = useState("");
  const [testSearchResults, setTestSearchResults] = useState([]);
  const [testSearchLoading, setTestSearchLoading] = useState(false);

  const filteredTodayCases = React.useMemo(() => {
    if (caseStatusFilter === "All") return todayCases;
    if (caseStatusFilter === "Reported") {
      return todayCases.filter(
        (c) => c.status === "Reported" || c.status === "Approved"
      );
    }
    return todayCases.filter((c) => c.status === caseStatusFilter);
  }, [todayCases, caseStatusFilter]);

  // Barcode print dialog state
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [barcodeCase, setBarcodeCase] = useState(null);
  const barcodePrintRef = useRef(null);

  // Lab copy print dialog state
  const [labCopyDialogOpen, setLabCopyDialogOpen] = useState(false);
  const [labCopyCase, setLabCopyCase] = useState(null);
  const labCopyPrintRef = useRef(null);

  const handleOpenBarcode = (c) => {
    setBarcodeCase(c);
    setBarcodeDialogOpen(true);
  };

  const handlePrintBarcode = useReactToPrint({
    contentRef: barcodePrintRef,
    documentTitle: `Barcode-${barcodeCase?.caseNo || ""}`,
    onAfterPrint: () => setBarcodeDialogOpen(false),
  });

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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(labCaseSchema),
    defaultValues: {
      visitId: "",
      billingId: "",
      caseDate: toLocalISOString(new Date()),
      analyzerReffno: "",
      insuranceCompanyId: "",
      doctorId: "",
      orReffBy: "",
      priority: "Normal",
      remarks: "",
      selectedTests: [],
    },
  });

  const selectedTests = watch("selectedTests");
  const selectedDoctorId = watch("doctorId");
  const isConsultantSelected = Boolean(selectedDoctorId && selectedDoctorId !== "none");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await doctorService.getAll();
        setDoctors(docRes.data?.data || docRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
    fetchWaitingInvoices();
    fetchTodayCases();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchTodayCases = async () => {
    setTodayCasesLoading(true);
    try {
      const res = await labCaseService.getAll({ today: 1 });
      setTodayCases(res.data || []);
    } catch (error) {
      console.error("Failed to fetch today's cases:", error);
    } finally {
      setTodayCasesLoading(false);
    }
  };

  const fetchWaitingInvoices = async (search = "") => {
    setWaitingLoading(true);
    try {
      const params = search ? { search } : {};
      const res = await labCaseService.getWaitingInvoices(params);
      setWaitingInvoices(res.data || []);
    } catch (error) {
      console.error("Failed to fetch waiting invoices:", error);
    } finally {
      setWaitingLoading(false);
    }
  };

  const handleSelectWaitingInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setSelectedPatient(invoice.patient);
    setMrnSearch(invoice.patient?.mrn?.replace("MRN-", "") || "");
    setVisitNoSearch(invoice.visitNo?.replace("V-", "") || "");
    setValue("visitId", invoice.visitId || "");
    setValue("doctorId", invoice.doctorId || "");

    const mappedTests = (invoice.tests || []).map((t) => ({
      id: t.serviceId,
      serviceId: t.serviceId,
      testName: t.serviceName,
      testCode: t.serviceCode,
      rate: parseFloat(t.rate) || 0,
      flag: "I",
      checked: true,
    }));
    setValue("selectedTests", mappedTests);
  };

  const handleSearchByMRN = async () => {
    if (!mrnSearch.trim()) {
      setMessage({ type: "error", text: "Please enter MRN" });
      return;
    }
    setLoading(true);
    try {
      const fullMrn = mrnSearch.startsWith("MRN-") ? mrnSearch : "MRN-" + mrnSearch;
      const res = await patientVisitService.getAll({ mrn: fullMrn });
      if (res.data && res.data.length > 0) {
        const visit = res.data[0];
        setExistingVisitId(visit.id);
        setSelectedPatient(visit.patient);
        setMrnSearch(visit.patient?.mrn?.replace("MRN-", "") || "");
        setVisitNoSearch(visit.visitNo?.replace("V-", "") || "");
        setValue("visitId", visit.id);
        setValue("doctorId", visit.doctorId || "");
      } else {
        setShowAddPatient(true);
      }
    } catch {
      setShowAddPatient(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByVisitNo = async () => {
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
        setValue("visitId", res.data.id);
        setValue("doctorId", res.data.doctorId || "");
      } else {
        setMessage({ type: "error", text: "Visit not found" });
      }
    } catch {
      setMessage({ type: "error", text: "Visit not found" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByCNIC = async () => {
    if (!cnicSearch.trim()) return;
    setLoading(true);
    try {
      const res = await patientVisitService.getAll({ cnic: cnicSearch });
      if (res.data && res.data.length > 0) {
        const visit = res.data[0];
        setExistingVisitId(visit.id);
        setSelectedPatient(visit.patient);
        setMrnSearch(visit.patient?.mrn?.replace("MRN-", "") || "");
        setVisitNoSearch(visit.visitNo?.replace("V-", "") || "");
        setValue("visitId", visit.id);
        setValue("doctorId", visit.doctorId || "");
      } else {
        setShowAddPatient(true);
      }
    } catch {
      setShowAddPatient(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByMobile = async () => {
    if (!mobileSearch.trim()) return;
    setLoading(true);
    try {
      const res = await patientVisitService.getAll({ mobile: mobileSearch });
      if (res.data && res.data.length > 0) {
        const visit = res.data[0];
        setExistingVisitId(visit.id);
        setSelectedPatient(visit.patient);
        setMrnSearch(visit.patient?.mrn?.replace("MRN-", "") || "");
        setVisitNoSearch(visit.visitNo?.replace("V-", "") || "");
        setValue("visitId", visit.id);
        setValue("doctorId", visit.doctorId || "");
      } else {
        setShowAddPatient(true);
      }
    } catch {
      setShowAddPatient(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEditingCase(null);
    setSelectedInvoice(null);
    setSelectedPatient(null);
    setMrnSearch("");
    setMobileSearch("");
    setCnicSearch("");
    setVisitNoSearch("");
    setExistingVisitId(null);
    reset({
      visitId: "",
      billingId: "",
      caseDate: toLocalISOString(new Date()),
      analyzerReffno: "",
      insuranceCompanyId: "",
      doctorId: "",
      orReffBy: "",
      priority: "Normal",
      remarks: "",
      selectedTests: [],
    });
  };

  const removeTest = (testIdx) => {
    const updated = (selectedTests || []).map((t, i) => {
      if (i !== testIdx) return t;
      return { ...t, checked: false };
    });
    setValue("selectedTests", updated);
  };

  const toggleTestCheck = (testIdx) => {
    const updated = (selectedTests || []).map((t, i) => {
      if (i !== testIdx) return t;
      return { ...t, checked: !t.checked };
    });
    setValue("selectedTests", updated);
  };

  const updateTestRate = (testId, rate) => {
    const updated = (selectedTests || []).map((t) =>
      t.id === testId ? { ...t, rate: parseFloat(rate) || 0 } : t
    );
    setValue("selectedTests", updated);
  };

  const handleEditCase = (caseData) => {
    setEditingCase(caseData);
    setSelectedPatient(caseData.patient || null);
    setMrnSearch(caseData.patient?.mrn?.replace("MRN-", "") || "");
    setVisitNoSearch(caseData.visitNo?.replace("V-", "") || "");
    setValue("visitId", caseData.visitId || "");
    setValue("doctorId", caseData.doctorId || "");
    setValue("caseDate", caseData.caseDate ? caseData.caseDate.replace(" ", "T").slice(0, 16) : toLocalISOString(new Date()));
    setValue("analyzerReffno", caseData.analyzerReffno || "");
    setValue("orReffBy", caseData.orReffBy || "");
    setValue("priority", caseData.priority || "Normal");
    setValue("remarks", caseData.remarks || "");

    const mappedTests = (caseData.tests || []).map((t) => ({
      id: t.masterTestId || t.id,
      masterTestId: t.masterTestId,
      serviceId: t.serviceId || null,
      testName: t.masterTest?.testName || t.testName || "",
      testCode: t.masterTest?.testCode || t.testCode || "",
      rate: parseFloat(t.rate) || 0,
      caseTestId: t.id,
      flag: "U",
      checked: true,
    }));
    setValue("selectedTests", mappedTests);
  };

  const handleCancelEdit = () => {
    setEditingCase(null);
    handleReset();
  };

  const handleDeleteCase = async (caseData) => {
    if (!confirm(`Delete case ${caseData.caseNo}? This will also unserved the billing details.`)) return;
    setLoading(true);
    try {
      await labCaseService.delete(caseData.id);
      setMessage({ type: "success", text: `Case ${caseData.caseNo} deleted.` });
      fetchTodayCases();
      fetchWaitingInvoices();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to delete case" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSearch = async (q) => {
    setTestSearch(q);
    if (!q.trim()) { setTestSearchResults([]); return; }
    setTestSearchLoading(true);
    try {
      const res = await masterTestService.getAll({ search: q });
      const existingIds = (selectedTests || []).map((t) => t.masterTestId).filter(Boolean);
      const results = (res.data?.data || res.data || []).filter((t) => !existingIds.includes(t.id));
      setTestSearchResults(results);
    } catch {
      setTestSearchResults([]);
    } finally {
      setTestSearchLoading(false);
    }
  };

  const handleAddTest = (masterTest) => {
    const current = selectedTests || [];
    setValue("selectedTests", [
      ...current,
      {
        id: masterTest.id,
        masterTestId: masterTest.id,
        serviceId: masterTest.serviceId || null,
        testName: masterTest.testName,
        testCode: masterTest.testCode,
        rate: 0,
        flag: "I",
        checked: true,
      },
    ]);
    setTestSearch("");
    setTestSearchResults([]);
  };

  const totalAmount = (selectedTests || []).filter((t) => t.checked !== false).reduce((sum, t) => sum + parseFloat(t.rate || 0), 0);

  const onSubmit = async (data) => {
    if (!selectedPatient || !data.visitId) {
      setMessage({ type: "error", text: "Please search and select a patient with a valid visit" });
      return;
    }
    const tests = selectedTests || [];
    if (tests.length === 0) {
      setMessage({ type: "error", text: "Please select at least one test" });
      return;
    }
    if (editingCase) {
      const checkedTests = tests.filter((t) => t.checked);
      if (checkedTests.length === 0) {
        setMessage({ type: "error", text: "All tests are unchecked. Delete the case instead." });
        return;
      }
    }

    setLoading(true);
    try {
      if (editingCase) {
        await labCaseService.update(editingCase.id, {
          visitId: data.visitId,
          billingId: data.billingId || null,
          caseDate: data.caseDate,
          analyzerReffno: data.analyzerReffno || null,
          insuranceCompanyId: data.insuranceCompanyId || null,
          doctorId: data.doctorId || null,
          orReffBy: data.orReffBy || null,
          priority: data.priority,
          status: data.status || editingCase.status,
          remarks: data.remarks || null,
        });

        const uncheckedTests = tests.filter((t) => t.flag === "U" && !t.checked);
        const removedTestIds = uncheckedTests.map((t) => t.caseTestId).filter(Boolean);
        const newTests = tests.filter((t) => t.flag === "I" && t.checked);

        if (removedTestIds.length > 0) {
          await labCaseService.removeTests(editingCase.id, removedTestIds);
        }
        if (newTests.length > 0) {
          await labCaseService.addTests(editingCase.id, newTests.map((t) => ({
            masterTestId: t.masterTestId || t.id,
            serviceId: t.serviceId || null,
            rate: t.rate,
          })));
        }
        const totalChanges = removedTestIds.length + newTests.length;
        setMessage({ type: "success", text: `Case updated. ${newTests.length} added, ${removedTestIds.length} removed.` });
      } else {
        const billingId = selectedInvoice ? selectedInvoice.billingId : (data.billingId || null);
        const testPayload = tests.map((t) => ({
          masterTestId: t.masterTestId || null,
          serviceId: t.serviceId || t.id,
          rate: t.rate,
        }));

        if (billingId) {
          const existingRes = await labCaseService.getAll({ billingId });
          const existingCases = existingRes.data || [];
          if (existingCases.length > 0) {
            const existingCase = existingCases[0];
            await labCaseService.addTests(existingCase.id, testPayload);
            setMessage({ type: "success", text: `Tests added to existing case ${existingCase.caseNo}` });
            fetchWaitingInvoices();
            fetchTodayCases();
            handleReset();
            setLoading(false);
            return;
          }
        }

        const payload = {
          visitId: data.visitId,
          billingId,
          caseDate: data.caseDate,
          analyzerReffno: data.analyzerReffno || null,
          insuranceCompanyId: data.insuranceCompanyId || null,
          doctorId: data.doctorId || null,
          orReffBy: data.orReffBy || null,
          priority: data.priority,
          remarks: data.remarks || null,
          tests: testPayload,
        };

        await labCaseService.create(payload);
        setMessage({ type: "success", text: "Lab case registered successfully!" });
      }
      fetchWaitingInvoices();
      fetchTodayCases();
      handleReset();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to register lab case",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientAdded = (patient) => {
    setSelectedPatient(patient);
    setMrnSearch(patient.mrn?.replace("MRN-", "") || "");
    setShowAddPatient(false);
  };

  return (
    <div className="space-y-4">
      {/* Message Toast */}
      {message && (
        <div
          className={`p-3 rounded-md text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Waiting Invoices + Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Waiting Invoices */}
        <Card className="shadow-sm border border-border/50 lg:col-span-1">
          <CardHeader className="px-3 py-1.5 bg-sky-50 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-sky-700">Waiting Vouchers</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => fetchWaitingInvoices(waitingSearch)}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex gap-2 mb-3">
              <Input
                value={waitingSearch}
                onChange={(e) => setWaitingSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchWaitingInvoices(waitingSearch);
                }}
                className="h-8 text-xs"
                placeholder="Search voucher..."
              />
            </div>
            <div className="max-h-[250px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="h-7">
                    <TableHead className="text-xs">Voucher No.</TableHead>
                    <TableHead className="text-xs">Patient</TableHead>
                    <TableHead className="text-xs">Tests</TableHead>
                    <TableHead className="text-xs w-14 text-center">Select</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waitingLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : waitingInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                        No waiting vouchers
                      </TableCell>
                    </TableRow>
                  ) : (
                    waitingInvoices.map((inv) => (
                      <TableRow
                        key={inv.invoiceNo}
                        className={`h-7 cursor-pointer ${
                          selectedInvoice?.invoiceNo === inv.invoiceNo
                            ? "bg-amber-50 hover:bg-amber-100"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleSelectWaitingInvoice(inv)}
                      >
                        <TableCell className="text-xs font-medium">{inv.invoiceNo}</TableCell>
                        <TableCell className="text-xs">{inv.patient?.pName}</TableCell>
                        <TableCell className="text-xs">{inv.tests?.length}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectWaitingInvoice(inv);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Case Details Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Edit Mode Banner */}
          {editingCase && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
              <span className="text-sm font-medium text-blue-700">
                Editing Case: {editingCase.caseNo}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X className="h-3 w-3 mr-1" /> Cancel Edit
              </Button>
            </div>
          )}
          {/* Case Details Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="shadow-sm border border-border/50">
              <CardHeader className="px-3 py-1.5 bg-sky-50 flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-xs font-semibold flex items-center gap-2 text-sky-700 shrink-0">
                  <FlaskConical className="h-3.5 w-3.5" />
                  Case Details
                </CardTitle>

                {/* Patient Details right-aligned in same header row */}
                {selectedPatient ? (
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-2.5 justify-end">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-sky-600" />
                      {selectedPatient.pName || "-"}
                    </span>
                    <span className="text-muted-foreground font-normal">|</span>
                    <span>MRN: {selectedPatient.mrn || "-"}</span>
                    <span className="text-muted-foreground font-normal">|</span>
                    <span>Age: {calculateAge(selectedPatient.dob)}</span>
                    <span className="text-muted-foreground font-normal">|</span>
                    <span>Case: {selectedInvoice?.invoiceNo || editingCase?.caseNo || "NEW CASE"}</span>
                    <span className="text-muted-foreground font-normal">|</span>
                    <span>
                      Dr. {selectedInvoice?.doctorName || selectedPatient.doctorName || (doctors.find((d) => d.id === selectedDoctorId)?.Name) || "-"}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic font-normal">
                    Select a waiting voucher on the left to load patient details
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-2 pt-1">
                <div className="grid grid-cols-7 gap-3 items-end">
                  <div className="space-y-1.0">
                    <Label className="text-xs font-medium text-muted-foreground">Case Date</Label>
                    <Input
                      type="datetime-local"
                      {...register("caseDate")}
                      className="h-9 text-xs"
                    />
                    {errors.caseDate && (
                      <p className="text-xs text-destructive">{errors.caseDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.0">
                    <Label className="text-xs font-medium text-muted-foreground">Analyzer Reff No</Label>
                    <Input
                      {...register("analyzerReffno")}
                      className="h-9 text-xs"
                      placeholder="Analyzer reff no"
                    />
                  </div>

                  <div className="space-y-1.0">
                    <Label className="text-xs font-medium text-muted-foreground">Insurance</Label>
                    <Controller
                      name="insuranceCompanyId"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.0">
                    <Label className="text-xs font-medium text-muted-foreground">Consultant</Label>
                    <Controller
                      name="doctorId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value || "none"}
                          onValueChange={(val) => {
                            if (val === "none") {
                              field.onChange("");
                            } else {
                              field.onChange(val);
                              setValue("orReffBy", "");
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {doctors.map((doc) => (
                              <SelectItem key={doc.id} value={doc.id}>
                                {doc.Name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.0">
                    <Label className="text-xs font-medium text-muted-foreground">Ref By</Label>
                    <Input
                      {...register("orReffBy")}
                      className="h-9 text-xs"
                      placeholder={isConsultantSelected ? "" : "Referred by"}
                      disabled={isConsultantSelected}
                    />
                  </div>

                  <div className="space-y-1.0">
                    <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                    <Controller
                      name="priority"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                <div className="space-y-1.0 space-x-0.5">
                  <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Clear
                  </Button>
                  <Button type="submit" size="sm" disabled={loading || !selectedPatient}>
                    {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                    {editingCase ? "Update" : "Register Case"}
                  </Button>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Tests + Today's Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* Selected Tests Table */}
              <Card className="shadow-sm border border-border/50">
                <CardHeader className="px-3 py-1.5 bg-sky-50 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-sky-700">
                    Selected Tests ({(selectedTests || []).length})
                  </CardTitle>
                  <div className="text-xs font-semibold text-sky-700">
                    Total: Rs. {totalAmount.toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-1">
                  {editingCase && (
                    <div className="mb-2 relative">
                      <Input
                        value={testSearch}
                        onChange={(e) => handleTestSearch(e.target.value)}
                        placeholder="Search test to add..."
                        className="h-8 text-xs"
                      />
                      {testSearchResults.length > 0 && (
                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-37.5 overflow-auto">
                          {testSearchResults.map((t) => (
                            <div
                              key={t.id}
                              className="px-2 py-1.5 text-xs cursor-pointer hover:bg-muted flex justify-between"
                              onClick={() => handleAddTest(t)}
                            >
                              <span className="font-medium">{t.testCode}</span>
                              <span className="text-muted-foreground">{t.testName}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="max-h-75 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="h-8">
                          <TableHead className="text-xs w-10">SL</TableHead>
                          <TableHead className="text-xs">Test Code</TableHead>
                          <TableHead className="text-xs">Test Name</TableHead>
                          <TableHead className="text-xs w-28 text-right">Rate</TableHead>
                          <TableHead className="text-xs w-10 text-center">Del</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedTests || []).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                              No tests selected.
                            </TableCell>
                          </TableRow>
                        ) : (
                          (selectedTests || []).map((test, idx) => (
                            <TableRow key={idx} className={`h-8 ${test.checked === false ? "opacity-40 line-through" : ""}`}>
                              <TableCell className="text-xs">{idx + 1}</TableCell>
                              <TableCell className="text-xs font-medium">{test.testCode}</TableCell>
                              <TableCell className="text-xs">{test.testName}</TableCell>
                              <TableCell className="text-xs text-right">
                                <Input
                                  type="number"
                                  
                                  value={test.rate}
                                  onChange={(e) => updateTestRate(test.id, e.target.value)}
                                  className="h-7 text-xs text-right w-24"
                                  min="0"
                                  step="0.01"
                                  disabled
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={() => removeTest(idx)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Cases */}
              <Card className="shadow-sm border border-border/50">
                <CardHeader className="px-3 py-2 bg-sky-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs font-semibold text-sky-700">Today&apos;s Cases</CardTitle>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white font-mono">
                      {filteredTodayCases.length} / {todayCases.length}
                    </Badge>
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {["All", "Registered", "Sampled", "InProcess", "Reported"].map((st) => {
                      const count =
                        st === "All"
                          ? todayCases.length
                          : st === "Reported"
                          ? todayCases.filter((c) => c.status === "Reported" || c.status === "Approved").length
                          : todayCases.filter((c) => c.status === st).length;

                      const isActive = caseStatusFilter === st;

                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setCaseStatusFilter(st)}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-white text-slate-600 hover:bg-sky-100 border border-slate-200"
                          }`}
                        >
                          <span>{st}</span>
                          <span
                            className={`text-[9px] px-1 rounded-full font-mono ${
                              isActive ? "bg-sky-700 text-white" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-1"
                      onClick={() => fetchTodayCases()}
                      title="Refresh Cases"
                    >
                      <RefreshCw className="h-3 w-3 text-sky-700" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="h-8">
                          <TableHead className="text-xs">Case No.</TableHead>
                          <TableHead className="text-xs">Patient</TableHead>
                          <TableHead className="text-xs">Tests</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Prints</TableHead>
                          <TableHead className="text-xs w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayCasesLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ) : filteredTodayCases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-6">
                              {todayCases.length === 0
                                ? "No cases today"
                                : `No cases matching "${caseStatusFilter}" status`}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTodayCases.map((c) => (
                            <TableRow key={c.id} className="h-8">
                              <TableCell className="text-xs font-medium">{c.caseNo}</TableCell>
                              <TableCell className="text-xs">{c.patient?.pName}</TableCell>
                              <TableCell className="text-xs">{c.tests?.length}</TableCell>
                              <TableCell className="text-xs">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  c.status === "Registered" ? "bg-blue-100 text-blue-700" :
                                  c.status === "Sampled" ? "bg-yellow-100 text-yellow-700" :
                                  c.status === "InProcess" ? "bg-purple-100 text-purple-700" :
                                  c.status === "Reported" ? "bg-green-100 text-green-700" :
                                  c.status === "Approved" ? "bg-emerald-100 text-emerald-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {c.status}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs">
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-1.5 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                                    onClick={() => handleOpenBarcode(c)}
                                    title="Print Barcode"
                                  >
                                    <Printer className="h-3 w-3 mr-1" /> Barcode
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-1.5 text-[11px] text-emerald-600 hover:text-emerald-800 font-medium"
                                    onClick={() => handleOpenLabCopy(c)}
                                    title="Print Lab Copy Thermal"
                                  >
                                    <FileText className="h-3 w-3 mr-1" /> Lab Copy
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                {(c.status === "Registered" || c.status === "Sampled") && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <EllipsisVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditCase(c)}>
                                        <Pencil className="h-3 w-3 mr-2" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeleteCase(c)} className="text-destructive">
                                        <Trash2 className="h-3 w-3 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit */}
          </form>
        </div>
      </div>

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={showAddPatient}
        onOpenChange={setShowAddPatient}
        onPatientAdded={handlePatientAdded}
      />

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

      {/* Print Lab Copy Thermal Dialog */}
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
                  <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}>Parameters:</div>
                  {(labCopyCase.tests || []).map((test) => (
                    <div key={test.id} style={{ marginBottom: "6px" }}>
                      {test.parameters && test.parameters.length > 0 && (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", marginTop: "2px" }}>
                          <tbody>
                            {test.parameters.map((param, pIdx) => (
                              <tr key={pIdx}>
                                <td style={{ padding: "1px 2px" }}>{param.parameterName}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}

                  {/* Footer */}
                  <div style={{ borderTop: "1px dashed #000", paddingTop: "6px", marginTop: "6px", textAlign: "center", fontSize: "10px" }}>
                    Thank you
                  </div>
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
