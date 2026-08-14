"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import labHeaderService from "@/services/labHeader.service";
import labRequiredSampleService from "@/services/labRequiredSample.service";
import serviceService from "@/services/serviceService";

export default function MasterTestsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [tests, setTests] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [labHeaders, setLabHeaders] = useState([]);
  const [requiredSamples, setRequiredSamples] = useState([]);
  const [services, setServices] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(masterTestSchema),
    defaultValues: {
      serviceId: "",
      lab_headers_id: "",
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

  const loadHeaders = async () => {
    try {
      const res = await labHeaderService.getAll();
      setLabHeaders(res.data || []);
    } catch (error) {
      console.error("Failed to load lab headers:", error);
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

  const loadServices = async () => {
    try {
      const res = await serviceService.getAll({ laboratory: true, excludeExistingLabMasterTests: true });
      setServices(res.data || []);
    } catch (error) {
      console.error("Failed to load services:", error);
    }
  };

  useEffect(() => {
    loadTests();
    loadHeaders();
    loadRequiredSamples();
    loadServices();
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
      serviceId: "",
      lab_headers_id: "",
      lab_required_sample_id: "",
      testSort: maxSort + 1,
      expectedTime: 60,
      interpretation: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = useCallback(async (rowData) => {
    try {
      setLoading(true);
      setDialogError(null);
      const res = await masterTestService.getById(rowData.id);
      const data = res.data;
      setEditingId(data.id);
      reset({
        serviceId: data.serviceId || "",
        lab_headers_id: data.lab_headers_id || "",
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
  }, [reset]);

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
          `/Modules/laboratory/masterParameters?id=${rowData.id}&testName=${encodeURIComponent(rowData.serviceName)}`
        );
      },
    });
  }, [openEdit, router]);

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {message.text}
          </div>
          <button onClick={() => setMessage(null)}>
            <X className="h-3 w-3 opacity-60 hover:opacity-100" />
          </button>
        </div>
      )}

      <Card className="shadow-sm border border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-sky-600" />
            Master Tests Configuration
          </CardTitle>
          <Button onClick={openCreate} size="sm" className="h-8 gap-1">
            <Plus className="h-4 w-4" /> Add Test
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tests}
            filterColumn="serviceName"
            isLoading={loading}
          />
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Label className="text-xs">Service (Laboratory)</Label>
                <Controller
                  name="serviceId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((svc) => (
                          <SelectItem key={svc.id} value={svc.id}>
                            {svc.Code} - {svc.ServiceName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.serviceId && (
                  <p className="text-xs text-destructive">{errors.serviceId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Lab Header</Label>
                <Controller
                  name="lab_headers_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(val === "__none" ? "" : val)} value={field.value || ""}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select header" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
                        {labHeaders.map((hdr) => (
                          <SelectItem key={hdr.id} value={hdr.id}>
                            {hdr.header_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Required Sample</Label>
                <Controller
                  name="lab_required_sample_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(val === "__none" ? "" : val)} value={field.value || ""}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select sample" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">None</SelectItem>
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
