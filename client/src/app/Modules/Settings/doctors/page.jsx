"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { doctorSchema } from "@/lib/zodeSchema";
import doctorService from "@/services/doctor.service";
import userService from "@/services/user.service";
import { Loader2, Plus, Search } from "lucide-react";

export default function DoctorsPage() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      user_id: "",
      Name: "",
      Gender: "",
      Dob: "",
      Email: "",
      Phone: "",
      Cnic: "",
      RegistrationNo: "",
      Address: "",
      JoiningDate: "",
      EmployeementStatus: "Active",
      Stamp: "",
      Opd: false,
      Surgeon: false,
      Anesthetist: false,
    },
  });

  const genderValue = watch("Gender");
  const statusValue = watch("EmployeementStatus");
  const userIdValue = watch("user_id");

  useEffect(() => {
    loadDoctors();
    loadUsers();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getAll();
      setDoctors(res.data);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load doctors" });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({
      user_id: "", Name: "", Gender: "", Dob: "", Email: "", Phone: "", Cnic: "",
      RegistrationNo: "", Qualification: "", Specialization: "", Address: "", JoiningDate: "", EmployeementStatus: "Active", Stamp: "",
      Opd: false, Surgeon: false, Anesthetist: false,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (doctor) => {
    setEditingId(doctor.id);
    reset({
      user_id: doctor.user_id ? String(doctor.user_id) : "",
      Name: doctor.Name || "",
      Gender: doctor.Gender || "",
      Dob: doctor.Dob ? doctor.Dob.split("T")[0] : "",
      Email: doctor.Email || "",
      Phone: doctor.Phone || "",
      Cnic: doctor.Cnic || "",
      RegistrationNo: doctor.RegistrationNo || "",
      Qualification: doctor.Qualification || "",
      Specialization: doctor.Specialization || "",
      Address: doctor.Address || "",
      JoiningDate: doctor.JoiningDate ? doctor.JoiningDate.split("T")[0] : "",
      EmployeementStatus: doctor.EmployeementStatus || "Active",
      Stamp: doctor.Stamp || "",
      Opd: doctor.Opd ?? false,
      Surgeon: doctor.Surgeon ?? false,
      Anesthetist: doctor.Anesthetist ?? false,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        user_id: data.user_id ? data.user_id : null,
      };

      if (editingId) {
        await doctorService.update(editingId, payload);
        setMessage({ type: "success", text: "Doctor updated successfully" });
      } else {
        await doctorService.create(payload);
        setMessage({ type: "success", text: "Doctor created successfully" });
      }
      setIsDialogOpen(false);
      loadDoctors();
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await doctorService.delete(id);
      setMessage({ type: "success", text: "Doctor deleted" });
      loadDoctors();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const columns = getColumns({ onEdit: openEdit, onDelete: handleDelete });

  const filteredDoctors = doctors.filter((doctor) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      doctor.Name?.toLowerCase().includes(term) ||
      doctor.Phone?.toLowerCase().includes(term) ||
      doctor.Email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground mt-1">Manage doctor records</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Doctor</Button>
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
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Name, Phone, Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>Clear</Button>
            )}
          </div>
          <DataTable columns={columns} data={filteredDoctors} />
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label>Linked User Account (Login)</Label>
                <Select value={userIdValue || "none"} onValueChange={(val) => setValue("user_id", val === "none" ? "" : val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user account to link for doctor login" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- No Linked Account --</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Name *</Label>
                <Input {...register("Name")} placeholder="Doctor name" />
                {errors.Name && <p className="text-sm text-destructive">{errors.Name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={genderValue} onValueChange={(val) => setValue("Gender", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" {...register("Dob")} />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("Email")} placeholder="Email" />
                {errors.Email && <p className="text-sm text-destructive">{errors.Email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register("Phone")} placeholder="Phone number" />
              </div>

              <div className="space-y-2">
                <Label>CNIC</Label>
                <Input {...register("Cnic")} placeholder="CNIC" />
              </div>

              <div className="space-y-2">
                <Label>Registration No (PMDC)</Label>
                <Input {...register("RegistrationNo")} placeholder="Registration number (e.g. 45892-P)" />
              </div>

              <div className="space-y-2">
                <Label>Qualification / Degrees</Label>
                <Input {...register("Qualification")} placeholder="e.g. MBBS, FCPS (Medicine)" />
              </div>

              <div className="space-y-2">
                <Label>Specialization / Designation</Label>
                <Input {...register("Specialization")} placeholder="e.g. Consultant Physician & OPD Specialist" />
              </div>

              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input type="date" {...register("JoiningDate")} />
              </div>

              <div className="space-y-2">
                <Label>Employment Status</Label>
                <Select value={statusValue} onValueChange={(val) => setValue("EmployeementStatus", val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Resigned">Resigned</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea {...register("Address")} placeholder="Address" rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Stamp</Label>
              <Textarea {...register("Stamp")} placeholder="Stamp" rows={2} />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="Opd"
                  checked={watch("Opd")}
                  onCheckedChange={(val) => setValue("Opd", val)}
                />
                <Label htmlFor="Opd" className="cursor-pointer">OPD</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="Surgeon"
                  checked={watch("Surgeon")}
                  onCheckedChange={(val) => setValue("Surgeon", val)}
                />
                <Label htmlFor="Surgeon" className="cursor-pointer">Surgeon</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="Anesthetist"
                  checked={watch("Anesthetist")}
                  onCheckedChange={(val) => setValue("Anesthetist", val)}
                />
                <Label htmlFor="Anesthetist" className="cursor-pointer">Anesthetist</Label>
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
