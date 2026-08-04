"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
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
import labRequiredSampleService from "@/services/labRequiredSample.service";

const requiredSampleSchema = z.object({
  required_sample_name: z.string().min(1, "Required sample name is required"),
});

export default function RequiredSamplesPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [samples, setSamples] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requiredSampleSchema),
    defaultValues: {
      required_sample_name: "",
    },
  });

  const loadSamples = async () => {
    try {
      const res = await labRequiredSampleService.getAll();
      setSamples(res.data || []);
    } catch (error) {
      console.error("Failed to load samples:", error);
    }
  };

  useEffect(() => {
    loadSamples();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const openCreate = () => {
    setEditingId(null);
    reset({ required_sample_name: "" });
    setIsDialogOpen(true);
  };

  const openEdit = async (id) => {
    try {
      setLoading(true);
      const res = await labRequiredSampleService.getById(id);
      const data = res.data;
      setEditingId(data.id);
      reset({ required_sample_name: data.required_sample_name || "" });
      setIsDialogOpen(true);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load sample" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage(null);
    try {
      if (editingId) {
        await labRequiredSampleService.update(editingId, formData);
        setMessage({ type: "success", text: "Sample updated successfully" });
      } else {
        await labRequiredSampleService.create(formData);
        setMessage({ type: "success", text: "Sample created successfully" });
      }
      setIsDialogOpen(false);
      reset({ required_sample_name: "" });
      setEditingId(null);
      await loadSamples();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save sample",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    return getColumns({
      onEdit: openEdit,
    });
  }, []);

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
              Lab Required Samples
            </span>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={openCreate}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Sample
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable columns={columns} data={samples} filterColumn="required_sample_name" />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Sample" : "Add Sample"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Required Sample Name</Label>
              <Input
                {...register("required_sample_name")}
                className="h-9 text-xs"
                placeholder="Enter required sample name"
              />
              {errors.required_sample_name && (
                <p className="text-xs text-destructive">
                  {errors.required_sample_name.message}
                </p>
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
    </div>
  );
}
