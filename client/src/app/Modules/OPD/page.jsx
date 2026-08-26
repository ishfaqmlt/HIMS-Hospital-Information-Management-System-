"use client";

import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opdVisitSchema } from "@/lib/zodeSchema";
import opdVisitService from "@/services/opdVisit.service";
import opdPrescriptionService from "@/services/opdPrescription.service";
import patientService from "@/services/patient.service";
import doctorService from "@/services/doctor.service";
import departmentService from "@/services/department.service";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { Loader2, Plus, Search, CalendarDays, Eye, UserPlus, Badge } from "lucide-react";
import { formatDate } from "@/lib/utils";

import { useOPDContext } from "./layout";

export default function OPDPage() {
  const router = useRouter();
  const { setActivePatient } = useOPDContext() || {};
  const todayStr = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [nameFilter, setNameFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [viewingVisit, setViewingVisit] = useState(null);

  const [mobileSearch, setMobileSearch] = useState("");
  const [mobileResults, setMobileResults] = useState([]);
  const [mobileSearched, setMobileSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    usewatch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opdVisitSchema),
    defaultValues: {
      patientId: "",
      DoctorId: "",
      DepartmentId: "",
      VisitDate: new Date().toISOString().split("T")[0],
      VisitNo: "",
      VisitType: "OPD",
      ConsultationFee: 0,
      ChiefComplaint: "",
      Diagnosis: "",
      Notes: "",
      Status: "Waiting",
      isPrescriptionGiven: false,
    },
  });

  async function loadDoctors() {
    try {
      const res = await doctorService.getAll({ opd: true });
      setDoctors(res.data.filter((d) => d.Name !== "Self"));
    } catch (error) {
      console.error(error);
    }
  }

  async function loadDepartments() {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadTodaysVisits() {
    try {
      const res = await opdVisitService.getQueue({ date: todayStr });
      setVisits(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No OPD token queue found for today" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load OPD queue", error });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
    loadDepartments();
    loadTodaysVisits();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const handleDateSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await opdVisitService.getQueue({ fromDate, toDate });
      setVisits(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: `No OPD visits found between ${fromDate} and ${toDate}` });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load OPD queue", error });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingVisit(null);
    setSelectedPatient(null);
    setMobileSearch("");
    setMobileResults([]);
    setMobileSearched(false);
    reset({
      patientId: "",
      DoctorId: "",
      DepartmentId: "",
      VisitDate: new Date().toISOString().split("T")[0],
      VisitNo: `OPD-${Date.now().toString().slice(-6)}`,
      VisitType: "OPD",
      ConsultationFee: 0,
      ChiefComplaint: "",
      Diagnosis: "",
      Notes: "",
      Status: "Waiting",
      isPrescriptionGiven: false,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (visit) => {
    setEditingVisit(visit);
    setSelectedPatient(visit.patient);
    setMobileSearch("");
    setMobileResults([]);
    setMobileSearched(false);
    reset({
      patientId: visit.patientId,
      DoctorId: visit.DoctorId,
      DepartmentId: visit.DepartmentId || "",
      VisitDate: visit.VisitDate ? new Date(visit.VisitDate).toISOString().split("T")[0] : "",
      VisitNo: visit.VisitNo,
      VisitType: visit.VisitType,
      ConsultationFee: visit.ConsultationFee,
      ChiefComplaint: visit.ChiefComplaint || "",
      Diagnosis: visit.Diagnosis || "",
      Notes: visit.Notes || "",
      Status: visit.Status,
      isPrescriptionGiven: visit.isPrescriptionGiven,
    });
    setIsDialogOpen(true);
  };

  const openView = (visit) => {
    setViewingVisit(visit);
    if (setActivePatient) {
      setActivePatient(visit);
    }
    setIsViewDialogOpen(true);
  };

  const handleMobileSearch = async () => {
    if (!mobileSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a mobile number" });
      return;
    }
    try {
      const res = await patientService.getAll({ search: mobileSearch });
      setMobileResults(res.data);
      setMobileSearched(true);
    } catch (error) {
      setMessage({ type: "error", text: "Search failed", error });
    }
  };

  const selectExistingPatient = (patient) => {
    setSelectedPatient(patient);
    setValue("patientId", patient.id);
  };

  const handlePatientAdded = (newPatient) => {
    setSelectedPatient(newPatient);
    setValue("patientId", newPatient.id);
    setIsPatientDialogOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      if (!selectedPatient && !editingVisit) {
        setMessage({ type: "error", text: "Please select a patient" });
        return;
      }

      if (editingVisit) {
        await opdVisitService.update(editingVisit.Id, data);
        setMessage({ type: "success", text: "Visit updated successfully" });
      } else {
        data.patientId = selectedPatient.id;
        await opdVisitService.create(data);
        setMessage({ type: "success", text: "Visit created successfully" });
      }
      setIsDialogOpen(false);
      if (searchTerm) {
        handleSearch({ preventDefault: () => {} });
      } else if (visits.length > 0) {
        loadTodaysVisits();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this visit?")) return;
    try {
      await opdVisitService.delete(id);
      setMessage({ type: "success", text: "Visit deleted successfully" });
      setVisits((prev) => prev.filter((v) => v.Id !== id));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete visit", error });
    }
  };

  const resetVisits = () => {
    setFromDate(todayStr);
    setToDate(todayStr);
    setNameFilter("");
    loadTodaysVisits();
  };

  const handlePrescribePatient = async (visit) => {
    try {
      const targetVisitId = visit.visit_id || visit.visitId || visit.id || visit.Id;
      const targetPatientId = visit.patient_id || visit.patientId || visit.patient?.id;
      const targetDoctorId = visit.DoctorId || visit.doctorId || visit.doctor?.id;

      let prescriptionData = null;

      // 1. Create or fetch existing today's prescription entry in opd_prescriptions table
      if (targetVisitId && targetPatientId && targetDoctorId) {
        try {
          const res = await opdPrescriptionService.create({
            visitId: targetVisitId,
            patientId: targetPatientId,
            doctorId: targetDoctorId,
            presc_date: new Date().toISOString(),
            advice: "",
            followUpDate: null,
            status: "pending",
          });
          prescriptionData = res?.data;
        } catch (err) {
          console.error("Prescription creation/fetch note:", err);
        }
      }

      if (setActivePatient) {
        setActivePatient({
          ...visit,
          currentPrescription: prescriptionData,
        });
      }

      // 2. Update visit status to 'In Progress' if currently 'Waiting'
      if (visit.Status === "Waiting" && targetVisitId) {
        await opdVisitService.update(targetVisitId, { Status: "In Progress" }).catch(() => {});
      }

      router.push("/Modules/OPD/prescription");
    } catch (error) {
      console.error("Failed to process prescribe action:", error);
      router.push("/Modules/OPD/prescription");
    }
  };

  const columns = getColumns({
    onPrescribe: handlePrescribePatient,
  });

  const filteredVisits = visits.filter((item) => {
    if (!nameFilter.trim()) return true;
    const term = nameFilter.toLowerCase();
    const name = (item.patient_name || item.patient?.pName || "").toLowerCase();
    const mrn = (item.patient_mrn || item.patient?.mrn || "").toLowerCase();
    return name.includes(term) || mrn.includes(term);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">OPD Queue & Consultation</h1>
        <p className="text-muted-foreground mt-1">View billed outpatient tokens and select patients for consultation</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 p-4 bg-white border rounded-xl shadow-xs">
        <form onSubmit={handleDateSearch} className="flex flex-wrap items-end gap-3 flex-1">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 text-xs w-36"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 text-xs w-36"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
            <Search className="h-4 w-4 mr-1.5" />Search Range
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs" onClick={loadTodaysVisits} disabled={loading}>
            <CalendarDays className="h-4 w-4 mr-1.5 text-teal-600" />Today's Queue
          </Button>
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={resetVisits} disabled={loading}>
            Reset
          </Button>
        </div>
      </div>

      {/* Patient Name Filter Input & Counter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by Patient Name..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Total Queue: <strong className="text-slate-800">{filteredVisits.length}</strong>
        </span>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <DataTable columns={columns} data={filteredVisits} />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVisit ? "Edit Visit" : "New Visit"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!editingVisit && (
                <>
                  {!selectedPatient ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search patient by mobile number"
                          value={mobileSearch}
                          onChange={(e) => setMobileSearch(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMobileSearch())}
                        />
                        <Button type="button" onClick={handleMobileSearch}>
                          <Search className="h-4 w-4 mr-2" />Search
                        </Button>
                      </div>

                      {mobileSearched && (
                        <div className="space-y-3">
                          {mobileResults.length > 0 ? (
                            <>
                              <p className="text-sm text-muted-foreground">
                                {mobileResults.length} patient(s) found. Select or add new:
                              </p>
                              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                {mobileResults.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                                    onClick={() => selectExistingPatient(p)}
                                  >
                                    <div>
                                      <p className="font-medium">{p.pName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {p.mrn} | {p.mobile} | {p.cnic || "No CNIC"}
                                      </p>
                                    </div>
                                    <Button type="button" size="sm" variant="outline">Select</Button>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-muted-foreground py-4">No patients found with this mobile number</p>
                          )}
                          <Button type="button" variant="outline" className="w-full" onClick={() => setIsPatientDialogOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />Add New Patient
                          </Button>
                        </div>
                      )}

                      {!mobileSearched && (
                        <Button type="button" variant="outline" className="w-full" onClick={() => setIsPatientDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />Add New Patient
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center justify-between">
                      <div>
                        Patient: <strong>{selectedPatient.pName}</strong> ({selectedPatient.mrn})
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                        Change
                      </Button>
                    </div>
                  )}
                </>
              )}

              {selectedPatient && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Doctor *</Label>
                      <Select value={usewatch("DoctorId")} onValueChange={(val) => setValue("DoctorId", val)}>
                        <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                        <SelectContent>
                          {doctors.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.DoctorId && <p className="text-sm text-destructive">{errors.DoctorId.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={usewatch("DepartmentId")} onValueChange={(val) => setValue("DepartmentId", val)}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.DepartmentName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Visit Date *</Label>
                      <Input type="date" {...register("VisitDate")} />
                      {errors.VisitDate && <p className="text-sm text-destructive">{errors.VisitDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Visit No *</Label>
                      <Input {...register("VisitNo")} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Visit Type *</Label>
                      <Select value={usewatch("VisitType")} onValueChange={(val) => setValue("VisitType", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPD">OPD</SelectItem>
                          <SelectItem value="Followup">Followup</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Consultation Fee *</Label>
                      <Input type="number" step="0.01" {...register("ConsultationFee")} />
                      {errors.ConsultationFee && <p className="text-sm text-destructive">{errors.ConsultationFee.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select value={usewatch("Status")} onValueChange={(val) => setValue("Status", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Waiting">Waiting</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Chief Complaint</Label>
                    <Textarea {...register("ChiefComplaint")} placeholder="Patient's main complaint" />
                  </div>

                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Textarea {...register("Diagnosis")} placeholder="Doctor's diagnosis" />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea {...register("Notes")} placeholder="Additional notes" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingVisit ? "Update" : "Create"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isViewDialogOpen && viewingVisit && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Visit Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Visit No</p>
                  <p className="font-medium">{viewingVisit.VisitNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDate(viewingVisit.VisitDate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{viewingVisit.patient?.pName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Doctor</p>
                  <p className="font-medium">{viewingVisit.doctor?.Name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="outline">{viewingVisit.VisitType}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[viewingVisit.Status]}>
                    {viewingVisit.Status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Fee</p>
                  <p className="font-medium">{Number(viewingVisit.ConsultationFee).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Prescription</p>
                  <Badge variant={viewingVisit.isPrescriptionGiven ? "default" : "secondary"}>
                    {viewingVisit.isPrescriptionGiven ? "Given" : "No"}
                  </Badge>
                </div>
              </div>
              {viewingVisit.ChiefComplaint && (
                <div>
                  <p className="text-sm text-muted-foreground">Chief Complaint</p>
                  <p className="text-sm">{viewingVisit.ChiefComplaint}</p>
                </div>
              )}
              {viewingVisit.Diagnosis && (
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="text-sm">{viewingVisit.Diagnosis}</p>
                </div>
              )}
              {viewingVisit.Notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{viewingVisit.Notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AddPatientDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onPatientAdded={handlePatientAdded}
        prefillMobile={mobileSearch}
      />
    </div>
  );
}
