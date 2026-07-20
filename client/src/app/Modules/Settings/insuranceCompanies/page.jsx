"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insuranceCompanySchema } from "@/lib/zodeSchema";
import insuranceCompanyService from "@/services/insuranceCompanyService";
import { Loader2, Plus, Search } from "lucide-react";

export default function InsuranceCompaniesPage() {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
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
    resolver: zodResolver(insuranceCompanySchema),
    defaultValues: {
      name: "",
      phone: "",
      contactPerson: "",
      mobile: "",
      email: "",
      address: "",
      isCredit: false,
      validityHours: 48,
      discount: 0,
      isActive: true,
    },
  });

  const isCreditValue = watch("isCredit");
  const isActiveValue = watch("isActive");

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async (params = {}) => {
    try {
      setLoading(true);
      const res = await insuranceCompanyService.getAll(params);
      setCompanies(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      fetchCompanies();
      return;
    }
    fetchCompanies({ search: searchTerm });
  };

  const openCreate = () => {
    setEditingId(null);
    reset({
      name: "",
      phone: "",
      contactPerson: "",
      mobile: "",
      email: "",
      address: "",
      isCredit: false,
      validityHours: 48,
      discount: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (company) => {
    setEditingId(company.id);
    reset({
      name: company.name || "",
      phone: company.phone || "",
      contactPerson: company.contactPerson || "",
      mobile: company.mobile || "",
      email: company.email || "",
      address: company.address || "",
      isCredit: company.isCredit ?? false,
      validityHours: company.validityHours ?? 48,
      discount: company.discount ?? 0,
      isActive: company.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await insuranceCompanyService.update(editingId, data);
        setMessage({ type: "success", text: "Insurance company updated successfully" });
      } else {
        await insuranceCompanyService.create(data);
        setMessage({ type: "success", text: "Insurance company created successfully" });
      }
      setIsDialogOpen(false);
      fetchCompanies();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const columns = getColumns({ onEdit: openEdit });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insurance Companies</h1>
          <p className="text-muted-foreground mt-1">Manage insurance company records</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Company
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Search by name, contact, phone, mobile, or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-md"
        />
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />Search
        </Button>
        <Button variant="ghost" onClick={() => { setSearchTerm(""); fetchCompanies(); }}>
          Reset
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={companies} filterColumn="name" />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Insurance Company" : "Add Insurance Company"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" {...register("name")} placeholder="Company name" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input id="contactPerson" {...register("contactPerson")} placeholder="Contact person" />
                {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} placeholder="Phone number" />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input id="mobile" {...register("mobile")} placeholder="Mobile number" />
                {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="Email address" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validityHours">Validity Hours</Label>
                <Input id="validityHours" type="number" {...register("validityHours")} />
                {errors.validityHours && <p className="text-sm text-destructive">{errors.validityHours.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount %</Label>
                <Input id="discount" type="number" step="0.01" {...register("discount")} />
                {errors.discount && <p className="text-sm text-destructive">{errors.discount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} placeholder="Address" />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isCreditValue}
                  onCheckedChange={(val) => setValue("isCredit", val)}
                />
                <Label>Credit Company</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={isActiveValue}
                  onCheckedChange={(val) => setValue("isActive", val)}
                />
                <Label>Active</Label>
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
