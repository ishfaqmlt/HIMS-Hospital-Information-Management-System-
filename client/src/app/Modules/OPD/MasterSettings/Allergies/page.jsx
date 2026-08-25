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
import { masterAllergySchema } from "@/lib/zodeSchema";
import masterAllergyService from "@/services/masterAllergy.service";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { AlertTriangle, Plus, Loader2, RefreshCw } from "lucide-react";

export default function AllergiesMasterPage() {
  const [loading, setLoading] = useState(true);
  const [allergies, setAllergies] = useState([]);
  const [message, setMessage] = useState(null);

  // Dialog & Edit States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // react-hook-form + zodResolver
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(masterAllergySchema),
    defaultValues: {
      code: "",
      name: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchAllergies();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchAllergies = async () => {
    try {
      setLoading(true);
      const res = await masterAllergyService.getAll();
      setAllergies(res.data || []);
    } catch (error) {
      console.error("Failed to fetch master allergies:", error);
      setMessage({ type: "error", text: "Failed to load master allergies list." });
    } finally {
      setLoading(false);
    }
  };

  const generateNextCode = (list) => {
    if (!list || list.length === 0) return "ALG-001";
    const maxNum = list.reduce((max, item) => {
      if (item.code && item.code.startsWith("ALG-")) {
        const num = parseInt(item.code.replace("ALG-", ""), 10);
        return !isNaN(num) && num > max ? num : max;
      }
      return max;
    }, 0);
    return `ALG-${String(maxNum + 1).padStart(3, "0")}`;
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    const nextCode = generateNextCode(allergies);
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
        await masterAllergyService.update(editingItem.id, data);
        setMessage({ type: "success", text: "Allergy updated successfully." });
      } else {
        await masterAllergyService.create(data);
        setMessage({ type: "success", text: "Allergy created successfully." });
      }
      setIsDialogOpen(false);
      fetchAllergies();
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to save allergy.";
      setMessage({ type: "error", text: errMsg });
    }
  };

  const columns = useMemo(
    () => getColumns({ onEdit: openEditDialog }),
    [allergies]
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
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Master Allergies Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage clinical allergies library for doctor consultation & prescription alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAllergies}
            disabled={loading}
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={openCreateDialog}
            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Allergy
          </Button>
        </div>
      </div>

      {/* Data Listing Table */}
      <Card className="border border-slate-200 shadow-2xs">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-2" />
              <p className="text-xs">Loading allergies list...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={allergies}
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
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {editingItem ? "Edit Master Allergy" : "Add New Master Allergy"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-semibold">
                Allergy Code *
              </Label>
              <Input
                id="code"
                {...register("code")}
                placeholder="e.g. ALG-001"
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
                Allergy Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Penicillin / Latex"
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
                  Enable or disable this allergy in prescription drop-downs
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
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                {editingItem ? "Update Allergy" : "Save Allergy"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
