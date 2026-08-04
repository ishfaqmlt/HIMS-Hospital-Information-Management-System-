"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { subHeaderSchema } from "@/lib/zodeSchema";
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
import subHeaderService from "@/services/subHeaders.service";

export default function SubHeadersPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [subHeaders, setSubHeaders] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subHeaderSchema),
    defaultValues: {
      sub_header_name: "",
    },
  });

  const loadSubHeaders = async () => {
    try {
      const res = await subHeaderService.getAll();
      setSubHeaders(res.data || []);
    } catch (error) {
      console.error("Failed to load sub headers:", error);
    }
  };

  useEffect(() => {
    loadSubHeaders();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const openCreate = () => {
    setEditingId(null);
    reset({ sub_header_name: "" });
    setIsDialogOpen(true);
  };

  const openEdit = async (id) => {
    try {
      setLoading(true);
      const res = await subHeaderService.getById(id);
      const data = res.data;
      setEditingId(data.id);
      reset({ sub_header_name: data.sub_header_name || "" });
      setIsDialogOpen(true);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load sub header" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage(null);
    try {
      if (editingId) {
        await subHeaderService.update(editingId, formData);
        setMessage({ type: "success", text: "Sub header updated successfully" });
      } else {
        await subHeaderService.create(formData);
        setMessage({ type: "success", text: "Sub header created successfully" });
      }
      setIsDialogOpen(false);
      reset({ sub_header_name: "" });
      setEditingId(null);
      await loadSubHeaders();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save sub header",
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
              Lab Sub Headers
            </span>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={openCreate}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Sub Header
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable columns={columns} data={subHeaders} filterColumn="sub_header_name" />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Sub Header" : "Add Sub Header"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Sub Header Name</Label>
              <Input
                {...register("sub_header_name")}
                className="h-9 text-xs"
                placeholder="Enter sub header name"
              />
              {errors.sub_header_name && (
                <p className="text-xs text-destructive">
                  {errors.sub_header_name.message}
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
