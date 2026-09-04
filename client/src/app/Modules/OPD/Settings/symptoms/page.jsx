"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masterSymptomSchema } from "@/lib/zodeSchema";
import masterSymptomService from "@/services/masterSymptom.service";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Activity, Plus, Loader2, RefreshCw, AlertCircle, Check, X, Save, Trash2 } from "lucide-react";

export default function SymptomsMasterPage() {
  const [loading, setLoading] = useState(true);
  const [symptoms, setSymptoms] = useState([]);
  const [message, setMessage] = useState(null);

  // Dialog & Edit States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // react-hook-form + zodResolver
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(masterSymptomSchema),
    defaultValues: {
      code: "",
      name: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchSymptoms();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const res = await masterSymptomService.getAll();
      setSymptoms(res.data || []);
    } catch (error) {
      console.error("Failed to fetch master symptoms:", error);
      setMessage({ type: "error", text: "Failed to load master symptoms list." });
    } finally {
      setLoading(false);
    }
  };

  const generateNextCode = (list) => {
    if (!list || list.length === 0) return "SYM-001";
    const maxNum = list.reduce((max, item) => {
      if (item.code && item.code.startsWith("SYM-")) {
        const num = parseInt(item.code.replace("SYM-", ""), 10);
        return !isNaN(num) && num > max ? num : max;
      }
      return max;
    }, 0);
    return `SYM-${String(maxNum + 1).padStart(3, "0")}`;
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    const nextCode = generateNextCode(symptoms);
    reset({
      code: nextCode,
      name: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      code: item.code || "",
      name: item.name || "",
      is_active: Boolean(item.is_active),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await masterSymptomService.update(editingItem.id, data);
        setMessage({ type: "success", text: "Symptom updated successfully." });
      } else {
        await masterSymptomService.create(data);
        setMessage({ type: "success", text: "Symptom created successfully." });
      }
      setIsDialogOpen(false);
      fetchSymptoms();
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to save symptom.";
      setMessage({ type: "error", text: errMsg });
    }
  };

  const confirmDelete = (item) => {
    setDeletingItem(item);
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await masterSymptomService.delete(deletingItem.id);
      setMessage({ type: "success", text: "Symptom deleted successfully." });
      fetchSymptoms();
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to delete symptom.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  const columns = useMemo(
    () => getColumns({ onEdit: openEditDialog, onDelete: confirmDelete }),
    [symptoms]
  );

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className={
            message.type === "error"
              ? "shadow-2xs"
              : "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs"
          }
        >
          {message.type === "error" ? (
            <X className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4 text-emerald-600" />
          )}
          <AlertDescription className="font-semibold text-sm">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-teal-300">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide leading-tight">
              MASTER SYMPTOMS SETTINGS
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage clinical symptoms library for doctor consultation & prescription templates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchSymptoms}
            disabled={loading}
            className="h-8 px-3 text-xs border-slate-700 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={openCreateDialog}
            className="h-8 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Symptom
          </Button>
        </div>
      </div>

      {/* Data Listing Table */}
      <Card className="border border-slate-200/90 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="py-2.5 px-4 bg-slate-50 border-b">
          <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-700" />
            Configured Symptoms ({symptoms.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <p className="text-xs">Loading symptoms list...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={symptoms}
              filterColumn="name"
            />
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Widescreen Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-3xl sm:!max-w-3xl w-[95vw] md:w-[750px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Activity className="h-5 w-5 text-teal-600" />
              {editingItem ? "Edit Master Symptom" : "Add New Master Symptom"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* 2-Column Spacious Grid for Wide Input Boxes (~340-360px each) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Field 1: Symptom Code */}
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-semibold text-slate-700">
                  Symptom Code *
                </Label>
                <Input
                  id="code"
                  {...register("code")}
                  placeholder="e.g. SYM-001"
                  className="h-10 text-sm font-mono font-bold border-slate-300 rounded-md focus:border-teal-500 bg-white"
                />
                {errors.code && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.code.message}
                  </p>
                )}
              </div>

              {/* Field 2: Symptom Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Symptom Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. High Fever, Dry Cough, Chest Pain"
                  className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white"
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Field 3: Active Status (Full Width Card) */}
              <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="text-sm font-semibold text-slate-900 block cursor-pointer">
                    Active Status
                  </Label>
                  <p className="text-xs text-slate-500">
                    Enable or disable this symptom from appearing in doctor prescription drop-downs
                  </p>
                </div>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="is_active"
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-10 px-5 text-sm font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 px-6 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingItem ? "Update Symptom" : "Save Symptom"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="!max-w-md w-[95vw] md:w-[450px] p-6">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Trash2 className="h-5 w-5 text-rose-600" />
              Delete Master Symptom?
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete symptom{" "}
              <strong className="text-slate-900 font-bold">{deletingItem?.name}</strong> (
              <span className="font-mono font-semibold text-slate-700">{deletingItem?.code}</span>)? This action cannot be undone.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingItem(null)}
              className="h-10 px-5 text-sm font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-10 px-5 text-sm bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
