"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  UserPlus,
  CalendarDays,
  CalendarPlus,
  User,
  Stethoscope,
  Calendar,
  Building2,
  Activity,
} from "lucide-react";
import PatientDetailsCard from "@/components/patients/PatientDetailsCard";
import patientService from "@/services/patient.service";
import patientVisitService from "@/services/patientVisitService";
import doctorService from "@/services/doctor.service";
import insuranceCompanyService from "@/services/insuranceCompanyService";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { toLocalISOString } from "@/lib/utils";

export default function PatientVisitsPage() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);

  const [mrnSearch, setMrnSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const [cnicSearch, setCnicSearch] = useState("");
  const [visitNoSearch, setVisitNoSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [isPatientListDialogOpen, setIsPatientListDialogOpen] = useState(false);
  const [patientListResults, setPatientListResults] = useState([]);
  const [patientListTitle, setPatientListTitle] = useState("Select Patient");

  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [prefillMobile, setPrefillMobile] = useState("");
  const [prefillCnic, setPrefillCnic] = useState("");

  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedInsuranceCompany, setSelectedInsuranceCompany] = useState("");
  const [visitStatus, setVisitStatus] = useState("Waiting");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 0, 0);
  const [fromDate, setFromDate] = useState(toLocalISOString(todayStart));
  const [toDate, setToDate] = useState(toLocalISOString(todayEnd));

  const [visitDate, setVisitDate] = useState(toLocalISOString(new Date()));

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    loadDoctors();
    loadInsuranceCompanies();
    fetchVisits({ today: true });
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await doctorService.getAll();
      setDoctors(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadInsuranceCompanies = async () => {
    try {
      const res = await insuranceCompanyService.getAll();
      setInsuranceCompanies(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVisits = async (params = {}) => {
    try {
      setLoading(true);
      const res = await patientVisitService.getAll(params);
      setVisits(res.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load visits" });
    } finally {
      setLoading(false);
    }
  };

  const handleTodaySearch = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 0, 0);
    setFromDate(toLocalISOString(start));
    setToDate(toLocalISOString(end));
    fetchVisits({ today: true });
  };

  const handleDateSearch = () => {
    fetchVisits({ fromDate, toDate });
  };

  const handleMrnSearch = async () => {
    if (!mrnSearch.trim()) {
      setMessage({ type: "error", text: "Please enter MRN" });
      return;
    }
    setLoading(true);
    try {
      const res = await patientService.getAll({ mrn: "MRN-" + mrnSearch });
      if (res.data && res.data.length > 0) {
        setSelectedPatient(res.data[0]);
        setIsVisitDialogOpen(true);
      } else {
        setMessage({ type: "error", text: "No patient found for this MRN" });
      }
    } catch {
      setMessage({ type: "error", text: "Search failed" });
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
        setSelectedPatient(res.data.patient);
        setMrnSearch(res.data.patient?.mrn?.replace("MRN-", "") || "");
        fetchVisits({ visitNo: visitNoSearch });
      } else {
        setMessage({ type: "error", text: "Visit not found" });
      }
    } catch {
      setMessage({ type: "error", text: "Search failed" });
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
    fetchVisits({ today: true });
  };

  const openPatientList = async (searchParams, title) => {
    setLoading(true);
    try {
      const res = await patientService.getAll(searchParams);
      setPatientListResults(res.data);
      setPatientListTitle(title);
      setIsPatientListDialogOpen(true);
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
    await openPatientList({ mobile: mobileSearch }, "Select Patient (Mobile Search)");
  };

  const handleCnicSearch = async () => {
    if (!cnicSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a CNIC number" });
      return;
    }
    await openPatientList({ cnic: cnicSearch }, "Select Patient (CNIC Search)");
  };

  const handleSelectPatientFromList = (patient) => {
    setSelectedPatient(patient);
    setIsPatientListDialogOpen(false);
    setPatientListResults([]);
    setIsVisitDialogOpen(true);
  };

  const handleAddNewPatient = () => {
    setIsPatientListDialogOpen(false);
    setPrefillMobile(mobileSearch);
    setPrefillCnic(cnicSearch);
    setIsPatientDialogOpen(true);
  };

  const handlePatientAdded = (newPatient) => {
    setSelectedPatient(newPatient);
    setIsPatientDialogOpen(false);
    setIsVisitDialogOpen(true);
  };

  const handleRefreshPatientList = async () => {
    const params = {};
    if (mobileSearch.trim()) params.mobile = mobileSearch;
    if (cnicSearch.trim()) params.cnic = cnicSearch;
    if (Object.keys(params).length > 0) {
      const res = await patientService.getAll(params);
      setPatientListResults(res.data);
    }
  };

  const handleEditVisit = (visit) => {
    setEditingVisit(visit);
    setSelectedPatient(visit.patient);
    setSelectedDoctor(visit.doctorId || "");
    setSelectedInsuranceCompany(visit.insuranceCompanyId || "");
    setVisitStatus(visit.status || "Waiting");
    setVisitDate(visit.visitDate ? toLocalISOString(new Date(visit.visitDate)) : toLocalISOString(new Date()));
    setIsVisitDialogOpen(true);
  };

  const handleBill = (visit) => {
    const params = new URLSearchParams();
    if (visit.patient?.mrn) params.set("mrn", visit.patient.mrn);
    if (visit.id) params.set("visitId", visit.id);
    if (visit.doctorId) params.set("doctorId", visit.doctorId);
    params.set("fromVisit", "1");
    router.push(`/Modules/FrontDesk/billing?${params.toString()}`);
  };

  const handleNewVisit = async () => {
    if (!selectedPatient) {
      setMessage({ type: "error", text: "Please select a patient first" });
      return;
    }

    try {
      setLoading(true);
      const visitData = {
        patientId: selectedPatient.id,
        doctorId: selectedDoctor || null,
        insuranceCompanyId: selectedInsuranceCompany || null,
        userId: user?.id,
        visitDate: new Date(visitDate).toISOString(),
        status: visitStatus,
      };

      if (editingVisit) {
        await patientVisitService.update(editingVisit.id, visitData);
        setMessage({ type: "success", text: "Visit updated successfully" });
      } else {
        await patientVisitService.create(visitData);
        setMessage({ type: "success", text: "Visit created successfully" });
      }
      setIsVisitDialogOpen(false);
      resetForm();
      fetchVisits({ fromDate, toDate });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create visit",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setEditingVisit(null);
    setMrnSearch("");
    setMobileSearch("");
    setCnicSearch("");
    setVisitNoSearch("");
    setSelectedDoctor("");
    setSelectedInsuranceCompany("");
    setVisitStatus("Waiting");
    setVisitDate(toLocalISOString(new Date()));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Visits</h1>
          <p className="text-muted-foreground mt-1">Manage patient visits</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

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

      <div className="flex gap-2 items-end flex-wrap">
        <Button variant="outline" onClick={handleTodaySearch}>
          <CalendarDays className="h-4 w-4 mr-1" />Today
        </Button>
        <div className="space-y-1">
          <Label className="text-xs">From Date</Label>
          <Input
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-52"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To Date</Label>
          <Input
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-52"
          />
        </div>
        <Button onClick={handleDateSearch}>
          <Search className="h-4 w-4 mr-1" />Search
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          columns={getColumns({ onEdit: handleEditVisit, onBill: handleBill })}
          data={visits}
          filterColumn="pName"
        />
      )}

      {/* Patient List Dialog (Mobile/CNIC Search) */}
      <Dialog open={isPatientListDialogOpen} onOpenChange={setIsPatientListDialogOpen}>
        <DialogContent className="!max-w-2xl sm:!max-w-2xl w-[95vw] md:w-[650px] max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">{patientListTitle}</DialogTitle>
            <Button size="sm" onClick={handleAddNewPatient} className="h-9 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              <UserPlus className="h-4 w-4 mr-1" />Add Patient
            </Button>
          </DialogHeader>
          <div className="space-y-2 pt-2 max-h-[400px] overflow-y-auto">
            {patientListResults.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No patients found</p>
              </div>
            ) : (
              patientListResults.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-teal-50/50 hover:border-teal-200 transition-all shadow-2xs"
                  onClick={() => handleSelectPatientFromList(patient)}
                >
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{patient.pName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-bold text-slate-700">{patient.mrn}</span> | {patient.mobile} {patient.cnic ? `| ${patient.cnic}` : ""}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">Select</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Visit Dialog */}
      <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
        <DialogContent className="!max-w-3xl sm:!max-w-3xl w-[95vw] md:w-[750px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-700 shadow-2xs">
                <CalendarPlus className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {editingVisit ? "Edit Patient Visit" : "Add New Patient Visit"}
              </DialogTitle>
            </div>

            {editingVisit?.visitNo && (
              <Badge variant="outline" className="bg-teal-50 text-teal-900 border-teal-300 font-mono text-xs px-2.5 py-0.5 font-bold">
                {editingVisit.visitNo}
              </Badge>
            )}
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {selectedPatient && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-100/70 border border-teal-200 text-teal-800">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 leading-tight flex items-center gap-2">
                      <span>{selectedPatient.pName}</span>
                      {selectedPatient.gender && (
                        <span className="text-xs font-normal text-slate-500">({selectedPatient.gender})</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>MRN: <strong className="text-slate-700 font-mono">{selectedPatient.mrn}</strong></span>
                      {selectedPatient.mobile && <span>• Mobile: {selectedPatient.mobile}</span>}
                      {selectedPatient.cnic && <span>• CNIC: {selectedPatient.cnic}</span>}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white text-teal-900 border-teal-300 text-xs px-2.5 py-1 font-bold w-fit">
                  Selected Patient
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Row 1 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>Visit Date & Time <span className="text-rose-500">*</span></span>
                </Label>
                <Input
                  type="datetime-local"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="h-10 text-sm font-medium bg-muted/40 cursor-not-allowed"
                  disabled={true}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-teal-600" />
                  <span>Consulting Doctor</span>
                </Label>
                <Select value={selectedDoctor || "none"} onValueChange={(val) => setSelectedDoctor(val === "none" ? "" : val)}>
                  <SelectTrigger className="w-full h-10 text-sm font-medium bg-white">
                    <SelectValue placeholder="Select doctor" />
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
              </div>

              {/* Row 2 */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Insurance Company</span>
                </Label>
                <Select value={selectedInsuranceCompany || "none"} onValueChange={(val) => setSelectedInsuranceCompany(val === "none" ? "" : val)}>
                  <SelectTrigger className="w-full h-10 text-sm font-medium bg-white">
                    <SelectValue placeholder="Select insurance company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {insuranceCompanies.map((ic) => (
                      <SelectItem key={ic.id} value={ic.id}>
                        {ic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Visit Status</span>
                </Label>
                <Select value={visitStatus} onValueChange={setVisitStatus}>
                  <SelectTrigger className="w-full h-10 text-sm font-medium bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Waiting">Waiting</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsVisitDialogOpen(false)}
                className="h-10 px-5 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleNewVisit}
                disabled={loading || !selectedPatient}
                className="h-10 px-6 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingVisit ? "Update Visit" : "Create Visit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
        prefillMobile={prefillMobile}
        prefillCnic={prefillCnic}
      />
    </div>
  );
}
