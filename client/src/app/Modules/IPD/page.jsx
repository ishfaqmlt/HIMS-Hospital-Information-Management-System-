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
import { ipdAdmissionSchema } from "@/lib/zodeSchema";
import ipdAdmissionService from "@/services/ipdAdmission.service";
import patientService from "@/services/patient.service";
import doctorService from "@/services/doctor.service";
import floorService from "@/services/floorService";
import roomsWardsService from "@/services/roomsWardsService";
import bedMasterService from "@/services/bedMasterService";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { Loader2, Plus, Search, CalendarDays, Eye, UserPlus } from "lucide-react";

export default function IPDPage() {
  const [loading, setLoading] = useState(false);
  const [admissions, setAdmissions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [floors, setFloors] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [allBeds, setAllBeds] = useState([]);
  const [filteredBeds, setFilteredBeds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [viewingAdmission, setViewingAdmission] = useState(null);

  const [mrnSearch, setMrnSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchSearched, setSearchSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedMrn, setSelectedMrn] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ipdAdmissionSchema),
    defaultValues: {
      mrn: "",
      DoctorId: "",
      AdmissionNo: "",
      AdmissionDate: new Date().toISOString().slice(0, 16),
      DischargeDate: "",
      FloorId: "",
      RoomWardId: "",
      bedId: "",
      AdmissionType: "Elective",
      Status: "Admitted",
      ChiefComplaint: "",
      Diagnosis: "",
      TreatmentPlan: "",
      DischargeSummary: "",
      TotalCharges: 0,
      Discount: 0,
      PayableAmount: 0,
      TotalPaid: 0,
      Balance: 0,
    },
  });

  const floorValue = watch("FloorId");
  const roomValue = watch("RoomWardId");
  const bedValue = watch("bedId");
  const totalCharges = watch("TotalCharges");
  const discount = watch("Discount");
  const totalPaid = watch("TotalPaid");

  useEffect(() => { loadDoctors(); loadFloors(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (floorValue) {
      const filtered = allRooms.filter((r) => r.floorId === floorValue);
      setFilteredRooms(filtered);
      if (roomValue && !filtered.find((r) => r.id === roomValue)) {
        setValue("RoomWardId", "");
        setValue("bedId", "");
        setFilteredBeds([]);
      }
    } else {
      setFilteredRooms([]);
      setFilteredBeds([]);
    }
  }, [floorValue, allRooms]);

  useEffect(() => {
    if (roomValue) {
      const filtered = allBeds.filter((b) => b.roomWardId === roomValue);
      setFilteredBeds(filtered);
      if (bedValue && !filtered.find((b) => b.id === bedValue)) {
        setValue("bedId", "");
      }
    } else {
      setFilteredBeds([]);
    }
  }, [roomValue, allBeds]);

  useEffect(() => {
    const payable = (Number(totalCharges) || 0) - (Number(discount) || 0);
    setValue("PayableAmount", payable);
    setValue("Balance", payable - (Number(totalPaid) || 0));
  }, [totalCharges, discount, totalPaid]);

  const loadDoctors = async () => {
    try {
      const res = await doctorService.getAll();
      setDoctors(res.data.filter((d) => d.Name !== "Self"));
    } catch (error) {
      console.error(error);
    }
  };

  const loadFloors = async () => {
    try {
      const [fRes, rRes, bRes] = await Promise.all([
        floorService.getAll(),
        roomsWardsService.getAll(),
        bedMasterService.getAll(),
      ]);
      setFloors(fRes.data);
      setAllRooms(rRes.data);
      setAllBeds(bRes.data);
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
      const res = await ipdAdmissionService.getAll({ search: searchTerm });
      setAdmissions(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No admissions found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const loadTodaysAdmissions = async () => {
    try {
      setLoading(true);
      setSearchTerm("");
      const res = await ipdAdmissionService.getAll({ today: true });
      setAdmissions(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No admissions found for today" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load admissions" });
    } finally {
      setLoading(false);
    }
  };

  const resetAdmissions = () => {
    setSearchTerm("");
    setAdmissions([]);
  };

  const openCreate = () => {
    setEditingAdmission(null);
    setSelectedPatient(null);
    setSelectedMrn(null);
    setMrnSearch("");
    setSearchResults([]);
    setSearchSearched(false);
    setFilteredRooms([]);
    setFilteredBeds([]);
    reset({
      mrn: "",
      DoctorId: "",
      AdmissionNo: "",
      AdmissionDate: new Date().toISOString().slice(0, 16),
      DischargeDate: "",
      FloorId: "",
      RoomWardId: "",
      bedId: "",
      AdmissionType: "Elective",
      Status: "Admitted",
      ChiefComplaint: "",
      Diagnosis: "",
      TreatmentPlan: "",
      DischargeSummary: "",
      TotalCharges: 0,
      Discount: 0,
      PayableAmount: 0,
      TotalPaid: 0,
      Balance: 0,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (admission) => {
    setEditingAdmission(admission);
    setSelectedPatient(admission.patientVisit?.patient || null);
    setSelectedMrn(admission.mrn);
    setMrnSearch("");
    setSearchResults([]);
    setSearchSearched(false);

    const filteredR = allRooms.filter((r) => r.floorId === admission.FloorId);
    setFilteredRooms(filteredR);
    const filteredB = allBeds.filter((b) => b.roomWardId === admission.RoomWardId);
    setFilteredBeds(filteredB);

    reset({
      mrn: admission.mrn,
      DoctorId: admission.DoctorId,
      AdmissionNo: admission.AdmissionNo,
      AdmissionDate: admission.AdmissionDate ? new Date(admission.AdmissionDate).toISOString().slice(0, 16) : "",
      DischargeDate: admission.DischargeDate ? new Date(admission.DischargeDate).toISOString().slice(0, 16) : "",
      FloorId: admission.FloorId || "",
      RoomWardId: admission.RoomWardId || "",
      bedId: admission.bedId || "",
      AdmissionType: admission.AdmissionType,
      Status: admission.Status,
      ChiefComplaint: admission.ChiefComplaint || "",
      Diagnosis: admission.Diagnosis || "",
      TreatmentPlan: admission.TreatmentPlan || "",
      DischargeSummary: admission.DischargeSummary || "",
      TotalCharges: admission.TotalCharges,
      Discount: admission.Discount,
      PayableAmount: admission.PayableAmount,
      TotalPaid: admission.TotalPaid,
      Balance: admission.Balance,
    });
    setIsDialogOpen(true);
  };

  const openView = (admission) => {
    setViewingAdmission(admission);
    setIsViewDialogOpen(true);
  };

  const handlePatientSearch = async () => {
    const searchTerm = "mrn-" + mrnSearch;

    if (!mrnSearch.trim()) {
      setMessage({ type: "error", text: "Please enter an MRN" });
      return;
    }
    try {
      const res = await patientService.getAll({ mrn: searchTerm, hasVisit: true });
      setSearchResults(res.data);
      setSearchSearched(true);
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    }
  };

  const selectExistingPatient = (patient) => {
    setSelectedPatient(patient);
    setSelectedMrn("mrn-" + mrnSearch);
    setValue("mrn", "mrn-" + mrnSearch);
  };

  const handlePatientAdded = (newPatient) => {
    setSelectedPatient(newPatient);
    setIsPatientDialogOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      if (!selectedPatient && !editingAdmission) {
        setMessage({ type: "error", text: "Please select a patient" });
        return;
      }

      data.Balance = (Number(data.PayableAmount) || 0) - (Number(data.TotalPaid) || 0);

      if (editingAdmission) {
        await ipdAdmissionService.update(editingAdmission.Id, data);
        setMessage({ type: "success", text: "Admission updated successfully" });
      } else {
        await ipdAdmissionService.create(data);
        setMessage({ type: "success", text: "Admission created successfully" });
      }
      setIsDialogOpen(false);
      if (searchTerm) {
        handleSearch({ preventDefault: () => {} });
      } else if (admissions.length > 0) {
        loadTodaysAdmissions();
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this admission?")) return;
    try {
      await ipdAdmissionService.delete(id);
      setMessage({ type: "success", text: "Admission deleted successfully" });
      setAdmissions((prev) => prev.filter((a) => a.Id !== id));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete admission" });
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
          <h1 className="text-2xl font-bold text-foreground">IPD Admissions</h1>
          <p className="text-muted-foreground mt-1">Manage inpatient department admissions</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />New Admission
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by Admission No, Patient Name, or MRN"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />Search
          </Button>
        </form>
        <Button variant="outline" onClick={loadTodaysAdmissions} disabled={loading}>
          <CalendarDays className="h-4 w-4 mr-2" />Today&apos;s Admissions
        </Button>
        <Button variant="ghost" onClick={resetAdmissions} disabled={loading}>
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
        <DataTable columns={columns} data={admissions} filterColumn="mrn" />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAdmission ? "Edit Admission" : "New Admission"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!editingAdmission && (
                <>
                  {!selectedPatient ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Search by MRN</Label>
                        <div className="flex gap-1">
                          <div className="flex items-center h-9 px-2 text-xs bg-muted border border-input rounded-md text-muted-foreground shrink-0">
                            mrn-
                          </div>
                          <Input
                            placeholder=""
                            value={mrnSearch}
                            onChange={(e) => setMrnSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handlePatientSearch())}
                          />
                          <Button type="button" onClick={handlePatientSearch} disabled={!mrnSearch.trim()}>
                            <Search className="h-4 w-4 mr-2" />Search
                          </Button>
                        </div>
                      </div>

                      {searchSearched && (
                        <div className="space-y-3">
                          {searchResults.length > 0 ? (
                            <>
                              <p className="text-sm text-muted-foreground">
                                {searchResults.length} patient(s) found. Select or add new:
                              </p>
                              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                                {searchResults.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                                    onClick={() => selectExistingPatient(p)}
                                  >
                                    <div>
                                      <p className="font-medium">{p.pName}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {p.patientId} | {p.mobile} | {p.cnic || "No CNIC"}
                                      </p>
                                    </div>
                                    <Button type="button" size="sm" variant="outline">Select</Button>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-muted-foreground py-4">No patients found</p>
                          )}
                          <Button type="button" variant="outline" className="w-full" onClick={() => setIsPatientDialogOpen(true)}>
                            <UserPlus className="h-4 w-4 mr-2" />Add New Patient
                          </Button>
                        </div>
                      )}

                      {!searchSearched && (
                        <Button type="button" variant="outline" className="w-full" onClick={() => setIsPatientDialogOpen(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />Add New Patient
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center justify-between">
                      <div>
                        Patient: <strong>{selectedPatient.pName}</strong> | MRN: <strong>{selectedMrn}</strong>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedPatient(null); setSelectedMrn(null); setValue("mrn", ""); }}>
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
                      <Label>Admission No *</Label>
                      <Input {...register("AdmissionNo")} placeholder="IPD-0001" />
                      {errors.AdmissionNo && <p className="text-sm text-destructive">{errors.AdmissionNo.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Admission Date *</Label>
                      <Input type="datetime-local" {...register("AdmissionDate")} />
                      {errors.AdmissionDate && <p className="text-sm text-destructive">{errors.AdmissionDate.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Discharge Date</Label>
                      <Input type="datetime-local" {...register("DischargeDate")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Floor *</Label>
                      <Select value={floorValue} onValueChange={(val) => setValue("FloorId", val)}>
                        <SelectTrigger><SelectValue placeholder="Select floor" /></SelectTrigger>
                        <SelectContent>
                          {floors.map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.FloorName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.FloorId && <p className="text-sm text-destructive">{errors.FloorId.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Room/Ward *</Label>
                      <Select value={roomValue} onValueChange={(val) => setValue("RoomWardId", val)} disabled={!floorValue}>
                        <SelectTrigger><SelectValue placeholder={floorValue ? "Select room" : "Select floor first"} /></SelectTrigger>
                        <SelectContent>
                          {filteredRooms.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.RoomWardName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.RoomWardId && <p className="text-sm text-destructive">{errors.RoomWardId.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Bed *</Label>
                      <Select value={bedValue} onValueChange={(val) => setValue("bedId", val)} disabled={!roomValue}>
                        <SelectTrigger><SelectValue placeholder={roomValue ? "Select bed" : "Select room first"} /></SelectTrigger>
                        <SelectContent>
                          {filteredBeds.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.BedNo} (Rs. {b.Rent})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.bedId && <p className="text-sm text-destructive">{errors.bedId.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Admission Type *</Label>
                      <Select value={watch("AdmissionType")} onValueChange={(val) => setValue("AdmissionType", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Elective">Elective</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select value={watch("Status")} onValueChange={(val) => setValue("Status", val)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admitted">Admitted</SelectItem>
                          <SelectItem value="Discharged">Discharged</SelectItem>
                          <SelectItem value="Transferred">Transferred</SelectItem>
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
                    <Label>Treatment Plan</Label>
                    <Textarea {...register("TreatmentPlan")} placeholder="Treatment plan" />
                  </div>

                  <div className="grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Total Charges *</Label>
                      <Input type="number" step="0.01" {...register("TotalCharges")} />
                      {errors.TotalCharges && <p className="text-sm text-destructive">{errors.TotalCharges.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Discount *</Label>
                      <Input type="number" step="0.01" {...register("Discount")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payable</Label>
                      <Input type="number" step="0.01" value={watch("PayableAmount")} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Paid *</Label>
                      <Input type="number" step="0.01" {...register("TotalPaid")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Balance</Label>
                      <Input
                        type="number"
                        value={watch("Balance")}
                        disabled
                        className={watch("Balance") > 0 ? "text-red-600" : "text-green-600"}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAdmission ? "Update" : "Create"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isViewDialogOpen && viewingAdmission && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Admission Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Admission No</p>
                  <p className="font-medium">{viewingAdmission.AdmissionNo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">MRN</p>
                  <p className="font-medium">{viewingAdmission.mrn}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Patient</p>
                  <p className="font-medium">{viewingAdmission.patientVisit?.patient?.pName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Doctor</p>
                  <p className="font-medium">{viewingAdmission.doctor?.Name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Floor</p>
                  <p className="font-medium">{viewingAdmission.floor?.FloorName || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Room/Ward</p>
                  <p className="font-medium">{viewingAdmission.roomWard?.RoomWardName || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bed</p>
                  <p className="font-medium">{viewingAdmission.bed?.BedNo || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge variant="outline">{viewingAdmission.AdmissionType}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[viewingAdmission.Status]}>
                    {viewingAdmission.Status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payable</p>
                  <p className="font-medium">{Number(viewingAdmission.PayableAmount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-medium text-green-600">{Number(viewingAdmission.TotalPaid).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className={`font-medium ${viewingAdmission.Balance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {Number(viewingAdmission.Balance).toLocaleString()}
                  </p>
                </div>
              </div>
              {viewingAdmission.ChiefComplaint && (
                <div>
                  <p className="text-sm text-muted-foreground">Chief Complaint</p>
                  <p className="text-sm">{viewingAdmission.ChiefComplaint}</p>
                </div>
              )}
              {viewingAdmission.Diagnosis && (
                <div>
                  <p className="text-sm text-muted-foreground">Diagnosis</p>
                  <p className="text-sm">{viewingAdmission.Diagnosis}</p>
                </div>
              )}
              {viewingAdmission.TreatmentPlan && (
                <div>
                  <p className="text-sm text-muted-foreground">Treatment Plan</p>
                  <p className="text-sm">{viewingAdmission.TreatmentPlan}</p>
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
      />
    </div>
  );
}
