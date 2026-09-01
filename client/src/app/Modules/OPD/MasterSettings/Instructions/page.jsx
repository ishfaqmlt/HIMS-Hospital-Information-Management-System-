"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { masterInstructionSchema } from "@/lib/zodeSchema";
import masterInstructionService from "@/services/masterInstruction.service";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { FileText, Plus, Loader2, RefreshCw } from "lucide-react";

export default function InstructionsMasterPage() {
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState([]);
  const [message, setMessage] = useState(null);

  // Dialog & Edit States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete Dialog State
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(masterInstructionSchema),
    defaultValues: {
      instruction: "",
      isActive: true,
    },
  });

  useEffect(() => {
    fetchInstructions();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchInstructions = async () => {
    try {
      setLoading(true);
      const res = await masterInstructionService.getAll();
      setInstructions(res.data || []);
    } catch (error) {
      console.error("Failed to fetch master instruction list:", error);
      setMessage({ type: "error", text: "Failed to load instruction master list." });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    reset({
      instruction: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    reset({
      instruction: item.instruction || "",
      isActive: Boolean(item.isActive),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await masterInstructionService.update(editingItem.id, data);
        setMessage({ type: "success", text: "Instruction updated successfully." });
      } else {
        await masterInstructionService.create(data);
        setMessage({ type: "success", text: "Instruction created successfully." });
      }
      setIsDialogOpen(false);
      fetchInstructions();
    } catch (error) {
      console.error("Save instruction error:", error);
      const errMsg =
        error.response?.data?.message ||
        (error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(", ")
          : "Failed to save instruction record.");
      setMessage({ type: "error", text: errMsg });
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await masterInstructionService.delete(itemToDelete.id);
      setMessage({ type: "success", text: "Instruction deleted successfully." });
      setItemToDelete(null);
      fetchInstructions();
    } catch (error) {
      console.error("Delete instruction error:", error);
      setMessage({ type: "error", text: "Failed to delete instruction record." });
    }
  };

  const columns = getColumns({
    onEdit: openEditDialog,
    onDelete: (item) => setItemToDelete(item),
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-50 text-cyan-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">
              Medication Instructions Master
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage prescription administration instructions in English and Urdu (e.g. After meals, کھانے کے بعد)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInstructions}
            disabled={loading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={openCreateDialog}
            size="sm"
            className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Instruction
          </Button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <Alert
          className={`text-xs py-2 ${
            message.type === "error"
              ? "bg-red-50 text-red-900 border-red-200"
              : "bg-emerald-50 text-emerald-900 border-emerald-200"
          }`}
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Data Table */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
              <span className="text-xs font-medium">Loading instruction records...</span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={instructions}
              filterColumn="instruction"
            />
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-600" />
              {editingItem ? "Edit Instruction" : "Add Instruction"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Instruction <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("instruction")}
                dir="auto"
                placeholder="e.g. After meals, With water, or کھانے کے بعد، پانی کے ساتھ"
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                You can write in English or Urdu text.
              </p>
              {errors.instruction && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.instruction.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3 bg-slate-50/50">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-slate-800">
                  Active Status
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Allow this instruction to appear in prescription dosage options
                </p>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
                className="h-8 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold gap-1.5"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
                {editingItem ? "Update Instruction" : "Save Instruction"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(itemToDelete)} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-slate-900">
              Delete Instruction?
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-600 py-1">
            Are you sure you want to delete instruction &quot;{itemToDelete?.instruction}&quot;? This action cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItemToDelete(null)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
