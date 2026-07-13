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
import { serviceSchema } from "@/lib/zodeSchema";
import serviceService from "@/services/serviceService";
import departmentService from "@/services/department.service";
import { Loader2, Plus } from "lucide-react";

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
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
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      DepartmentId: "",
      ServiceName: "",
      DefaultCharges: 0,
      isActive: true,
      printToken: false,
    },
  });

  const deptValue = watch("DepartmentId");

  useEffect(() => { loadServices(); loadDepartments(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await serviceService.getAll();
      setServices(res.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load services" });
    } finally {
      setLoading(false);
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

  const openCreate = () => {
    setEditingId(null);
    reset({ DepartmentId: "", ServiceName: "", DefaultCharges: 0, isActive: true, printToken: false });
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    reset({
      DepartmentId: item.DepartmentId || "",
      ServiceName: item.ServiceName || "",
      DefaultCharges: item.DefaultCharges || 0,
      isActive: item.isActive ?? true,
      printToken: item.printToken ?? false,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await serviceService.update(editingId, data);
        setMessage({ type: "success", text: "Service updated" });
      } else {
        await serviceService.create(data);
        setMessage({ type: "success", text: "Service created" });
      }
      setIsDialogOpen(false);
      loadServices();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await serviceService.delete(id);
      setMessage({ type: "success", text: "Service deleted" });
      loadServices();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const columns = getColumns({ onEdit: openEdit, onDelete: handleDelete });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground mt-1">Manage hospital services</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Service</Button>
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
        <DataTable columns={columns} data={services} filterColumn="ServiceName" />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select value={deptValue} onValueChange={(val) => setValue("DepartmentId", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.DepartmentName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.DepartmentId && <p className="text-sm text-destructive">{errors.DepartmentId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input {...register("ServiceName")} placeholder="Service name" />
              {errors.ServiceName && <p className="text-sm text-destructive">{errors.ServiceName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Default Charges *</Label>
              <Input type="number" min="0" step="0.01" {...register("DefaultCharges")} placeholder="0.00" />
              {errors.DefaultCharges && <p className="text-sm text-destructive">{errors.DefaultCharges.message}</p>}
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="isActive" checked={watch("isActive")} onCheckedChange={(val) => setValue("isActive", val)} />
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="printToken" checked={watch("printToken")} onCheckedChange={(val) => setValue("printToken", val)} />
                <Label htmlFor="printToken" className="cursor-pointer">Print Token</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
