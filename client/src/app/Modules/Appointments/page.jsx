"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { useForm } from "react-hook-form";
import doctorService from "@/services/doctor.service";
import patientAppointmentService from "@/services/patientAppointmentService";
import appointmentMasterService from "@/services/appointmentMasterService";
import patientService from "@/services/patient.service";
import { Loader2, RefreshCw, AlertCircle, Search, UserPlus, ArrowLeft } from "lucide-react";

const statusOptions = ["All", "Pending", "Booked", "Cancelled", "Completed"];

const statusColors = {
  Empty: "bg-gray-50 text-gray-400 border-gray-200",
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Booked: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
  Completed: "bg-blue-100 text-blue-800 border-blue-300",
};

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [searchType, setSearchType] = useState("mobile");
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    pName: "",
    mobile: "",
    cnic: "",
    gender: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      Appointmentat: "",
      TokenNo: 1,
      Status: "Pending",
      Remarks: "",
    },
  });

  useEffect(() => {
    loadDoctors();
    loadPatients();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadDoctors = async () => {
    try {
      const res = await doctorService.getAll({ opd: true });
      setDoctors(res.data.filter((d) => d.Name !== "Self"));
    } catch (error) {
      console.error(error);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await patientService.getAll();
      setPatients(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefresh = async () => {
    if (!selectedDoctor) {
      setMessage({ type: "error", text: "Please select a doctor" });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      setMessage({ type: "error", text: "Cannot select a past date" });
      return;
    }

    try {
      setLoading(true);
      setSlots([]);

      const dayOfWeek = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });

      const scheduleRes = await appointmentMasterService.getAll({
        DoctorId: selectedDoctor,
      });

      const schedule = scheduleRes.data.find((s) => s.DayOfWeek === dayOfWeek);

      if (!schedule) {
        setMessage({ type: "error", text: `No schedule found for ${dayOfWeek}` });
        setLoading(false);
        return;
      }

      const aptsRes = await patientAppointmentService.getAll({
        DoctorId: selectedDoctor,
        date: selectedDate,
      });

      let appointments = aptsRes.data;
      if (selectedStatus !== "All") {
        appointments = appointments.filter((a) => a.Status === selectedStatus);
      }

      const maxBookings = schedule.MaxBookings || 0;
      const slotsList = [];

      for (let i = 1; i <= maxBookings; i++) {
        const apt = appointments.find((a) => a.TokenNo === i);
        slotsList.push({
          tokenNo: i,
          appointment: apt || null,
          status: apt ? apt.Status : "Empty",
        });
      }

      setSlots(slotsList);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load appointments" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = (tokenNo) => {
    setSelectedSlot(tokenNo);
    setSearchType("mobile");
    setSearchValue("");
    setSearchResults([]);
    setSearched(false);
    setSelectedPatient(null);
    setShowAddPatientForm(false);
    setNewPatient({ pName: "", mobile: "", cnic: "", gender: "" });
    reset({
      Appointmentat: `${selectedDate}T${new Date().toTimeString().slice(0, 5)}`,
      TokenNo: tokenNo,
      Status: "Pending",
      Remarks: "",
    });
    setIsDialogOpen(true);
  };

  const handlePatientSearch = async () => {
    if (!searchValue.trim()) {
      const searchTypeLabels = { mobile: "mobile number", patientId: "patient ID", cnic: "CNIC" };
      setMessage({ type: "error", text: `Please enter a ${searchTypeLabels[searchType]}` });
      return;
    }
    try {
      const res = await patientService.getAll({ search: searchValue });
      setSearchResults(res.data);
      setSearched(true);
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    }
  };

  const selectExistingPatient = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCreatePatient = async () => {
    if (!newPatient.pName.trim()) {
      setMessage({ type: "error", text: "Patient name is required" });
      return;
    }
    try {
      setLoading(true);
      const res = await patientService.create({
        pName: newPatient.pName,
        mobile: newPatient.mobile,
        cnic: newPatient.cnic,
        gender: newPatient.gender,
      });
      setSelectedPatient(res.data);
      setShowAddPatientForm(false);
      setNewPatient({ pName: "", mobile: "", cnic: "", gender: "" });
      setMessage({ type: "success", text: "Patient created successfully" });
      loadPatients();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to create patient" });
    } finally {
      setLoading(false);
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case "patientId": return "Enter Patient ID (e.g., pid-18-0726)";
      case "cnic": return "Enter CNIC number";
      case "mobile":
      default: return "Enter mobile number";
    }
  };

  const onSubmit = async (data) => {
    if (!selectedPatient) {
      setMessage({ type: "error", text: "Please select a patient" });
      return;
    }

    try {
      await patientAppointmentService.create({
        DoctorId: selectedDoctor,
        patientId: selectedPatient.id,
        Appointmentat: data.Appointmentat,
        TokenNo: data.TokenNo,
        Status: data.Status,
        Remarks: data.Remarks,
      });
      setMessage({ type: "success", text: "Appointment created" });
      setIsDialogOpen(false);
      handleRefresh();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const apt = slots.find((s) => s.appointment?.Id === appointmentId)?.appointment;
      if (!apt) return;

      await patientAppointmentService.update(appointmentId, {
        DoctorId: apt.DoctorId,
        patientId: apt.patientId,
        Appointmentat: apt.Appointmentat,
        TokenNo: apt.TokenNo,
        Status: newStatus,
        Remarks: apt.Remarks,
      });
      setMessage({ type: "success", text: `Appointment ${newStatus}` });
      handleRefresh();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage patient appointments</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.type === "error" && <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Doctor *</Label>
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="space-y-2">
          <Label>Status Filter</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <Button onClick={handleRefresh} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Load Appointments
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : slots.length > 0 ? (
        <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-15 gap-2">
          {slots.map((slot) => (
            <Card
              key={slot.tokenNo}
              className={`cursor-pointer hover:shadow-md transition-all ${statusColors[slot.status]}`}
              onClick={() => {
                if (slot.status === "Empty") {
                  openCreate(slot.tokenNo);
                }
              }}
            >
              <CardContent className="p-2 text-center">
                <p className="text-xs font-bold mb-1">#{slot.tokenNo}</p>
                {slot.appointment ? (
                  <>
                    <p className="text-xs font-medium truncate">{slot.appointment.patient?.pName}</p>
                    <Badge variant="outline" className={`text-[10px] mt-1 ${statusColors[slot.status]}`}>
                      {slot.status}
                    </Badge>
                    <div className="flex gap-1 mt-1 justify-center">
                      {slot.status === "Pending" && (
                        <>
                          <Button size="sm" variant="outline" className="h-5 w-5 p-0 text-[10px]"
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(slot.appointment.Id, "Booked"); }}>
                            B
                          </Button>
                          <Button size="sm" variant="destructive" className="h-5 w-5 p-0 text-[10px]"
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(slot.appointment.Id, "Cancelled"); }}>
                            C
                          </Button>
                        </>
                      )}
                      {slot.status === "Booked" && (
                        <Button size="sm" variant="outline" className="h-5 w-5 p-0 text-[10px]"
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(slot.appointment.Id, "Completed"); }}>
                          ✓
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-[10px] text-muted-foreground">Empty</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : selectedDoctor && selectedDate ? (
        <div className="text-center py-12 text-muted-foreground">
          Click Load Appointments to view slots
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select a doctor and date, then click Load Appointments
        </div>
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Book Token #{selectedSlot}</DialogTitle>
            </DialogHeader>

            {!selectedPatient ? (
              <div className="space-y-4">
                {showAddPatientForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddPatientForm(false)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h3 className="font-medium">Add New Patient</h3>
                    </div>

                    <div className="space-y-2">
                      <Label>Patient Name *</Label>
                      <Input
                        placeholder="Enter patient name"
                        value={newPatient.pName}
                        onChange={(e) => setNewPatient({ ...newPatient, pName: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mobile</Label>
                        <Input
                          placeholder="Mobile number"
                          value={newPatient.mobile}
                          onChange={(e) => setNewPatient({ ...newPatient, mobile: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CNIC</Label>
                        <Input
                          placeholder="CNIC number"
                          value={newPatient.cnic}
                          onChange={(e) => setNewPatient({ ...newPatient, cnic: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={newPatient.gender} onValueChange={(val) => setNewPatient({ ...newPatient, gender: val })}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddPatientForm(false)}>Cancel</Button>
                      <Button type="button" onClick={handleCreatePatient} disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Patient
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Search By</Label>
                      <Select value={searchType} onValueChange={setSearchType}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile">Mobile Number</SelectItem>
                          <SelectItem value="patientId">Patient ID</SelectItem>
                          <SelectItem value="cnic">CNIC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder={getSearchPlaceholder()}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handlePatientSearch())}
                      />
                      <Button onClick={handlePatientSearch}>
                        <Search className="h-4 w-4 mr-2" />Search
                      </Button>
                    </div>

                    {searched && (
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
                                  <Button size="sm" variant="outline">Select</Button>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="text-center text-muted-foreground py-4">No patients found</p>
                        )}
                        <Button variant="outline" className="w-full" onClick={() => setShowAddPatientForm(true)}>
                          <UserPlus className="h-4 w-4 mr-2" />Add New Patient
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  Patient: <strong>{selectedPatient.pName}</strong> ({selectedPatient.patientId})
                </div>

                <div className="space-y-2">
                  <Label>Date & Time *</Label>
                  <Input type="datetime-local" {...register("Appointmentat")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Token No</Label>
                    <Input type="number" {...register("TokenNo")} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={watch("Status")} onValueChange={(val) => setValue("Status", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Input {...register("Remarks")} placeholder="Optional remarks" />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setSelectedPatient(null)}>
                    Back
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Book</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
