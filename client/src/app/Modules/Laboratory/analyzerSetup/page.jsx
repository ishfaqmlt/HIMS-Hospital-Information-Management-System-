"use client";
import React, { useState, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analyzerSchema } from "@/lib/zodeSchema";
import labAnalyzerService from "@/services/labAnalyzer.service";
import {
  Cpu,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  Wifi,
  Cable,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
} from "@/components/ui/dialog";

export default function AnalyzerSetupPage() {
  const [analyzers, setAnalyzers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
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
          className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs border-0"
          onClick={openCreateDialog}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add New Analyzer
        </Button>
      </div>

      {/* Alert Banners */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-rose-50 text-rose-900 border-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <X className="h-4 w-4 text-rose-600" />
          )}
          {message.text}
        </div>
      )}

      {/* DataTable List */}
      <Card className="shadow-xs border border-slate-200">
        <CardHeader className="py-3 bg-slate-50 border-b">
          <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Activity className="h-4 w-4 text-teal-700" />
            Configured Analyzers ({analyzers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-xs text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-teal-600 mb-1" />
              Loading analyzers...
            </div>
          ) : (
            <DataTable columns={columns} data={analyzers} filterColumn="name" />
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-teal-700" />
              {editingItem ? "Edit Analyzer Settings" : "Configure New Laboratory Analyzer"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Analyzer Name *</Label>
                <Input
                  {...register("name")}
                  className="h-8 text-xs bg-white border-slate-200"
                  placeholder="e.g. Sysmex XN-550 Hematology Analyzer"
                />
                {errors.name && <p className="text-[11px] text-rose-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Manufacturer</Label>
                <Input
                  {...register("manufacturer")}
                  className="h-8 text-xs bg-white border-slate-200"
                  placeholder="e.g. Sysmex, Roche, Mindray"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Model Number</Label>
                <Input
                  {...register("model")}
                  className="h-8 text-xs bg-white border-slate-200"
                  placeholder="e.g. XN-550, BS-240"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Communication Medium *</Label>
                <Controller
                  name="communicationType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TCP">TCP / IP (Network Socket)</SelectItem>
                        <SelectItem value="SERIAL">Serial RS-232 (COM Port)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Protocol *</Label>
                <Controller
                  name="protocol"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Select protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASTM">ASTM E1381 / E1394</SelectItem>
                        <SelectItem value="HL7">HL7 v2.x</SelectItem>
                        <SelectItem value="CUSTOM">Custom Frame Protocol</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1 col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Direction *</Label>
                <Controller
                  name="direction"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-8 text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNIDIRECTIONAL">Unidirectional (Analyzer Sends Results to HIMS)</SelectItem>
                        <SelectItem value="BIDIRECTIONAL">Bidirectional (HIMS Sends Worklist & Receives Results)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Conditional Medium Options */}
            {watchedCommType === "TCP" ? (
              <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200 space-y-2">
                <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-sky-700" /> Network TCP/IP Settings
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">Host IP / Address</Label>
                    <Input
                      {...register("host")}
                      className="h-7 text-xs font-mono bg-white border-slate-200"
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">Port</Label>
                    <Input
                      type="number"
                      {...register("port", { valueAsNumber: true })}
                      className="h-7 text-xs font-mono bg-white border-slate-200"
                      placeholder="5100"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <Cable className="h-3.5 w-3.5 text-amber-700" /> RS-232 Serial Port (COM) Settings
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">COM Port</Label>
                    <Input
                      {...register("comPort")}
                      className="h-7 text-xs font-mono bg-white border-slate-200"
                      placeholder="COM1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">Baud Rate</Label>
                    <Input
                      type="number"
                      {...register("baudRate", { valueAsNumber: true })}
                      className="h-7 text-xs font-mono bg-white border-slate-200"
                      placeholder="9600"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">Parity</Label>
                    <Controller
                      name="parity"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || "None"} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full h-7 text-xs bg-white border-slate-200">
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
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">Data Bits</Label>
                    <Input
                      type="number"
                      {...register("dataBits", { valueAsNumber: true })}
                      className="h-7 text-xs font-mono bg-white border-slate-200"
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-medium text-slate-700">Stop Bits</Label>
                    <Input
                      type="number"
                      step="0.5"
                      {...register("stopBits", { valueAsNumber: true })}
                      className="h-7 text-xs font-mono bg-white border-slate-200"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs font-semibold text-slate-700 cursor-pointer">Active Analyzer</Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <DialogFooter className="pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs border-slate-200"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                disabled={saving}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                {editingItem ? "Update Analyzer" : "Save Analyzer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">Delete Analyzer Setup?</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-600">
            Are you sure you want to delete this laboratory analyzer configuration? This action cannot be undone.
          </p>
          <DialogFooter className="pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs border-slate-200"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
