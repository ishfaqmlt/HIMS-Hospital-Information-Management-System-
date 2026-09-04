"use client";

import React, { useState, useEffect } from "react";
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
import { masterFrequencySchema } from "@/lib/zodeSchema";
import masterFrequencyService from "@/services/masterFrequency.service";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Clock, Plus, Loader2, RefreshCw, Save, Check, X, Trash2 } from "lucide-react";

export default function FrequencyMasterPage() {
  const [loading, setLoading] = useState(true);
  const [frequencies, setFrequencies] = useState([]);
  const [message, setMessage] = useState(null);

  // Dialog & Edit States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete Dialog State
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(masterFrequencySchema),
    defaultValues: {
      frequency: "",
      isActive: true,
    },
  });

  useEffect(() => {
    fetchFrequencies();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchFrequencies = async () => {
    try {
      setLoading(true);
      const res = await masterFrequencyService.getAll();
      setFrequencies(res.data || []);
    } catch (error) {
      console.error("Failed to fetch master frequency list:", error);
      setMessage({ type: "error", text: "Failed to load frequency master list." });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({
      frequency: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      frequency: item.frequency || "",
      isActive: Boolean(item.isActive),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await masterFrequencyService.update(editingItem.id, data);
        setMessage({ type: "success", text: "Frequency updated successfully." });
      } else {
        await masterFrequencyService.create(data);
        setMessage({ type: "success", text: "Frequency created successfully." });
      }
      setIsDialogOpen(false);
      fetchFrequencies();
    } catch (error) {
      console.error("Save frequency error:", error);
      const errMsg =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(", ")
          : "Failed to save frequency record.");
      setMessage({ type: "error", text: errMsg });
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await masterFrequencyService.delete(itemToDelete.id);
      setMessage({ type: "success", text: "Frequency deleted successfully." });
      setItemToDelete(null);
      fetchFrequencies();
    } catch (error) {
      console.error("Delete frequency error:", error);
      setMessage({ type: "error", text: "Failed to delete frequency record." });
    }
  };

  const columns = getColumns({
    onEdit: openEditDialog,
    onDelete: (item) => setItemToDelete(item),
  });

  return (
    <div className="space-y-4">
      {/* Toast Alert Notification */}
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

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-teal-300">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide leading-tight">
              MEDICATION FREQUENCY MASTER
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage prescription dosage frequencies in English and Urdu (e.g. 1-0-1, OD, BD, صبح، دوپہر، شام)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchFrequencies}
            disabled={loading}
            className="h-8 px-3 text-xs border-slate-700 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={openCreateDialog}
            size="sm"
            className="h-8 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Frequency
          </Button>
        </div>
      </div>

      {/* Data Table Card */}
      <Card className="border border-slate-200/90 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="py-2.5 px-4 bg-slate-50 border-b">
          <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Clock className="h-4 w-4 text-teal-600" />
            Configured Frequencies ({frequencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="text-xs font-medium">Loading frequency records...</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={frequencies}
              filterColumn="frequency"
            />
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Widescreen Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-3xl sm:!max-w-3xl w-[95vw] md:w-[750px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Clock className="h-5 w-5 text-teal-600" />
              {editingItem ? "Edit Medication Frequency" : "Add Medication Frequency"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Form Fields: Wide Input Box (~700px room) */}
            <div className="space-y-4">
              {/* Field 1: Frequency Name */}
              <div className="space-y-1.5">
                <Label htmlFor="frequency" className="text-xs font-semibold text-slate-700">
                  Frequency Name *
                </Label>
                <Input
                  id="frequency"
                  {...register("frequency")}
                  dir="auto"
                  placeholder="e.g. 1-0-1, OD, BD, TDS, or صبح، دوپہر، شام"
                  className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white"
                />
                <p className="text-xs text-slate-500">
                  Supports English shorthand notation (1-0-1, OD, BD, TDS) or native Urdu instructions (صبح، دوپہر، شام).
                </p>
                {errors.frequency && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.frequency.message}
                  </p>
                )}
              </div>

              {/* Field 2: Active Status Card */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive" className="text-sm font-semibold text-slate-900 block cursor-pointer">
                    Active Status
                  </Label>
                  <p className="text-xs text-slate-500">
                    Allow this frequency option to appear in prescription dosage selection dropdowns
                  </p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="isActive"
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
                {editingItem ? "Update Frequency" : "Save Frequency"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-600" />
              Delete Frequency?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-3">
            Are you sure you want to delete frequency &quot;<strong className="text-slate-900">{itemToDelete?.frequency}</strong>&quot;? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemToDelete(null)}
              className="h-9 px-4 text-xs font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="h-9 px-4 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

