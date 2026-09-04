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
import { masterPhysicalExamSchema } from "@/lib/zodeSchema";
import masterPhysicalExamService from "@/services/masterPhysicalExam.service";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Stethoscope, Plus, Loader2, RefreshCw, Save, Check, X } from "lucide-react";

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
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide leading-tight">
              MASTER PHYSICAL EXAM SETTINGS
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
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
            Add Physical Exam
          </Button>
        </div>
      </div>

      {/* Data Listing Table */}
      <Card className="border border-slate-200/90 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="py-2.5 px-4 bg-slate-50 border-b">
          <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-teal-600" />
            Configured Examinations ({exams.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
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

      {/* Create / Edit Widescreen Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-3xl sm:!max-w-3xl w-[95vw] md:w-[750px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Stethoscope className="h-5 w-5 text-teal-600" />
              {editingItem ? "Edit Physical Exam" : "Add New Physical Exam"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Form Fields: Wide Input Box (~700px room) */}
            <div className="space-y-4">
              {/* Field 1: Exam Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Physical Examination Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g. Chest & Lungs Auscultation, Abdomen Palpation, Cranial Nerves"
                  className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white"
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Field 2: Active Status Card */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="text-sm font-semibold text-slate-900 block cursor-pointer">
                    Active Status
                  </Label>
                  <p className="text-xs text-slate-500">
                    Enable or disable this examination from appearing in doctor consultation & prescription sheets
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
                {editingItem ? "Update Exam" : "Save Exam"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

