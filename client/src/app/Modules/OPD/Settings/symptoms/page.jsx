"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
import { Activity, Plus, Loader2, RefreshCw, AlertCircle } from "lucide-react";

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
    setValue,
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
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <Alert
          className={
            message.type === "error"
              ? "bg-red-50 text-red-900 border-red-200"
              : "bg-emerald-50 text-emerald-900 border-emerald-200"
          }
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Master Symptoms Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage clinical symptoms library for doctor consultation & prescription reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchSymptoms}
            disabled={loading}
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={openCreateDialog}
            className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Symptom
          </Button>
        </div>
      </div>

      {/* Data Listing Table */}
      <Card className="border border-slate-200 shadow-2xs">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
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

      {/* Create / Edit Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="h-5 w-5 text-teal-600" />
              {editingItem ? "Edit Master Symptom" : "Add New Master Symptom"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold">
                Symptom Code *
              </Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="e.g. SYM-001"
                className="h-8 text-xs font-mono font-bold"
              />
              {errors.code && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Symptom Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. High Fever / Cough"
                className="h-8 text-xs font-medium"
              />
              {errors.name && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <Label htmlFor="is_active" className="text-xs font-semibold block">
                  Active Status
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Enable or disable this symptom in prescription drop-downs
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

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
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
                disabled={isSubmitting}
                className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                {editingItem ? "Update Symptom" : "Save Symptom"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Confirm Symptom Deletion
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-slate-600 pt-1">
            Are you sure you want to delete symptom{" "}
            <strong className="text-slate-900">{deletingItem?.name}</strong> (
            <span className="font-mono font-semibold">{deletingItem?.code}</span>)? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingItem(null)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
