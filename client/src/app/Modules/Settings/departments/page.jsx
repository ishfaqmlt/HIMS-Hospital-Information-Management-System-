"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { departmentSchema } from "@/lib/zodeSchema";
import departmentService from "@/services/department.service";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

export default function DepartmentsPage() {
  const [loading, setLoading] = useState(true);
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
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      DepartmentName: "",
      ServingBy: "",
      isActive: true,
    },
  });

  const servingByValue = watch("ServingBy");

  useEffect(() => { loadDepartments(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load departments" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({ DepartmentName: "", ServingBy: "", isActive: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    reset({
      DepartmentName: item.DepartmentName || "",
      ServingBy: item.ServingBy || "",
      isActive: item.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await departmentService.update(editingId, data);
        setMessage({ type: "success", text: "Department updated" });
      } else {
        await departmentService.create(data);
        setMessage({ type: "success", text: "Department created" });
      }
      setIsDialogOpen(false);
      loadDepartments();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await departmentService.delete(id);
      setMessage({ type: "success", text: "Department deleted" });
      loadDepartments();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const columns = [
    { accessorKey: "DepartmentName", header: "Department Name" },
    { accessorKey: "ServingBy", header: "Serving By" },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return <Badge variant={isActive ? "default" : "destructive"}>{isActive ? "Active" : "Inactive"}</Badge>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            {/* <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button> */}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage hospital departments</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Department</Button>
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
        <DataTable columns={columns} data={departments} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input {...register("DepartmentName")} placeholder="Enter department name" />
              {errors.DepartmentName && <p className="text-sm text-destructive">{errors.DepartmentName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Serving By *</Label>
              <Select value={servingByValue} onValueChange={(val) => setValue("ServingBy", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select serving type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                </SelectContent>
              </Select>
              {errors.ServingBy && <p className="text-sm text-destructive">{errors.ServingBy.message}</p>}
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
