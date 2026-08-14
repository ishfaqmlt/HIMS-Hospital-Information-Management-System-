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
import { serviceChargeSchema } from "@/lib/zodeSchema";
import serviceChargeService from "@/services/serviceChargeService";
import doctorService from "@/services/doctor.service";
import serviceService from "@/services/serviceService";
import departmentService from "@/services/department.service";
import { Loader2, Plus } from "lucide-react";

export default function ServiceChargesPage() {
  const [loading, setLoading] = useState(true);
  const [charges, setCharges] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
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
    resolver: zodResolver(serviceChargeSchema),
    defaultValues: {
      doctorId: "",
      ServiceId: "",
      departmentId: "",
      Charges: 0,
      isSynced: false,
    },
  });

  const doctorValue = watch("doctorId");
  const serviceValue = watch("ServiceId");
  const departmentValue = watch("departmentId");

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cRes, dRes, depRes] = await Promise.all([
        serviceChargeService.getAll(),
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      setCharges(cRes.data);
      setDoctors(dRes.data.filter((d) => d.Name !== "Self"));
      setDepartments(depRes.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const loadServicesByDepartment = async (departmentId) => {
    if (!departmentId) {
      setServices([]);
      return;
    }
    try {
      const res = await serviceService.getAll({ departmentId });
      const filtered = (res.data || []).filter(
        (s) => String(s.DepartmentId) === String(departmentId) || String(s.departmentId) === String(departmentId)
      );
      setServices(filtered);
    } catch (error) {
      console.error(error);
      setServices([]);
    }
  };

  const handleDepartmentChange = (val) => {
    setValue("departmentId", val);
    setValue("ServiceId", "");
    loadServicesByDepartment(val);
  };

  const openCreate = () => {
    setEditingId(null);
    reset({ doctorId: "", ServiceId: "", departmentId: "", Charges: 0, isSynced: false });
    setServices([]);
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.Id);
    reset({
      doctorId: item.doctorId || "",
      ServiceId: item.ServiceId || "",
      departmentId: item.departmentId || "",
      Charges: item.Charges || 0,
      isSynced: item.isSynced ?? false,
    });
    loadServicesByDepartment(item.departmentId);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await serviceChargeService.update(editingId, data);
        setMessage({ type: "success", text: "Service charge updated" });
      } else {
        await serviceChargeService.create(data);
        setMessage({ type: "success", text: "Service charge created" });
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
      await serviceChargeService.delete(id);
      setMessage({ type: "success", text: "Service charge deleted" });
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
          <h1 className="text-2xl font-bold text-foreground">Service Charges</h1>
          <p className="text-muted-foreground mt-1">Manage doctor-specific service charges</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Charge</Button>
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
        <DataTable columns={columns} data={charges} />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Service Charge" : "Add Service Charge"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select value={doctorValue} onValueChange={(val) => setValue("doctorId", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && <p className="text-sm text-destructive">{errors.doctorId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={departmentValue} onValueChange={handleDepartmentChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.DepartmentName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && <p className="text-sm text-destructive">{errors.departmentId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Service *</Label>
                <Select value={serviceValue} onValueChange={(val) => setValue("ServiceId", val)} disabled={!departmentValue}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={departmentValue ? "Select service" : "Select department first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.ServiceName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ServiceId && <p className="text-sm text-destructive">{errors.ServiceId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Charges *</Label>
                <Input type="number" min="0" step="0.01" {...register("Charges")} placeholder="0.00" />
                {errors.Charges && <p className="text-sm text-destructive">{errors.Charges.message}</p>}
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
