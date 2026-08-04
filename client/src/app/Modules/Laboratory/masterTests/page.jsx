"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { masterTestSchema } from "@/lib/zodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Save, X, Check, FlaskConical } from "lucide-react";
import masterTestService from "@/services/masterTests.service";
import labRequiredSampleService from "@/services/labRequiredSample.service";

export default function MasterTestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tests, setTests] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requiredSamples, setRequiredSamples] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(masterTestSchema),
    defaultValues: {
      testCode: "",
      testName: "",
      lab_required_sample_id: "",
      testSort: 1,
      expectedTime: 60,
      interpretation: "",
      isActive: true,
    },
  });

  const loadTests = async () => {
    try {
      const res = await masterTestService.getAll();
      setTests(res.data || []);
    } catch (error) {
      console.error("Failed to load tests:", error);
    }
  };

  const loadRequiredSamples = async () => {
    try {
      const res = await labRequiredSampleService.getAll();
      setRequiredSamples(res.data || []);
    } catch (error) {
      console.error("Failed to load required samples:", error);
    }
  };

  useEffect(() => {
    loadTests();
    loadRequiredSamples();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const openCreate = () => {
    setEditingId(null);
    setDialogError(null);
    const maxSort = tests.length > 0 ? Math.max(...tests.map((t) => t.testSort || 0)) : 0;
    reset({
      testCode: "",
      testName: "",
      lab_required_sample_id: "",
      testSort: maxSort + 1,
      expectedTime: 60,
      interpretation: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = async (rowData) => {
    try {
      setLoading(true);
      setDialogError(null);
      const res = await masterTestService.getById(rowData.id);
      const data = res.data;
      setEditingId(data.id);
      reset({
        testCode: data.testCode || "",
        testName: data.testName || "",
        lab_required_sample_id: data.lab_required_sample_id || "",
        testSort: data.testSort || 1,
        expectedTime: data.expectedTime || 60,
        interpretation: data.interpretation || "",
        isActive: data.isActive ?? true,
      });
      setIsDialogOpen(true);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load test" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage(null);
    setDialogError(null);
    try {
      if (editingId) {
        await masterTestService.update(editingId, formData);
        setMessage({ type: "success", text: "Test updated successfully" });
      } else {
        await masterTestService.create(formData);
        setMessage({ type: "success", text: "Test created successfully" });
      }
      setIsDialogOpen(false);
      reset();
      setEditingId(null);
      await loadTests();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save test";
      if (editingId) {
        setDialogError(errorMsg);
      } else {
        setMessage({ type: "error", text: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    return getColumns({
      onEdit: openEdit,
      onParameters: (rowData) => {
        router.push(
          `/Modules/laboratory/masterParameters?id=${rowData.id}&testName=${encodeURIComponent(rowData.testName)}`
        );
      },
    });
  }, [openEdit, router]);

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
          {message.text}
        </div>
      )}

      <Card className="shadow-sm border border-border/50">
        <CardHeader className="py-2.5 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Lab Master Tests
            </span>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={openCreate}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Test
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable columns={columns} data={tests} filterColumn="testName" />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setDialogError(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Test" : "Add Test"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {dialogError && (
              <div className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
                <X className="h-3 w-3" />
                {dialogError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Test Code</Label>
                <Input
                  {...register("testCode")}
                  className="h-9 text-xs"
                  placeholder="e.g. CBC001"
                />
                {errors.testCode && (
                  <p className="text-xs text-destructive">{errors.testCode.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Test Name</Label>
                <Input
                  {...register("testName")}
                  className="h-9 text-xs"
                  placeholder="e.g. Complete Blood Count"
                />
                {errors.testName && (
                  <p className="text-xs text-destructive">{errors.testName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Required Sample</Label>
                <Controller
                  name="lab_required_sample_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select sample" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {requiredSamples.map((sample) => (
                          <SelectItem key={sample.id} value={sample.id}>
                            {sample.required_sample_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Sort Order</Label>
                <Input
                  type="number"
                  {...register("testSort", { valueAsNumber: true })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Expected Time (min)</Label>
                <Input
                  type="number"
                  {...register("expectedTime", { valueAsNumber: true })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "true")}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Interpretation</Label>
              <textarea
                {...register("interpretation")}
                className="w-full h-20 px-3 py-2 text-xs border rounded-md resize-none"
                placeholder="Optional interpretation notes"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                {editingId ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
