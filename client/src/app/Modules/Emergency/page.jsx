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
import { emergencyCaseSchema } from "@/lib/zodeSchema";
import emergencyCaseService from "@/services/emergencyCase.service";
import patientService from "@/services/patient.service";
import doctorService from "@/services/doctor.service";
import departmentService from "@/services/department.service";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { Loader2, Plus, Search, CalendarDays, Eye, UserPlus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EmergencyPage() {
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [viewingCase, setViewingCase] = useState(null);

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
    resolver: zodResolver(emergencyCaseSchema),
    defaultValues: {
      patientId: "",
      DoctorId: "",
      DepartmentId: "",
      CaseNo: "",
      ArrivalDate: new Date().toISOString().split("T")[0],
      DischargeDate: "",
      Priority: "Urgent",
      Status: "Active",
      ChiefComplaint: "",
      Diagnosis: "",
      Treatment: "",
      Notes: "",
      TotalCharges: 0,
      TotalPaid: 0,
    },
  });

  const totalCharges = watch("TotalCharges");
  const totalPaid = watch("TotalPaid");

  useEffect(() => {
    loadDoctors();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadDoctors = async () => {
    try {
      const res = await doctorService.getAll();
      setDoctors(res.data.filter((d) => d.Name !== "Self"));
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage({ type: "error", text: "Please enter a search term" });
      return;
    }
    try {
      setLoading(true);
      const res = await emergencyCaseService.getAll({ search: searchTerm });
      setCases(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No cases found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysCases = async () => {
    try {
      setLoading(true);
      setSearchTerm("");
      const res = await emergencyCaseService.getAll({ today: true });
      setCases(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No cases found for today" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load cases" });
    } finally {
      setLoading(false);
    }
  };

  const resetCases = () => {
    setSearchTerm("");
    setCases([]);
  };

  const openCreate = () => {
    setEditingCase(null);
    setSelectedPatient(null);
    setMobileSearch("");
    setMobileResults([]);
    setMobileSearched(false);
    reset({
      patientId: "",
      DoctorId: "",
      DepartmentId: "",
      CaseNo: `EMG-${Date.now().toString().slice(-6)}`,
      ArrivalDate: new Date().toISOString().split("T")[0],
      DischargeDate: "",
      Priority: "Urgent",
      Status: "Active",
      ChiefComplaint: "",
      Diagnosis: "",
      Treatment: "",
      Notes: "",
      TotalCharges: 0,
      TotalPaid: 0,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (caseItem) => {
    setEditingCase(caseItem);
    setSelectedPatient(caseItem.patient);
    setMobileSearch("");
    setMobileResults([]);
    setMobileSearched(false);
    reset({
      patientId: caseItem.patientId,
      DoctorId: caseItem.DoctorId || "",
      DepartmentId: caseItem.DepartmentId || "",
      CaseNo: caseItem.CaseNo,
      ArrivalDate: caseItem.ArrivalDate ? new Date(caseItem.ArrivalDate).toISOString().split("T")[0] : "",
      DischargeDate: caseItem.DischargeDate ? new Date(caseItem.DischargeDate).toISOString().split("T")[0] : "",
      Priority: caseItem.Priority,
      Status: caseItem.Status,
      ChiefComplaint: caseItem.ChiefComplaint || "",
      Diagnosis: caseItem.Diagnosis || "",
      Treatment: caseItem.Treatment || "",
      Notes: caseItem.Notes || "",
      TotalCharges: caseItem.TotalCharges,
      TotalPaid: caseItem.TotalPaid,
    });
    setIsDialogOpen(true);
  };

  const openView = (caseItem) => {
    setViewingCase(caseItem);
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
      if (!selectedPatient && !editingCase) {
        setMessage({ type: "error", text: "Please select a patient" });
        return;
      }

      if (editingCase) {
        await emergencyCaseService.update(editingCase.Id, data);
        setMessage({ type: "success", text: "Case updated successfully" });
      } else {
        data.patientId = selectedPatient.id;
        await emergencyCaseService.create(data);
        setMessage({ type: "success", text: "Case created successfully" });
      }
      setIsDialogOpen(false);
      if (searchTerm) {
        handleSearch({ preventDefault: () => {} });
      } else if (cases.length > 0) {
        loadTodaysCases();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this case?")) return;
    try {
      await emergencyCaseService.delete(id);
      setMessage({ type: "success", text: "Case deleted successfully" });
      setCases((prev) => prev.filter((c) => c.Id !== id));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete case" });
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
          <h1 className="text-2xl font-bold text-foreground">Emergency Cases</h1>
          <p className="text-muted-foreground mt-1">Manage emergency department cases</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />New Case
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by Case No, Patient Name, or Mobile"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />Search
          </Button>
        </form>
        <Button variant="outline" onClick={loadTodaysCases} disabled={loading}>
          <CalendarDays className="h-4 w-4 mr-2" />Today's Cases
        </Button>
        <Button variant="ghost" onClick={resetCases} disabled={loading}>
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
        <DataTable columns={columns} data={cases} filterColumn="CaseNo" />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCase ? "Edit Case" : "New Emergency Case"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!editingCase && (
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
                      <Label>Doctor</Label>
                      <Select value={watch("DoctorId")} onValueChange={(val) => setValue("DoctorId", val)}>
                        <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                        <SelectContent>
                          {doctors.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Label>Arrival Date *</Label>
                      <Input type="date" {...register("ArrivalDate")} />
                      {errors.ArrivalDate && <p className="text-sm text-destructive">{errors.ArrivalDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Case No *</Label>
                      <Input {...register("CaseNo")} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Priority *</Label>
                      <Select value={watch("Priority")} onValueChange={(val) => setValue("Priority", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="Urgent">Urgent</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select value={watch("Status")} onValueChange={(val) => setValue("Status", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Discharged">Discharged</SelectItem>
                          <SelectItem value="Transferred">Transferred</SelectItem>
                          <SelectItem value="Deceased">Deceased</SelectItem>
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
                    <Label>Treatment</Label>
                    <Textarea {...register("Treatment")} placeholder="Treatment provided" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Total Charges *</Label>
                      <Input type="number" step="0.01" {...register("TotalCharges")} />
                      {errors.TotalCharges && <p className="text-sm text-destructive">{errors.TotalCharges.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Total Paid *</Label>
                      <Input type="number" step="0.01" {...register("TotalPaid")} />
                      {errors.TotalPaid && <p className="text-sm text-destructive">{errors.TotalPaid.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Balance</Label>
                      <Input
                        type="number"
                        value={totalCharges - totalPaid}
                        disabled
                        className={totalCharges - totalPaid > 0 ? "text-red-600" : "text-green-600"}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCase ? "Update" : "Create"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isViewDialogOpen && viewingCase && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Case Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Case No</p>
                  <p className="font-medium">{viewingCase.CaseNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Arrival Date</p>
                  <p className="font-medium">
                    {formatDate(viewingCase.ArrivalDate)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{viewingCase.patient?.pName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Doctor</p>
                  <p className="font-medium">{viewingCase.doctor?.Name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <Badge className={priorityColors[viewingCase.Priority]}>
                    {viewingCase.Priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[viewingCase.Status]}>
                    {viewingCase.Status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Charges</p>
                  <p className="font-medium">{Number(viewingCase.TotalCharges).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-medium text-green-600">{Number(viewingCase.TotalPaid).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className={`font-medium ${viewingCase.Balance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {Number(viewingCase.Balance).toLocaleString()}
                  </p>
                </div>
              </div>
              {viewingCase.ChiefComplaint && (
                <div>
                  <p className="text-sm text-muted-foreground">Chief Complaint</p>
                  <p className="text-sm">{viewingCase.ChiefComplaint}</p>
                </div>
              )}
              {viewingCase.Diagnosis && (
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="text-sm">{viewingCase.Diagnosis}</p>
                </div>
              )}
              {viewingCase.Treatment && (
                <div>
                  <p className="text-sm text-muted-foreground">Treatment</p>
                  <p className="text-sm">{viewingCase.Treatment}</p>
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
