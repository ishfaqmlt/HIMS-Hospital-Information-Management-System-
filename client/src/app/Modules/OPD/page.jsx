"use client";

import React, { useEffect, useState } from "react";
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
import patientService from "@/services/patient.service";
import doctorService from "@/services/doctor.service";
import departmentService from "@/services/department.service";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { Loader2, Plus, Search, CalendarDays, Eye, UserPlus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function OPDPage() {
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    watch,
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
      setLoading(true);
      setSearchTerm("");
      const res = await opdVisitService.getQueue();
      setVisits(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No OPD token queue found for today" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load OPD queue" });
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage({ type: "error", text: "Please enter a search term" });
      return;
    }
    try {
      setLoading(true);
      const res = await opdVisitService.getQueue({ search: searchTerm });
      setVisits(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No visits found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const resetVisits = () => {
    setSearchTerm("");
    setVisits([]);
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
      setMessage({ type: "error", text: "Search failed" });
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
      setMessage({ type: "error", text: "Failed to delete visit" });
    }
  };

  const columns = getColumns({
    onEdit: openEdit,
    onDelete: handleDelete,
    onView: openView,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">OPD Visits</h1>
          <p className="text-muted-foreground mt-1">Manage outpatient department visits</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />New Visit
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by Visit No, Patient Name, or Mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />Search
          </Button>
        </form>
        <Button variant="outline" onClick={loadTodaysVisits} disabled={loading}>
          <CalendarDays className="h-4 w-4 mr-2" />Today's Visits
        </Button>
        <Button variant="ghost" onClick={resetVisits} disabled={loading}>
          Reset
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={visits} filterColumn="VisitNo" />
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
                      <Select value={watch("DoctorId")} onValueChange={(val) => setValue("DoctorId", val)}>
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
                      <Select value={watch("DepartmentId")} onValueChange={(val) => setValue("DepartmentId", val)}>
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
                      <Select value={watch("VisitType")} onValueChange={(val) => setValue("VisitType", val)}>
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
                      <Select value={watch("Status")} onValueChange={(val) => setValue("Status", val)}>
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
