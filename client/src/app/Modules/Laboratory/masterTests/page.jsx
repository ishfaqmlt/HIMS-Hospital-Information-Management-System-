"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      if (data.service && !services.some((s) => s.id === data.serviceId)) {
        setServices((prev) => [data.service, ...prev]);
      }
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
      console.error(error);
      setMessage({ type: "error", text: "Failed to load test" });
    } finally {
      setLoading(false);
    }
  }, [reset, services]);

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
      await loadServices();
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
        <Alert
          variant={message.type === "success" ? "default" : "destructive"}
          className={
            message.type === "success"
              ? "border-emerald-500 text-emerald-800 bg-emerald-50 shadow-2xs"
              : "shadow-2xs"
          }
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <X className="h-4 w-4" />
          )}
          <AlertDescription className="font-semibold text-sm">
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-xs border border-slate-200/90 rounded-xl overflow-hidden">
        <CardHeader className="py-3 px-4 bg-linear-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-t-xl flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-bold tracking-wide flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-teal-400" />
            MASTER TESTS CONFIGURATION
          </CardTitle>
          <Button
            onClick={openCreate}
            size="sm"
            className="h-8 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-xs cursor-pointer gap-1"
          >
            <Plus className="h-3.5 w-3.5 mr-0.5" /> Add Test
          </Button>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          <DataTable
            columns={columns}
            data={tests}
            filterColumn="serviceName"
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Widescreen Master Test Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[95vw] md:w-[850px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-teal-600" />
              {editingId ? "Edit Master Test" : "Add New Master Test"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {dialogError && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription className="text-xs font-semibold">
                  {dialogError}
                </AlertDescription>
              </Alert>
            )}

            {/* Spacious 2-Column Grid for Wide Input Boxes (~400px each) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Field 1: Service (Laboratory) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Service (Laboratory Service) *
                </Label>
                <Controller
                  name="serviceId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue placeholder="Select laboratory service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((svc) => (
                          <SelectItem key={svc.id} value={svc.id}>
                            {svc.Code ? `${svc.Code} - ` : ""}{svc.ServiceName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.serviceId && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.serviceId.message}
                  </p>
                )}
              </div>

              {/* Field 2: Lab Header */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Lab Header
                </Label>
                <Controller
                  name="lab_headers_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "__none" ? "" : val)}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue placeholder="Select lab header" />
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

              {/* Field 3: Required Sample */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Required Sample
                </Label>
                <Controller
                  name="lab_required_sample_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "__none" ? "" : val)}
                      value={field.value || ""}
                    >
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue placeholder="Select sample tube / type" />
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

              {/* Field 4: Status */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Status
                </Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "true")}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
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

              {/* Field 5: Sort Order */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Sort Order
                </Label>
                <Input
                  type="number"
                  {...register("testSort", { valueAsNumber: true })}
                  className="h-10 text-sm font-mono font-medium border-slate-300 rounded-md focus:border-teal-500"
                  placeholder="1"
                />
                {errors.testSort && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.testSort.message}
                  </p>
                )}
              </div>

              {/* Field 6: Expected Time */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Expected Turnaround Time (Minutes)
                </Label>
                <Input
                  type="number"
                  {...register("expectedTime", { valueAsNumber: true })}
                  className="h-10 text-sm font-mono font-medium border-slate-300 rounded-md focus:border-teal-500"
                  placeholder="60"
                />
                {errors.expectedTime && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.expectedTime.message}
                  </p>
                )}
              </div>

              {/* Field 7: Interpretation Notes (Full Width) */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Interpretation / Clinical Reference Notes
                </Label>
                <Textarea
                  {...register("interpretation")}
                  className="w-full min-h-[95px] text-sm border-slate-300 rounded-md focus:border-teal-500 resize-y p-3"
                  placeholder="Optional clinical guidance or interpretation notes displayed on patient reports..."
                />
              </div>
            </div>

            {/* Pinned Action Footer */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 mt-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-5 text-sm font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 px-6 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {editingId ? "Update Test" : "Save Test"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
