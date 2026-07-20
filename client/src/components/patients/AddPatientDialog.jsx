"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";

export default function AddPatientDialog({ open, onOpenChange, onPatientAdded, editingPatient = null, prefillMobile = "", prefillCnic = "" }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isEditing = !!editingPatient;

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
      year: 0,
      month: 0,
      day: 0,
      address: "",
      cnic: "",
      mobile: "",
      email: "",
      allergy: "",
      isActive: true,
    },
  });

  const genderValue = watch("gender");
  const dobValue = watch("dob");
  const yearValue = watch("year");
  const monthValue = watch("month");
  const dayValue = watch("day");

  useEffect(() => {
    if (!open) return;

    if (editingPatient) {
      let yr = 0, mo = 0, dy = 0;
      if (editingPatient.dob) {
        const dob = new Date(editingPatient.dob);
        const today = new Date();
        yr = today.getFullYear() - dob.getFullYear();
        mo = today.getMonth() - dob.getMonth();
        dy = today.getDate() - dob.getDate();
        if (dy < 0) { mo--; dy += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
        if (mo < 0) { yr--; mo += 12; }
      }
      reset({
        pName: editingPatient.pName || "",
        gName: editingPatient.gName || "",
        gender: editingPatient.gender || "",
        dob: editingPatient.dob ? editingPatient.dob.split("T")[0] : "",
        year: yr, month: mo, day: dy,
        address: editingPatient.address || "",
        cnic: editingPatient.cnic || "",
        mobile: editingPatient.mobile || "",
        email: editingPatient.email || "",
        allergy: editingPatient.allergy || "",
        isActive: editingPatient.isActive ?? true,
      });
    } else {
      reset({
        pName: "",
        gName: "",
        gender: "",
        dob: "",
        year: 0,
        month: 0,
        day: 0,
        address: "",
        cnic: prefillCnic,
        mobile: prefillMobile,
        email: "",
        allergy: "",
        isActive: true,
      });
    }
    setMessage(null);
  }, [open, editingPatient, prefillMobile, prefillCnic, reset]);

  const handleAgeChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setValue(field, numValue);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();

    const yr = field === "year" ? numValue : (yearValue || 0);
    const mo = field === "month" ? numValue : (monthValue || 0);
    const dy = field === "day" ? numValue : (dayValue || 0);

    const dobDate = new Date(currentYear - yr, currentMonth - mo, currentDay - dy);
    const dobStr = dobDate.toISOString().split("T")[0];
    setValue("dob", dobStr);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { year, month, day, ...submitData } = data;

      if (isEditing) {
        await patientService.update(editingPatient.id, submitData);
        setMessage({ type: "success", text: "Patient updated successfully" });
      } else {
        await patientService.create(submitData);
        setMessage({ type: "success", text: "Patient created successfully" });
      }

      if (onPatientAdded) {
        onPatientAdded();
      }
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setMessage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Patient" : "Add New Patient"}</DialogTitle>
        </DialogHeader>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pName">Patient Name *</Label>
              <Input id="pName" {...register("pName")} placeholder="Patient name" />
              {errors.pName && <p className="text-sm text-destructive">{errors.pName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gName">Guardian Name</Label>
              <Input id="gName" {...register("gName")} placeholder="Guardian name" />
              {errors.gName && <p className="text-sm text-destructive">{errors.gName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={genderValue} onValueChange={(val) => setValue("gender", val)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
              {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Year(s)</Label>
              <Input type="number" min="0" value={yearValue} onChange={(e) => handleAgeChange("year", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Month(s)</Label>
              <Input type="number" min="0" max="11" value={monthValue} onChange={(e) => handleAgeChange("month", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Day(s)</Label>
              <Input type="number" min="0" max="31" value={dayValue} onChange={(e) => handleAgeChange("day", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" {...register("mobile")} placeholder="Mobile number" />
              {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC</Label>
              <Input id="cnic" {...register("cnic")} placeholder="CNIC number" />
              {errors.cnic && <p className="text-sm text-destructive">{errors.cnic.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} placeholder="Email" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergy">Allergy</Label>
              <Input id="allergy" {...register("allergy")} placeholder="Allergies" />
              {errors.allergy && <p className="text-sm text-destructive">{errors.allergy.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} placeholder="Address" />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update Patient" : "Create Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
