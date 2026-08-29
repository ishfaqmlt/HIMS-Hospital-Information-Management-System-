"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pharmacySupplierSchema } from "@/lib/zodeSchema";
import pharmacySupplierService from "@/services/pharmacySupplier.service";
import { getSupplierColumns } from "./supplierColumns";
import { DataTable } from "@/components/data-table/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  RefreshCw,
  Truck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  FileText,
} from "lucide-react";

export default function SupplierManager() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Dialog & Edit state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pharmacySupplierSchema),
    defaultValues: {
      name: "",
      contact_person: "",
      phone: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      ntn_number: "",
      strn_number: "",
      drug_license_no: "",
      opening_balance: 0,
      current_balance: 0,
      is_active: true,
    },
  });

  const isActiveValue = watch("is_active");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await pharmacySupplierService.getAll();
      setData(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load suppliers" });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({
      name: "",
      contact_person: "",
      phone: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      ntn_number: "",
      strn_number: "",
      drug_license_no: "",
      opening_balance: 0,
      current_balance: 0,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || "",
      contact_person: item.contact_person || "",
      phone: item.phone || "",
      mobile: item.mobile || "",
      email: item.email || "",
      address: item.address || "",
      city: item.city || "",
      ntn_number: item.ntn_number || "",
      strn_number: item.strn_number || "",
      drug_license_no: item.drug_license_no || "",
      opening_balance: Number(item.opening_balance || 0),
      current_balance: Number(item.current_balance || 0),
      is_active: Boolean(item.is_active),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      setSaving(true);
      if (editingItem) {
        await pharmacySupplierService.update(editingItem.id, formData);
        setMessage({ type: "success", text: "Supplier updated successfully" });
      } else {
        await pharmacySupplierService.create(formData);
        setMessage({ type: "success", text: "Supplier added successfully" });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save supplier",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await pharmacySupplierService.delete(itemToDelete.id);
      setMessage({ type: "success", text: "Supplier deleted successfully" });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete supplier",
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      getSupplierColumns({
        onEdit: openEditDialog,
        onDelete: confirmDelete,
      }),
    []
  );

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {message && (
        <Alert
          className={
            message.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <AlertDescription className="text-xs font-medium ml-2">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card className="shadow-xs border-slate-200/80">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Suppliers & Distributors Directory
              </CardTitle>
              <CardDescription className="text-xs">
                Manage vendor details, drug sales licenses, contact info, and ledger payables
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="h-8 text-xs border-slate-200 text-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={openCreateDialog}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              + Add Supplier
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
              Loading suppliers directory...
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              filterColumn="name"
              placeholder="Search by supplier name..."
            />
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              {editingItem ? "Edit Supplier / Vendor" : "Add New Supplier / Vendor"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Primary Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Supplier / Company Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Metro Pharma Distributors"
                  className="h-8 text-xs"
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Contact Person Representative
                </Label>
                <Input
                  {...register("contact_person")}
                  placeholder="e.g. Muhammad Kashif"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  City
                </Label>
                <Input
                  {...register("city")}
                  placeholder="e.g. Lahore / Bhakkar"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Mobile / WhatsApp
                </Label>
                <Input
                  {...register("mobile")}
                  placeholder="e.g. 0300-1234567"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Office Phone
                </Label>
                <Input
                  {...register("phone")}
                  placeholder="e.g. 042-35889901"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="e.g. orders@metropharma.pk"
                  className="h-8 text-xs"
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Physical Address
                </Label>
                <Textarea
                  {...register("address")}
                  placeholder="e.g. Plot 45, Industrial Estate, Multan Road"
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>

              {/* Regulatory & Taxes */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Drug Sale License No.
                </Label>
                <Input
                  {...register("drug_license_no")}
                  placeholder="e.g. DL-LHR-2024-88"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  NTN / Tax Number
                </Label>
                <Input
                  {...register("ntn_number")}
                  placeholder="e.g. 4123890-1"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  STRN (Sales Tax Reg)
                </Label>
                <Input
                  {...register("strn_number")}
                  placeholder="e.g. 03-01-4123-890-19"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Opening Balance (Rs.)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("opening_balance")}
                  placeholder="0.00"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <Label className="text-xs font-bold text-slate-800">
                  Active Supplier Status
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Available for new Purchase Orders and Good Received Notes (GRN)
                </p>
              </div>
              <Switch
                checked={isActiveValue}
                onCheckedChange={(val) => setValue("is_active", val)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {saving ? "Saving..." : editingItem ? "Update Supplier" : "Create Supplier"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-slate-600 space-y-2 py-2">
            <p>
              Are you sure you want to delete supplier <strong>{itemToDelete?.name}</strong>?
            </p>
            <p className="text-muted-foreground text-[11px]">
              This action cannot be undone if there are no existing purchase transactions.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="h-8 text-xs font-semibold"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
