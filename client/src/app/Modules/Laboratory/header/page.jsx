"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { labHeaderSchema } from "@/lib/zodeSchema";
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
import labHeaderService from "@/services/labHeader.service";

export default function LabHeadersPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(labHeaderSchema),
    defaultValues: {
      header_name: "",
    },
  });

  const loadHeaders = async () => {
    try {
      const res = await labHeaderService.getAll();
      setHeaders(res.data || []);
    } catch (error) {
      console.error("Failed to load headers:", error);
    }
  };

  useEffect(() => {
    loadHeaders();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const openCreate = () => {
    setEditingId(null);
    reset({ header_name: "" });
    setIsDialogOpen(true);
  };

  const openEdit = async (id) => {
    try {
      setLoading(true);
      const res = await labHeaderService.getById(id);
      const data = res.data;
      setEditingId(data.id);
      reset({ header_name: data.header_name || "" });
      setIsDialogOpen(true);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load header" });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    setMessage(null);
    try {
      if (editingId) {
        await labHeaderService.update(editingId, formData);
        setMessage({ type: "success", text: "Header updated successfully" });
      } else {
        await labHeaderService.create(formData);
        setMessage({ type: "success", text: "Header created successfully" });
      }
      setIsDialogOpen(false);
      reset({ header_name: "" });
      setEditingId(null);
      await loadHeaders();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save header",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await labHeaderService.delete(deleteId);
      setMessage({ type: "success", text: "Header deleted successfully" });
      setDeleteDialogOpen(false);
      setDeleteId(null);
      await loadHeaders();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete header" });
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    return getColumns({
      onEdit: openEdit,
      onDelete: (id) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
      },
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
              Lab Headers
            </span>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white"
              onClick={openCreate}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Header
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <DataTable columns={columns} data={headers} filterColumn="header_name" />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Header" : "Add Header"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Header Name</Label>
              <Input
                {...register("header_name")}
                className="h-9 text-xs"
                placeholder="Enter header name"
              />
              {errors.header_name && (
                <p className="text-xs text-destructive">
                  {errors.header_name.message}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this header? This action cannot be
            undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
