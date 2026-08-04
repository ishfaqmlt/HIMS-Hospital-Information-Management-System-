"use client";

import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, X, Check, FlaskConical, Activity, Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Tiptap from "@/components/tiptap";
import subHeaderService from "@/services/subHeaders.service";
import testParameterService from "@/services/testParameters.service";
import labBoundingService from "@/services/labBounding.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { testParameterSchema, labBoundingSchema } from "@/lib/zodeSchema";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";

function MasterParametersContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get("id");
  const testName = searchParams.get("testName");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [subHeaders, setSubHeaders] = useState([]);
  const [testParameters, setTestParameters] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Bounding state
  const [isBoundingDialogOpen, setIsBoundingDialogOpen] = useState(false);
  const [boundingDialogError, setBoundingDialogError] = useState(null);
  const [boundingParameter, setBoundingParameter] = useState(null);
  const [boundings, setBoundings] = useState([]);
  const [editingBoundingId, setEditingBoundingId] = useState(null);

  const defaultValues = {
    id: "",
    master_test_id: testId || "",
    testName: testName || "",
    sub_headers_id: "",
    parameterName: "",
    defaultValue: null,
    units: "",
    decimal: 0,
    resultTemplets: "",
    formula: null,
    analyzerCode: null,
    sortNo: 0,
    printOnReciept: true,
    isActive: true,
    normalRange: "",
  };

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(testParameterSchema),
    defaultValues,
  });

  const decimalValue = watch("decimal");

  useEffect(() => {
    if (decimalValue === 0) {
      setValue("resultTemplets", "");
    }
  }, [decimalValue, setValue]);

  // Bounding form
  const boundingDefaultValues = {
    parameterId: "",
    gender: "Both",
    fromAge: 0,
    toAge: 0,
    ageType: "Years",
    lowerBound: 0,
    upperBound: 0,
    lowerCritical: 0,
    upperCritical: 0,
    fromAgeDays: 0,
    toAgeDays: 0,
  };

  const {
    handleSubmit: handleBoundingSubmit,
    control: boundingControl,
    reset: resetBounding,
    formState: { errors: boundingErrors },
  } = useForm({
    resolver: zodResolver(labBoundingSchema),
    defaultValues: boundingDefaultValues,
  });

  const loadSubHeaders = async () => {
    try {
      const res = await subHeaderService.getAll();
      setSubHeaders(res.data || []);
    } catch (error) {
      console.error("Failed to load sub headers:", error);
    }
  };

  const loadTestParameters = async () => {
    if (!testId) return;
    try {
      const res = await testParameterService.getAll({ master_test_id: testId });
      setTestParameters(res.data || []);
    } catch (error) {
      console.error("Failed to load test parameters:", error);
    }
  };

  const loadBoundings = async (parameterId) => {
    try {
      const res = await labBoundingService.getAll({ parameterId });
      setBoundings(res.data || []);
    } catch (error) {
      console.error("Failed to load boundings:", error);
    }
  };

  useEffect(() => {
    loadSubHeaders();
    loadTestParameters();
  }, []);

  useEffect(() => {
    if (!testId) {
      setMessage({
        type: "error",
        text: "Invalid access: Master test ID is required.",
      });
    }
  }, [testId]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const openCreate = () => {
    setEditingId(null);
    setDialogError(null);
    const maxSort =
      testParameters.length > 0
        ? Math.max(...testParameters.map((p) => p.sortNo || 0))
        : 0;
    reset({
      ...defaultValues,
      sortNo: maxSort + 1,
    });
    setIsDialogOpen(true);
  };

  const openEdit = useCallback((rowData) => {
    setEditingId(rowData.id);
    setDialogError(null);
    reset({
      id: rowData.id || "",
      master_test_id: rowData.master_test_id || testId || "",
      testName: rowData.master_test?.testName || testName || "",
      sub_headers_id: rowData.sub_headers_id || "",
      parameterName: rowData.parameterName || "",
      defaultValue: rowData.defaultValue || null,
      units: rowData.units || "",
      decimal: rowData.decimal ?? 0,
      resultTemplets: rowData.resultTemplets || "",
      formula: rowData.formula || null,
      analyzerCode: rowData.analyzerCode || null,
      sortNo: rowData.sortNo || 0,
      printOnReciept: rowData.printOnReciept ?? true,
      isActive: rowData.isActive ?? true,
      normalRange: rowData.normalRange || "",
    });
    setIsDialogOpen(true);
  }, [testId, testName, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setDialogError(null);
    setMessage(null);

    const dataToSend = { ...data };
    dataToSend.master_test_id = testId;
    delete dataToSend.id;
    delete dataToSend.testName;
    if (dataToSend.sortNo === "") dataToSend.sortNo = 0;

    try {
      if (editingId) {
        await testParameterService.update(editingId, dataToSend);
        setMessage({ type: "success", text: "Parameter updated successfully" });
      } else {
        await testParameterService.create(dataToSend);
        setMessage({ type: "success", text: "Parameter created successfully" });
      }
      setIsDialogOpen(false);
      reset(defaultValues);
      setEditingId(null);
      await loadTestParameters();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to save parameter";
      setDialogError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(async (id) => {
    if (!confirm("Are you sure you want to delete this parameter?")) return;
    try {
      await testParameterService.delete(id);
      setMessage({ type: "success", text: "Parameter deleted successfully" });
      await loadTestParameters();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete parameter",
      });
    }
  }, []);

  // Bounding handlers
  const openBoundingDialog = useCallback((rowData) => {
    setBoundingParameter(rowData);
    setEditingBoundingId(null);
    setBoundingDialogError(null);
    resetBounding({
      ...boundingDefaultValues,
      parameterId: rowData.id,
    });
    setIsBoundingDialogOpen(true);
    loadBoundings(rowData.id);
  }, []);

  const calculateDays = (age, ageType) => {
    if (ageType === "Years") return age * 365;
    if (ageType === "Months") return age * 30;
    return age;
  };

  const onBoundingSubmit = async (data) => {
    setLoading(true);
    setBoundingDialogError(null);
    try {
      const dataToSend = {
        ...data,
        fromAgeDays: calculateDays(data.fromAge, data.ageType),
        toAgeDays: calculateDays(data.toAge, data.ageType),
      };
      if (editingBoundingId) {
        await labBoundingService.update(editingBoundingId, dataToSend);
        setMessage({ type: "success", text: "Bounding updated successfully" });
      } else {
        await labBoundingService.create(dataToSend);
        setMessage({ type: "success", text: "Bounding created successfully" });
      }
      resetBounding(boundingDefaultValues);
      setEditingBoundingId(null);
      await loadBoundings(data.parameterId);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to save bounding";
      setBoundingDialogError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBounding = async (id) => {
    if (!confirm("Are you sure you want to delete this bounding?")) return;
    try {
      await labBoundingService.delete(id);
      setMessage({ type: "success", text: "Bounding deleted successfully" });
      if (boundingParameter) {
        await loadBoundings(boundingParameter.id);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete bounding",
      });
    }
  };

  const openEditBounding = (rowData) => {
    setEditingBoundingId(rowData.id);
    setBoundingDialogError(null);
    resetBounding({
      parameterId: rowData.parameterId || boundingParameter?.id || "",
      gender: rowData.gender || "Both",
      fromAge: rowData.fromAge ?? 0,
      toAge: rowData.toAge ?? 0,
      ageType: rowData.ageType || "Years",
      lowerBound: rowData.lowerBound ?? 0,
      upperBound: rowData.upperBound ?? 0,
      lowerCritical: rowData.lowerCritical ?? 0,
      upperCritical: rowData.upperCritical ?? 0,
      fromAgeDays: rowData.fromAgeDays ?? 0,
      toAgeDays: rowData.toAgeDays ?? 0,
    });
  };

  const columns = useMemo(() => {
    return getColumns({
      onEdit: openEdit,
      onDelete: handleDelete,
      onBoundings: openBoundingDialog,
    });
  }, [openEdit, handleDelete, openBoundingDialog]);

  const boundingColumns = useMemo(() => [
    { id: "sl", header: "SL", cell: ({ row }) => <span className="text-xs">{row.index + 1}</span> },
    { accessorKey: "gender", header: "Gender", cell: ({ row }) => <span className="text-xs">{row.getValue("gender")}</span> },
    { accessorKey: "fromAge", header: "From Age", cell: ({ row }) => <span className="text-xs">{row.getValue("fromAge")}</span> },
    { accessorKey: "toAge", header: "To Age", cell: ({ row }) => <span className="text-xs">{row.getValue("toAge")}</span> },
    { accessorKey: "ageType", header: "Age Type", cell: ({ row }) => <span className="text-xs">{row.getValue("ageType")}</span> },
    { accessorKey: "lowerBound", header: "Lower", cell: ({ row }) => <span className="text-xs">{row.getValue("lowerBound")}</span> },
    { accessorKey: "upperBound", header: "Upper", cell: ({ row }) => <span className="text-xs">{row.getValue("upperBound")}</span> },
    { accessorKey: "lowerCritical", header: "Low Crit", cell: ({ row }) => <span className="text-xs">{row.getValue("lowerCritical")}</span> },
    { accessorKey: "upperCritical", header: "Up Crit", cell: ({ row }) => <span className="text-xs">{row.getValue("upperCritical")}</span> },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => openEditBounding(rowData)}>
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs text-destructive hover:text-destructive" onClick={() => handleDeleteBounding(rowData.id)}>
              <Trash2 className="h-3 w-3 mr-1" /> Del
            </Button>
          </div>
        );
      },
    },
  ], []);

  if (!testId) {
    return (
      <div className="p-6 max-w-full mx-auto">
        <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
          <X className="h-4 w-4" />
          Invalid access: Master test ID is required.
        </div>
      </div>
    );
  }

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

      {/* Header Card */}
      <Card className="shadow-sm border border-border/50">
        <CardHeader className="py-2.5 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Test Parameters — {testName || "Unknown Test"}
            </span>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={openCreate}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Parameter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable columns={columns} data={testParameters} filterColumn="parameterName" />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setDialogError(null);
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Parameter" : "Add Parameter"}
            </DialogTitle>
            {testName && (
              <p className="text-xs text-muted-foreground">
                Test: <span className="font-medium text-foreground">{testName}</span>
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {dialogError && (
              <div className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
                <X className="h-3 w-3" />
                {dialogError}
              </div>
            )}
            <div className="grid grid-cols-4 gap-4">
              {/* Sub Header */}
              <div className="space-y-2">
                <Label className="text-xs">Sub Header</Label>
                <Controller
                  name="sub_headers_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(val === "none" ? null : val)} value={field.value || ""}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select Sub-Header" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {subHeaders.map((sh) => (
                          <SelectItem key={sh.id} value={sh.id}>
                            {sh.sub_header_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sub_headers_id && (
                  <p className="text-xs text-destructive">{errors.sub_headers_id.message}</p>
                )}
              </div>

              {/* Parameter Name */}
              <div className="space-y-2">
                <Label className="text-xs">Parameter Name</Label>
                <Controller
                  name="parameterName"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value || ""} className="h-9 text-xs" />
                  )}
                />
                {errors.parameterName && (
                  <p className="text-xs text-destructive">{errors.parameterName.message}</p>
                )}
              </div>

              {/* Default Value */}
              <div className="space-y-2">
                <Label className="text-xs">Default Value</Label>
                <Controller
                  name="defaultValue"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value || ""} className="h-9 text-xs" />
                  )}
                />
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label className="text-xs">Unit</Label>
                <Controller
                  name="units"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value || ""} className="h-9 text-xs" />
                  )}
                />
              </div>

              {/* Decimal */}
              <div className="space-y-2">
                <Label className="text-xs">Decimal</Label>
                <Controller
                  name="decimal"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value ?? 0)}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select decimal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Result Templates */}
              <div className="space-y-2 col-span-2">
                <Label className="text-xs">Result Templates</Label>
                <Controller
                  name="resultTemplets"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value || ""}
                      className="h-9 text-xs"
                    />
                  )}
                />
              </div>

              {/* Formula */}
              <div className="space-y-2">
                <Label className="text-xs">Formula</Label>
                <Controller
                  name="formula"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value || ""} className="h-9 text-xs" />
                  )}
                />
              </div>

              {/* Analyzer Code */}
              <div className="space-y-2">
                <Label className="text-xs">Analyzer Code</Label>
                <Controller
                  name="analyzerCode"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value || ""} className="h-9 text-xs" />
                  )}
                />
              </div>

              {/* Sort No */}
              <div className="space-y-2">
                <Label className="text-xs">Sort No</Label>
                <Controller
                  name="sortNo"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      type="number"
                      className="h-9 text-xs"
                    />
                  )}
                />
              </div>

              {/* Print On Receipt */}
              <div className="space-y-2">
                <Label className="text-xs">Print On Receipt</Label>
                <Controller
                  name="printOnReciept"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val === "true")}
                      value={String(field.value)}
                    >
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Status */}
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

            {/* Normal Range - Full Width */}
            <div className="space-y-2">
              <Label className="text-xs">Normal Range</Label>
              <Controller
                name="normalRange"
                control={control}
                render={({ field }) => (
                  <div className="max-h-[300px] overflow-auto">
                    <Tiptap content={field.value || ""} onChange={field.onChange} />
                  </div>
                )}
              />
              {errors.normalRange && (
                <p className="text-xs text-destructive">{errors.normalRange.message}</p>
              )}
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

      {/* Bounding Dialog */}
      <Dialog open={isBoundingDialogOpen} onOpenChange={(open) => { setIsBoundingDialogOpen(open); if (!open) { setBoundingDialogError(null); setEditingBoundingId(null); } }}>
        <DialogContent className="sm:max-w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBoundingId ? "Edit Bounding" : "Add Bounding"}
            </DialogTitle>
            {boundingParameter && (
              <p className="text-xs text-muted-foreground">
                Parameter: <span className="font-medium text-foreground">{boundingParameter.parameterName}</span>
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleBoundingSubmit(onBoundingSubmit)} className="space-y-4">
            {boundingDialogError && (
              <div className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
                <X className="h-3 w-3" />
                {boundingDialogError}
              </div>
            )}
            <div className="grid grid-cols-9 gap-2 items-end">
              {/* Gender */}
              <div className="space-y-1">
                <Label className="text-[10px]">Gender</Label>
                <Controller
                  name="gender"
                  control={boundingControl}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "Both"}>
                      <SelectTrigger size="sm" className="w-full text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* From Age */}
              <div className="space-y-1">
                <Label className="text-[10px]">From Age</Label>
                <Controller
                  name="fromAge"
                  control={boundingControl}
                  render={({ field }) => (
                    <Input {...field} type="number" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} className="h-8 text-[11px]" />
                  )}
                />
              </div>

              {/* To Age */}
              <div className="space-y-1">
                <Label className="text-[10px]">To Age</Label>
                <Controller
                  name="toAge"
                  control={boundingControl}
                  render={({ field }) => (
                    <Input {...field} type="number" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} className="h-8 text-[11px]" />
                  )}
                />
              </div>

              {/* Age Type */}
              <div className="space-y-1">
                <Label className="text-[10px]">Age Type</Label>
                <Controller
                  name="ageType"
                  control={boundingControl}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "Years"}>
                      <SelectTrigger size="sm" className="w-full text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Years">Years</SelectItem>
                        <SelectItem value="Months">Months</SelectItem>
                        <SelectItem value="Days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Lower Bound */}
              <div className="space-y-1">
                <Label className="text-[10px]">Lower</Label>
                <Controller
                  name="lowerBound"
                  control={boundingControl}
                  render={({ field }) => (
                    <Input {...field} type="number" step="any" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} className="h-8 text-[11px]" />
                  )}
                />
              </div>

              {/* Upper Bound */}
              <div className="space-y-1">
                <Label className="text-[10px]">Upper</Label>
                <Controller
                  name="upperBound"
                  control={boundingControl}
                  render={({ field }) => (
                    <Input {...field} type="number" step="any" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} className="h-8 text-[11px]" />
                  )}
                />
              </div>

              {/* Lower Critical */}
              <div className="space-y-1">
                <Label className="text-[10px]">Low Crit</Label>
                <Controller
                  name="lowerCritical"
                  control={boundingControl}
                  render={({ field }) => (
                    <Input {...field} type="number" step="any" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} className="h-8 text-[11px]" />
                  )}
                />
              </div>

              {/* Upper Critical */}
              <div className="space-y-1">
                <Label className="text-[10px]">Up Crit</Label>
                <Controller
                  name="upperCritical"
                  control={boundingControl}
                  render={({ field }) => (
                    <Input {...field} type="number" step="any" value={field.value ?? 0} onChange={(e) => field.onChange(Number(e.target.value))} className="h-8 text-[11px]" />
                  )}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-1">
                <Button type="submit" size="sm" className="h-8 text-[11px] px-3" disabled={loading}>
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-8 text-[11px] px-3" onClick={() => { setIsBoundingDialogOpen(false); setEditingBoundingId(null); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </form>

          {/* Boundings DataTable */}
          <div className="mt-2">
            <DataTable columns={boundingColumns} data={boundings} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MasterParametersForm() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MasterParametersContent />
    </Suspense>
  );
}
