"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { floorSchema } from "@/lib/zodeSchema";
import floorService from "@/services/floorService";
import { Loader2, Plus } from "lucide-react";

export default function FloorMasterPage() {
  const [loading, setLoading] = useState(true);
  const [floors, setFloors] = useState([]);
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(floorSchema),
    defaultValues: {
      FloorName: "",
      isFunctional: true,
    },
  });

  const isFunctional = watch("isFunctional");

  useEffect(() => { loadFloors(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadFloors = async () => {
    try {
      setLoading(true);
      const res = await floorService.getAll();
      setFloors(res.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load floors" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({ FloorName: "", isFunctional: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    reset({ FloorName: item.FloorName, isFunctional: item.isFunctional });
    setIsDialogOpen(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete floor "${item.FloorName}"?`)) return;
    try {
      await floorService.delete(item.id);
      setMessage({ type: "success", text: "Floor deleted successfully" });
      loadFloors();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to delete floor" });
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await floorService.update(editingId, data);
        setMessage({ type: "success", text: "Floor updated successfully" });
      } else {
        await floorService.create(data);
        setMessage({ type: "success", text: "Floor created successfully" });
      }
      setIsDialogOpen(false);
      loadFloors();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  const columns = getColumns({ onEdit: openEdit, onDelete: handleDelete });

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Floor Master</h1>
          <p className="text-muted-foreground mt-1">Manage hospital floors</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Floor
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} data={floors} filterColumn="FloorName" />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Floor" : "Add Floor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Floor Name</Label>
              <Input {...register("FloorName")} placeholder="Enter floor name" />
              {errors.FloorName && <p className="text-sm text-destructive">{errors.FloorName.message}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isFunctional"
                checked={isFunctional}
                onCheckedChange={(checked) => reset({ FloorName: watch("FloorName"), isFunctional: !!checked })}
              />
              <Label htmlFor="isFunctional">Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
