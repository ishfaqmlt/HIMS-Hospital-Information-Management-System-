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
import { masterPhysicalExamSchema } from "@/lib/zodeSchema";
import masterPhysicalExamService from "@/services/masterPhysicalExam.service";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Stethoscope, Plus, Loader2, RefreshCw } from "lucide-react";

export default function PhysicalExamMasterPage() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
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
    resolver: zodResolver(masterPhysicalExamSchema),
    defaultValues: {
      name: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await masterPhysicalExamService.getAll();
      setExams(res.data || []);
    } catch (error) {
      console.error("Failed to fetch master physical exam list:", error);
      setMessage({ type: "error", text: "Failed to load physical exam master list." });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({
      name: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || "",
      is_active: Boolean(item.is_active),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await masterPhysicalExamService.update(editingItem.id, data);
        setMessage({ type: "success", text: "Physical Exam record updated successfully." });
      } else {
        await masterPhysicalExamService.create(data);
        setMessage({ type: "success", text: "Physical Exam record created successfully." });
      }
      setIsDialogOpen(false);
      fetchExams();
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to save physical exam record.";
      setMessage({ type: "error", text: errMsg });
    }
  };

  const columns = useMemo(
    () => getColumns({ onEdit: openEditDialog }),
    [exams]
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
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              Master Physical Exam Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage clinical physical examinations library for OPD consultation & prescription sheets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchExams}
            disabled={loading}
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={openCreateDialog}
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Physical Exam
          </Button>
        </div>
      </div>

      {/* Data Listing Table */}
      <Card className="border border-slate-200 shadow-2xs">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs">Loading physical exam list...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={exams}
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
              <Stethoscope className="h-5 w-5 text-blue-600" />
              {editingItem ? "Edit Physical Exam" : "Add New Physical Exam"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">
                Exam Name *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Chest & Lungs Auscultation"
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
                  Enable or disable this exam in consultation selection lists
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
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                {editingItem ? "Update Exam" : "Save Exam"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
