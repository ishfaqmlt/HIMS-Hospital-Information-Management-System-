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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "@/lib/zodeSchema";
import patientService from "@/services/patient.service";
import { Loader2, Plus } from "lucide-react";

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
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
    resolver: zodResolver(patientSchema),
    defaultValues: {
      pName: "",
      gName: "",
      gender: "",
      dob: "",
      address: "",
      cnic: "",
      mobile: "",
      email: "",
      allergy: "",
      isActive: true,
    },
  });

  const genderValue = watch("gender");

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await patientService.getAll();
      setPatients(res.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load patients." });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({
      pName: "",
      gName: "",
      gender: "",
      dob: "",
      address: "",
      cnic: "",
      mobile: "",
      email: "",
      allergy: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (patient) => {
    setEditingId(patient.id);
    reset({
      pName: patient.pName || "",
      gName: patient.gName || "",
      gender: patient.gender || "",
      dob: patient.dob ? patient.dob.split("T")[0] : "",
      address: patient.address || "",
      cnic: patient.cnic || "",
      mobile: patient.mobile || "",
      email: patient.email || "",
      allergy: patient.allergy || "",
      isActive: patient.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await patientService.update(editingId, data);
        setMessage({ type: "success", text: "Patient updated successfully" });
      } else {
        await patientService.create(data);
        setMessage({ type: "success", text: "Patient created successfully" });
      }
      setIsDialogOpen(false);
      loadPatients();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    try {
      await patientService.delete(id);
      setMessage({ type: "success", text: "Patient deleted successfully" });
      loadPatients();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete patient" });
    }
  };

  const columns = getColumns({ onEdit: openEdit, onDelete: handleDelete });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Manage patient records
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={patients} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Patient" : "Add Patient"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pName">Patient Name *</Label>
                <Input id="pName" {...register("pName")} placeholder="Patient name" />
                {errors.pName && (
                  <p className="text-sm text-destructive">{errors.pName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gName">Guardian Name</Label>
                <Input id="gName" {...register("gName")} placeholder="Guardian name" />
                {errors.gName && (
                  <p className="text-sm text-destructive">{errors.gName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={genderValue}
                  onValueChange={(val) => setValue("gender", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" {...register("dob")} />
                {errors.dob && (
                  <p className="text-sm text-destructive">{errors.dob.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" {...register("mobile")} placeholder="Mobile number" />
                {errors.mobile && (
                  <p className="text-sm text-destructive">{errors.mobile.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input id="cnic" {...register("cnic")} placeholder="CNIC number" />
                {errors.cnic && (
                  <p className="text-sm text-destructive">{errors.cnic.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="Email" />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergy">Allergy</Label>
                <Input id="allergy" {...register("allergy")} placeholder="Allergies" />
                {errors.allergy && (
                  <p className="text-sm text-destructive">{errors.allergy.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} placeholder="Address" />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
