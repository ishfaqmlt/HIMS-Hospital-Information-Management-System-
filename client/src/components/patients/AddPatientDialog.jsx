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
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "@/lib/zodeSchema";
import patientService from "@/services/patient.service";
import {
  Loader2,
  User,
  Users,
  Calendar,
  Clock,
  Phone,
  CreditCard,
  Mail,
  MapPin,
  UserPlus,
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

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
      isActive: true,
    },
  });

  const genderValue = watch("gender");
  const dobValue = watch("dob");
  const yearValue = watch("year");
  const monthValue = watch("month");
  const dayValue = watch("day");

  const calculateAgeFromDob = (dobString) => {
    if (!dobString) return { year: 0, month: 0, day: 0 };
    const parts = dobString.split("T")[0].split("-");
    if (parts.length < 3) return { year: 0, month: 0, day: 0 };

    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);

    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) {
      return { year: 0, month: 0, day: 0 };
    }

    const birthDate = new Date(birthYear, birthMonth, birthDay);
    const today = new Date();

    if (birthDate > today) {
      return { year: 0, month: 0, day: 0 };
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += prevMonthDays;
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      year: Math.max(0, years),
      month: Math.max(0, months),
      day: Math.max(0, days),
    };
  };

  useEffect(() => {
    if (!open) return;

    if (editingPatient) {
      let yr = 0, mo = 0, dy = 0;
      if (editingPatient.dob) {
        const age = calculateAgeFromDob(editingPatient.dob);
        yr = age.year;
        mo = age.month;
        dy = age.day;
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
        isActive: true,
      });
    }
    setMessage(null);
  }, [open, editingPatient, prefillMobile, prefillCnic, reset]);

  const handleDobChange = (e) => {
    const val = e.target.value;
    setValue("dob", val, { shouldValidate: true });

    if (val) {
      const { year, month, day } = calculateAgeFromDob(val);
      setValue("year", year);
      setValue("month", month);
      setValue("day", day);
    } else {
      setValue("year", 0);
      setValue("month", 0);
      setValue("day", 0);
    }
  };

  const handleAgeChange = (field, value) => {
    const numValue = parseInt(value, 10) || 0;
    setValue(field, numValue);

    const today = new Date();
    const yr = field === "year" ? numValue : (parseInt(watch("year"), 10) || 0);
    const mo = field === "month" ? numValue : (parseInt(watch("month"), 10) || 0);
    const dy = field === "day" ? numValue : (parseInt(watch("day"), 10) || 0);

    const dobDate = new Date(today.getFullYear() - yr, today.getMonth() - mo, today.getDate() - dy);
    const yyyy = dobDate.getFullYear();
    const mm = String(dobDate.getMonth() + 1).padStart(2, "0");
    const dd = String(dobDate.getDate()).padStart(2, "0");
    const dobStr = `${yyyy}-${mm}-${dd}`;

    setValue("dob", dobStr, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    if (loading) return;
    try {
      setLoading(true);
      const { year, month, day, ...submitData } = data;
      let response;

      if (isEditing) {
        await patientService.update(editingPatient.id, submitData);
        setMessage({ type: "success", text: "Patient updated successfully" });
      } else {
        response = await patientService.create(submitData);
        setMessage({ type: "success", text: "Patient created successfully" });
      }

      if (onPatientAdded) {
        onPatientAdded(isEditing ? editingPatient : response.data);
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
      <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[95vw] md:w-[850px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
        <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Patient" : "Add New Patient"}
          </DialogTitle>

          {isEditing && editingPatient?.mrn && (
            <Badge variant="outline" className="font-mono text-xs font-bold">
              {editingPatient.mrn}
            </Badge>
          )}
        </DialogHeader>

        {message && (
          <div
            className={`p-3 rounded-lg text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Row 1 */}
            <div className="space-y-1.5">
              <Label htmlFor="pName" className="text-xs font-semibold text-slate-700">
                Patient Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="pName"
                {...register("pName")}
                placeholder="Enter patient full name"
                className="h-10 text-sm font-medium"
              />
              {errors.pName && <p className="text-xs text-rose-600">{errors.pName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gName" className="text-xs font-semibold text-slate-700">
                Guardian Name
              </Label>
              <Input
                id="gName"
                {...register("gName")}
                placeholder="Enter guardian / father name"
                className="h-10 text-sm font-medium"
              />
              {errors.gName && <p className="text-xs text-rose-600">{errors.gName.message}</p>}
            </div>

            {/* Row 2 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Gender
              </Label>
              <Select value={genderValue} onValueChange={(val) => setValue("gender", val)}>
                <SelectTrigger className="w-full h-10 text-sm font-medium bg-white">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-rose-600">{errors.gender.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cnic" className="text-xs font-semibold text-slate-700">
                CNIC
              </Label>
              <Input
                id="cnic"
                {...register("cnic")}
                placeholder="e.g. 42101-1234567-1"
                className="h-10 text-sm font-medium"
              />
              {errors.cnic && <p className="text-xs text-rose-600">{errors.cnic.message}</p>}
            </div>

            {/* Row 3 */}
            <div className="space-y-1.5">
              <Label htmlFor="dob" className="text-xs font-semibold text-slate-700">
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                {...register("dob")}
                onChange={handleDobChange}
                className="h-10 text-sm font-medium bg-white"
              />
              {errors.dob && <p className="text-xs text-rose-600">{errors.dob.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">Age</Label>
                <span className="text-[11px] text-muted-foreground font-medium">Years / Months / Days</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Y"
                    value={yearValue ?? 0}
                    onChange={(e) => handleAgeChange("year", e.target.value)}
                    className="h-10 text-sm font-semibold text-center pr-6"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">Y</span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="11"
                    placeholder="M"
                    value={monthValue ?? 0}
                    onChange={(e) => handleAgeChange("month", e.target.value)}
                    className="h-10 text-sm font-semibold text-center pr-6"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">M</span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    max="31"
                    placeholder="D"
                    value={dayValue ?? 0}
                    onChange={(e) => handleAgeChange("day", e.target.value)}
                    className="h-10 text-sm font-semibold text-center pr-6"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">D</span>
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="text-xs font-semibold text-slate-700">
                Mobile
              </Label>
              <Input
                id="mobile"
                {...register("mobile")}
                placeholder="e.g. 0300-1234567"
                className="h-10 text-sm font-medium"
              />
              {errors.mobile && <p className="text-xs text-rose-600">{errors.mobile.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="patient@example.com"
                className="h-10 text-sm font-medium"
              />
              {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            {/* Row 5: Address */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="address" className="text-xs font-semibold text-slate-700">
                Address
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="House / Street, Area, City"
                className="h-10 text-sm font-medium"
              />
              {errors.address && <p className="text-xs text-rose-600">{errors.address.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t mt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="h-10 px-5 text-sm">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-6 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update Patient" : "Create Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
