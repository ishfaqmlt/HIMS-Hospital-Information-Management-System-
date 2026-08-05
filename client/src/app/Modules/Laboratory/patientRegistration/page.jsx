"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
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
  Loader2,
  Save,
  Trash2,
  Check,
  RotateCcw,
  FlaskConical,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { labCaseSchema } from "@/lib/zodeSchema";
import patientVisitService from "@/services/patientVisitService";
import doctorService from "@/services/doctor.service";
import labCaseService from "@/services/labCase.service";
import PatientDetailsCard from "@/components/patients/PatientDetailsCard";
import AddPatientDialog from "@/components/patients/AddPatientDialog";

function toLocalISOString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

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
      testName: t.serviceName,
      testCode: t.serviceCode,
      rate: parseFloat(t.rate) || 0,
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
    setMrnSearch("");
    setMobileSearch("");
    setCnicSearch("");
    setVisitNoSearch("");
    setSelectedPatient(null);
    setExistingVisitId(null);
    setSelectedInvoice(null);
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

  const removeTest = (testId) => {
    const updated = (selectedTests || []).filter((t) => t.id !== testId);
    setValue("selectedTests", updated);
  };

  const updateTestRate = (testId, rate) => {
    const updated = (selectedTests || []).map((t) =>
      t.id === testId ? { ...t, rate: parseFloat(rate) || 0 } : t
    );
    setValue("selectedTests", updated);
  };

  const totalAmount = (selectedTests || []).reduce((sum, t) => sum + parseFloat(t.rate || 0), 0);

  const onSubmit = async (data) => {
    if (!selectedPatient || !data.visitId) {
      setMessage({ type: "error", text: "Please search and select a patient with a valid visit" });
      return;
    }
    if (!data.selectedTests || data.selectedTests.length === 0) {
      setMessage({ type: "error", text: "Please select at least one test" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        visitId: data.visitId,
        billingId: selectedInvoice ? selectedInvoice.invoiceNo : (data.billingId || null),
        caseDate: data.caseDate,
        analyzerReffno: data.analyzerReffno || null,
        insuranceCompanyId: data.insuranceCompanyId || null,
        doctorId: data.doctorId || null,
        orReffBy: data.orReffBy || null,
        priority: data.priority,
        remarks: data.remarks || null,
        tests: data.selectedTests.map((t) => ({
          masterTestId: t.id,
          rate: t.rate,
        })),
      };

      await labCaseService.create(payload);
      setMessage({ type: "success", text: "Lab case registered successfully!" });
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

      {/* Patient Details */}
      <PatientDetailsCard
        mrnSearch={mrnSearch}
        onMrnSearchChange={setMrnSearch}
        onMrnSearch={handleSearchByMRN}
        mobileSearch={mobileSearch}
        onMobileSearchChange={setMobileSearch}
        onMobileSearch={handleSearchByMobile}
        cnicSearch={cnicSearch}
        onCnicSearchChange={setCnicSearch}
        onCnicSearch={handleSearchByCNIC}
        visitNoSearch={visitNoSearch}
        onVisitNoSearchChange={setVisitNoSearch}
        onVisitNoSearch={handleSearchByVisitNo}
        selectedPatient={selectedPatient}
        patientType=""
        onPatientTypeChange={() => {}}
        patientTypes={[]}
        onReset={handleReset}
      />

      {/* Waiting Invoices + Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Waiting Invoices */}
        <Card className="shadow-sm border border-border/50 lg:col-span-1">
          <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Waiting Vouchers</CardTitle>
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

        {/* Case Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Case Details Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="shadow-sm border border-border/50">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-7 gap-3 items-end">
                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Analyzer Reff No</Label>
                    <Input
                      {...register("analyzerReffno")}
                      className="h-9 text-xs"
                      placeholder="Analyzer reff no"
                    />
                  </div>

                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Consultant</Label>
                    <Controller
                      name="doctorId"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
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

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Ref By</Label>
                    <Input
                      {...register("orReffBy")}
                      className="h-9 text-xs"
                      placeholder="Referred by"
                    />
                  </div>

                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">&nbsp;</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 px-3"
                      onClick={() => setShowAddPatient(true)}
                    >
                      <UserPlus className="h-3 w-3 mr-1" /> New
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Tests + Today's Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* Selected Tests Table */}
              <Card className="shadow-sm border border-border/50">
                <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Selected Tests ({(selectedTests || []).length})
                  </CardTitle>
                  <div className="text-sm font-semibold">
                    Total: Rs. {totalAmount.toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="max-h-[300px] overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="h-8">
                          <TableHead className="text-xs w-12">SL</TableHead>
                          <TableHead className="text-xs">Test Code</TableHead>
                          <TableHead className="text-xs">Test Name</TableHead>
                          <TableHead className="text-xs w-28 text-right">Rate</TableHead>
                          <TableHead className="text-xs w-14 text-center">Del</TableHead>
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
                            <TableRow key={test.id} className="h-8">
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
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={() => removeTest(test.id)}
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
                <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Today&apos;s Cases</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => fetchTodayCases()}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
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
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {todayCasesLoading ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-6">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                          </TableRow>
                        ) : todayCases.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                              No cases today
                            </TableCell>
                          </TableRow>
                        ) : (
                          todayCases.map((c) => (
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
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-3 w-3 mr-1" /> Clear
              </Button>
              <Button type="submit" size="sm" disabled={loading || !selectedPatient}>
                {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                Register Case
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={showAddPatient}
        onOpenChange={setShowAddPatient}
        onPatientAdded={handlePatientAdded}
      />
    </div>
  );
}
