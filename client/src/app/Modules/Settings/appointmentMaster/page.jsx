"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentMasterSchema } from "@/lib/zodeSchema";
import appointmentMasterService from "@/services/appointmentMasterService";
import doctorService from "@/services/doctor.service";
import { Loader2, Plus } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(appointmentMasterSchema),
    defaultValues: {
      DoctorId: "",
      DayOfWeek: "",
      StartTime: "",
      EndTime: "",
      SlotTime: 15,
      BookingType: "Advance",
      SilentSlots: 0,
      MaxBookings: 0,
      isSynced: false,
    },
  });

  const doctorValue = watch("DoctorId");
  const dayValue = watch("DayOfWeek");
  const bookingTypeValue = watch("BookingType");

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sRes, dRes] = await Promise.all([
        appointmentMasterService.getAll(),
        doctorService.getAll(),
      ]);
      setSchedules(sRes.data);
      setDoctors(dRes.data.filter((d) => d.Name !== "Self"));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({
      DoctorId: "", DayOfWeek: "", StartTime: "", EndTime: "",
      SlotTime: 15, BookingType: "Advance", SilentSlots: 0, MaxBookings: 0, isSynced: false,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.Id);
    reset({
      DoctorId: item.DoctorId || "",
      DayOfWeek: item.DayOfWeek || "",
      StartTime: item.StartTime || "",
      EndTime: item.EndTime || "",
      SlotTime: item.SlotTime || 15,
      BookingType: item.BookingType || "Advance",
      SilentSlots: item.SilentSlots || 0,
      MaxBookings: item.MaxBookings || 0,
      isSynced: item.isSynced ?? false,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await appointmentMasterService.update(editingId, data);
        setMessage({ type: "success", text: "Schedule updated" });
      } else {
        await appointmentMasterService.create(data);
        setMessage({ type: "success", text: "Schedule created" });
      }
      setIsDialogOpen(false);
      loadAll();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await appointmentMasterService.delete(id);
      setMessage({ type: "success", text: "Schedule deleted" });
      loadAll();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const columns = getColumns({ onEdit: openEdit, onDelete: handleDelete });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointment Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage doctor appointment schedules</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Schedule</Button>
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
        <DataTable columns={columns} data={schedules} />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Schedule" : "Add Schedule"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select value={doctorValue} onValueChange={(val) => setValue("DoctorId", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.DoctorId && <p className="text-sm text-destructive">{errors.DoctorId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Day of Week *</Label>
                <Select value={dayValue} onValueChange={(val) => setValue("DayOfWeek", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.DayOfWeek && <p className="text-sm text-destructive">{errors.DayOfWeek.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input type="time" {...register("StartTime")} />
                  {errors.StartTime && <p className="text-sm text-destructive">{errors.StartTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input type="time" {...register("EndTime")} />
                  {errors.EndTime && <p className="text-sm text-destructive">{errors.EndTime.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Time (minutes) *</Label>
                  <Input type="number" min="1" {...register("SlotTime")} />
                  {errors.SlotTime && <p className="text-sm text-destructive">{errors.SlotTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Booking Type *</Label>
                  <Select value={bookingTypeValue} onValueChange={(val) => setValue("BookingType", val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same day">Same Day</SelectItem>
                      <SelectItem value="advance">Advance</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.BookingType && <p className="text-sm text-destructive">{errors.BookingType.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Silent Slots</Label>
                  <Input type="number" min="0" {...register("SilentSlots")} />
                </div>
                <div className="space-y-2">
                  <Label>Max Bookings</Label>
                  <Input type="number" min="0" {...register("MaxBookings")} />
                </div>
              </div>
             
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
