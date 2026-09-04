"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzerSchema } from "@/lib/zodeSchema";
import labAnalyzerService from "@/services/labAnalyzer.service";
import {
  Cpu,
  Plus,
  Check,
  X,
  Loader2,
  Wifi,
  Cable,
  Activity,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
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
} from "@/components/ui/dialog";

export default function AnalyzerSetupPage() {
  const [analyzers, setAnalyzers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(analyzerSchema),
    defaultValues: {
      name: "",
      manufacturer: "",
      model: "",
      communicationType: "TCP",
      protocol: "ASTM",
      direction: "UNIDIRECTIONAL",
      host: "192.168.1.100",
      port: 5100,
      comPort: "COM1",
      baudRate: 9600,
      parity: "None",
      dataBits: 8,
      stopBits: 1,
      isActive: true,
    },
  });

  const watchedCommType = useWatch({
    control,
    name: "communicationType",
    defaultValue: "TCP",
  });

  const fetchAnalyzers = async () => {
    try {
      setLoading(true);
      const res = await labAnalyzerService.getAll();
      setAnalyzers(res.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load laboratory analyzers." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadAnalyzers = async () => {
      try {
        setLoading(true);
        const res = await labAnalyzerService.getAll();
        if (!isCancelled) {
          setAnalyzers(res.data || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setMessage({ type: "error", text: "Failed to load laboratory analyzers." });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalyzers();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({
      name: "",
      manufacturer: "",
      model: "",
      communicationType: "TCP",
      protocol: "ASTM",
      direction: "UNIDIRECTIONAL",
      host: "192.168.1.100",
      port: 5100,
      comPort: "COM1",
      baudRate: 9600,
      parity: "None",
      dataBits: 8,
      stopBits: 1,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || "",
      manufacturer: item.manufacturer || "",
      model: item.model || "",
      communicationType: item.communicationType || "TCP",
      protocol: item.protocol || "ASTM",
      direction: item.direction || "UNIDIRECTIONAL",
      host: item.host || "",
      port: item.port ?? 5100,
      comPort: item.comPort || "",
      baudRate: item.baudRate ?? 9600,
      parity: item.parity || "None",
      dataBits: item.dataBits ?? 8,
      stopBits: item.stopBits ?? 1,
      isActive: item.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      if (editingItem) {
        await labAnalyzerService.update(editingItem.id, data);
        setMessage({ type: "success", text: "Analyzer updated successfully." });
      } else {
        await labAnalyzerService.create(data);
        setMessage({ type: "success", text: "Analyzer created successfully." });
      }
      setIsDialogOpen(false);
      fetchAnalyzers();
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save analyzer.",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await labAnalyzerService.delete(deletingId);
      setMessage({ type: "success", text: "Analyzer deleted successfully." });
      fetchAnalyzers();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to delete analyzer." });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const columns = getColumns({
    onEdit: openEditDialog,
    onDelete: confirmDelete,
  });

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 rounded-xl text-white shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-teal-400" />
            Laboratory Analyzer Master Setup
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Configure automated laboratory instruments, TCP/IP network interfaces & RS-232 serial ports
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 px-3 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs border-0 cursor-pointer"
          onClick={openCreateDialog}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add New Analyzer
        </Button>
      </div>

      {/* Alert Banners */}
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

      {/* DataTable List */}
      <Card className="shadow-xs border border-slate-200/90 rounded-xl overflow-hidden">
        <CardHeader className="py-3 px-4 bg-slate-50 border-b">
          <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-700" />
            Configured Analyzers ({analyzers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-xs text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              <span>Loading analyzers...</span>
            </div>
          ) : (
            <DataTable columns={columns} data={analyzers} filterColumn="name" />
          )}
        </CardContent>
      </Card>

      {/* Widescreen Create / Edit Analyzer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-4xl sm:!max-w-4xl w-[95vw] md:w-[850px] max-h-[92vh] overflow-y-auto p-6 sm:p-7">
          <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-teal-600" />
              {editingItem ? "Edit Analyzer Settings" : "Configure New Laboratory Analyzer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Spacious 2-Column Grid Layout (~400px per field) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Analyzer Name (Full Width) */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Analyzer Name *</Label>
                <Input
                  {...register("name")}
                  className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white"
                  placeholder="e.g. Sysmex XN-550 Hematology Analyzer"
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Manufacturer */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Manufacturer</Label>
                <Input
                  {...register("manufacturer")}
                  className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white"
                  placeholder="e.g. Sysmex, Roche, Mindray, Abbott"
                />
              </div>

              {/* Model Number */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Model Number</Label>
                <Input
                  {...register("model")}
                  className="h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white"
                  placeholder="e.g. XN-550, Cobas c311, BS-240"
                />
              </div>

              {/* Communication Medium */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Communication Medium *</Label>
                <Controller
                  name="communicationType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue placeholder="Select communication medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TCP">TCP / IP (Network Socket)</SelectItem>
                        <SelectItem value="SERIAL">Serial RS-232 (COM Port)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Protocol */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Protocol *</Label>
                <Controller
                  name="protocol"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue placeholder="Select protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASTM">ASTM E1381 / E1394 Standard</SelectItem>
                        <SelectItem value="HL7">HL7 v2.x Standard</SelectItem>
                        <SelectItem value="CUSTOM">Custom Frame Protocol</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Direction */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Transmission Direction *</Label>
                <Controller
                  name="direction"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                        <SelectValue placeholder="Select transmission direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNIDIRECTIONAL">
                          Unidirectional (Analyzer sends patient test results directly to HIMS)
                        </SelectItem>
                        <SelectItem value="BIDIRECTIONAL">
                          Bidirectional (HIMS sends test worklist & receives verified results)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Conditional Network / Serial Card */}
              {watchedCommType === "TCP" ? (
                <div className="md:col-span-2 p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-teal-600" />
                    Network TCP/IP Interface Settings
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Host IP / Address</Label>
                      <Input
                        {...register("host")}
                        className="h-10 text-sm font-mono border-slate-300 rounded-md focus:border-teal-500 bg-white"
                        placeholder="e.g. 192.168.1.100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Network Port</Label>
                      <Input
                        type="number"
                        {...register("port", { valueAsNumber: true })}
                        className="h-10 text-sm font-mono border-slate-300 rounded-md focus:border-teal-500 bg-white"
                        placeholder="e.g. 5100"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 p-4 bg-slate-50/90 rounded-xl border border-slate-200/90 space-y-3">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Cable className="h-4 w-4 text-amber-600" />
                    RS-232 Serial Port (COM) Settings
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">COM Port</Label>
                      <Input
                        {...register("comPort")}
                        className="h-10 text-sm font-mono border-slate-300 rounded-md focus:border-teal-500 bg-white"
                        placeholder="e.g. COM1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Baud Rate</Label>
                      <Input
                        type="number"
                        {...register("baudRate", { valueAsNumber: true })}
                        className="h-10 text-sm font-mono border-slate-300 rounded-md focus:border-teal-500 bg-white"
                        placeholder="e.g. 9600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Parity</Label>
                      <Controller
                        name="parity"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value || "None"} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full h-10 text-sm font-medium border-slate-300 rounded-md focus:border-teal-500 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="None">None</SelectItem>
                              <SelectItem value="Even">Even</SelectItem>
                              <SelectItem value="Odd">Odd</SelectItem>
                              <SelectItem value="Mark">Mark</SelectItem>
                              <SelectItem value="Space">Space</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Data Bits</Label>
                      <Input
                        type="number"
                        {...register("dataBits", { valueAsNumber: true })}
                        className="h-10 text-sm font-mono border-slate-300 rounded-md focus:border-teal-500 bg-white"
                        placeholder="8"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Stop Bits</Label>
                      <Input
                        type="number"
                        step="0.5"
                        {...register("stopBits", { valueAsNumber: true })}
                        className="h-10 text-sm font-mono border-slate-300 rounded-md focus:border-teal-500 bg-white"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Active Analyzer Switch */}
              <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/90">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-slate-900 cursor-pointer">
                    Enable Analyzer
                  </Label>
                  <p className="text-xs text-slate-500">
                    Active analyzers actively listen for device connections and incoming result frames
                  </p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
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
                className="h-10 px-6 text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs cursor-pointer"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {editingItem ? "Update Analyzer" : "Save Analyzer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="!max-w-md w-[95vw] md:w-[450px] p-6">
          <DialogHeader className="pb-3 border-b">
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-600" />
              Delete Analyzer Setup?
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete this laboratory analyzer configuration? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 mt-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5 text-sm font-semibold border-slate-300 hover:bg-slate-100 cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 px-5 text-sm bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs cursor-pointer"
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
