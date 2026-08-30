"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table/data-table";
import {
  getUnitColumns,
  getDosageFormColumns,
  getCategoryColumns,
  getGenericColumns,
  getManufacturerColumns,
} from "./masterColumns";
import {
  pharmacyUnitService,
  pharmacyDosageFormService,
  pharmacyCategoryService,
  pharmacyGenericService,
  pharmacyManufacturerService,
} from "@/services/pharmacyMaster.service";
import {
  pharmacyUnitSchema,
  pharmacyDosageFormSchema,
  pharmacyCategorySchema,
  pharmacyGenericSchema,
  pharmacyManufacturerSchema,
} from "@/lib/zodeSchema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tags,
  FlaskConical,
  Pill,
  Scale,
  Factory,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export const MASTER_TABS = [
  { id: "categories", label: "Drug Categories", icon: Tags, filterCol: "name", service: pharmacyCategoryService, schema: pharmacyCategorySchema },
  { id: "generics", label: "Generic Molecules", icon: FlaskConical, filterCol: "generic_name", service: pharmacyGenericService, schema: pharmacyGenericSchema },
  { id: "dosage-forms", label: "Dosage Forms", icon: Pill, filterCol: "name", service: pharmacyDosageFormService, schema: pharmacyDosageFormSchema },
  { id: "units", label: "Dispensing Units", icon: Scale, filterCol: "name", service: pharmacyUnitService, schema: pharmacyUnitSchema },
  { id: "manufacturers", label: "Manufacturers", icon: Factory, filterCol: "name", service: pharmacyManufacturerService, schema: pharmacyManufacturerSchema },
];

export default function MasterDataManager({ initialTab = "categories" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Auto-dismiss notification
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  // Sync initial tab when changed from outside
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const currentConfig = MASTER_TABS.find((t) => t.id === activeTab) || MASTER_TABS[0];

  // Load records for active master tab
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await currentConfig.service.getAll();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || `Failed to fetch ${currentConfig.label}`,
      });
    } finally {
      setLoading(false);
    }
  }, [currentConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form management for Create / Edit
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(currentConfig.schema),
  });

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({
      name: "",
      generic_name: "",
      therapeutic_class: "",
      code: "",
      description: "",
      contact_number: "",
      email: "",
      country: "Pakistan",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || "",
      generic_name: item.generic_name || "",
      therapeutic_class: item.therapeutic_class || "",
      code: item.code || "",
      description: item.description || "",
      contact_number: item.contact_number || "",
      email: item.email || "",
      country: item.country || "Pakistan",
      is_active: Boolean(item.is_active),
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (item) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      if (editingItem) {
        await currentConfig.service.update(editingItem.id, formData);
        setMessage({ type: "success", text: `${currentConfig.label} updated successfully!` });
      } else {
        await currentConfig.service.create(formData);
        setMessage({ type: "success", text: `${currentConfig.label} created successfully!` });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Operation failed. Please check inputs.",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await currentConfig.service.delete(deletingItem.id);
      setMessage({ type: "success", text: "Record deleted successfully!" });
      setIsDeleteDialogOpen(false);
      setDeletingItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete record.",
      });
    }
  };

  // Get dynamic columns based on active master tab
  const getColumnsForTab = () => {
    const handlers = { onEdit: openEditDialog };
    switch (activeTab) {
      case "units":
        return getUnitColumns(handlers);
      case "dosage-forms":
        return getDosageFormColumns(handlers);
      case "categories":
        return getCategoryColumns(handlers);
      case "generics":
        return getGenericColumns(handlers);
      case "manufacturers":
        return getManufacturerColumns(handlers);
      default:
        return getCategoryColumns(handlers);
    }
  };

  const columns = getColumnsForTab();

  return (
    <div className="space-y-6">
      {/* Toast / Alert Message */}
      {message && (
        <Alert
          className={`text-xs ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-rose-50 text-rose-900 border-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 mr-2" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Master Tabs Switcher */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-1.5">
        {MASTER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main DataTable Card */}
      <Card className="shadow-xs border-slate-200/80">
        <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <currentConfig.icon className="h-4 w-4 text-emerald-600" />
              {currentConfig.label} Directory
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-mono">
                {data.length} Records
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Manage baseline {currentConfig.label.toLowerCase()} for prescription formulation and billing
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="h-8 text-xs border-slate-200 text-slate-700"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 text-slate-500 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              size="sm"
              onClick={openCreateDialog}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add {currentConfig.label.replace(/s$/, "")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-600" />
              <p>Loading {currentConfig.label} records...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data}
              filterColumn={currentConfig.filterCol}
            />
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingItem ? `Edit ${currentConfig.label.replace(/s$/, "")}` : `Add New ${currentConfig.label.replace(/s$/, "")}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Field: Categories */}
            {activeTab === "categories" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Category Name *</Label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. Antibiotics & Anti-infectives"
                    className="text-xs h-8"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Category Code</Label>
                  <Input
                    {...register("code")}
                    placeholder="e.g. CAT-ANTI"
                    className="text-xs h-8 uppercase font-mono"
                  />
                  {errors.code && (
                    <p className="text-[11px] text-destructive font-medium">{errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Description</Label>
                  <Textarea
                    {...register("description")}
                    placeholder="Clinical therapeutic notes..."
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </>
            )}

            {/* Field: Generics */}
            {activeTab === "generics" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Generic Molecule Name *</Label>
                  <Input
                    {...register("generic_name")}
                    placeholder="e.g. Paracetamol or Amoxicillin + Clavulanate"
                    className="text-xs h-8"
                  />
                  {errors.generic_name && (
                    <p className="text-[11px] text-destructive font-medium">{errors.generic_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Therapeutic Class</Label>
                  <Input
                    {...register("therapeutic_class")}
                    placeholder="e.g. Analgesic & Antipyretic"
                    className="text-xs h-8"
                  />
                  {errors.therapeutic_class && (
                    <p className="text-[11px] text-destructive font-medium">{errors.therapeutic_class.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Field: Dosage Forms */}
            {activeTab === "dosage-forms" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Dosage Form Name *</Label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Tablet, Capsule, Syrup, Injection, Inhaler"
                  className="text-xs h-8"
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>
            )}

            {/* Field: Units */}
            {activeTab === "units" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Unit Name *</Label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Tablet, Bottle, Box, Strip, Vial, Ampoule"
                  className="text-xs h-8"
                />
                {errors.name && (
                  <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>
            )}

            {/* Field: Manufacturers */}
            {activeTab === "manufacturers" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Manufacturer / Company Name *</Label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. GlaxoSmithKline (GSK) Pakistan"
                    className="text-xs h-8"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Contact #</Label>
                    <Input
                      {...register("contact_number")}
                      placeholder="e.g. +92-21-111-475-111"
                      className="text-xs h-8 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Country</Label>
                    <Input
                      {...register("country")}
                      placeholder="e.g. Pakistan"
                      className="text-xs h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Email Address</Label>
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder="e.g. info@company.com"
                    className="text-xs h-8"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Status Switch / Checkbox */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Label className="text-xs font-semibold text-slate-700">Active Status</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register("is_active")}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-xs text-slate-600 cursor-pointer font-medium">
                  Enable record
                </label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="h-8 text-xs text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSubmitting && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                {editingItem ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-xs text-slate-600">
            Are you sure you want to delete{" "}
            <strong>
              {deletingItem?.name || deletingItem?.generic_name || "this record"}
            </strong>
            ? This action cannot be undone.
          </div>
          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-8 text-xs text-slate-600"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDelete}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
