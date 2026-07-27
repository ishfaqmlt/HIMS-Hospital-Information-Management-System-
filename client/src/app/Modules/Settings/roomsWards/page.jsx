"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomsWardsSchema } from "@/lib/zodeSchema";
import roomsWardsService from "@/services/roomsWardsService";
import floorService from "@/services/floorService";
import { Loader2, Plus } from "lucide-react";

export default function RoomsWardsPage() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomsWardsSchema),
    defaultValues: {
      floorId: "",
      RoomWardType: "",
      RoomWardName: "",
      isFunctional: true,
    },
  });

  const floorValue = watch("floorId");
  const typeValue = watch("RoomWardType");
  const isFunctional = watch("isFunctional");

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [rRes, fRes] = await Promise.all([
        roomsWardsService.getAll(),
        floorService.getAll(),
      ]);
      setRooms(rRes.data);
      setFloors(fRes.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({ floorId: "", RoomWardType: "", RoomWardName: "", isFunctional: true });
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    reset({
      floorId: item.floorId || "",
      RoomWardType: item.RoomWardType || "",
      RoomWardName: item.RoomWardName || "",
      isFunctional: item.isFunctional,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await roomsWardsService.update(editingId, data);
        setMessage({ type: "success", text: "Room/Ward updated successfully" });
      } else {
        await roomsWardsService.create(data);
        setMessage({ type: "success", text: "Room/Ward created successfully" });
      }
      setIsDialogOpen(false);
      loadAll();
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  const columns = getColumns({ onEdit: openEdit });

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rooms / Wards</h1>
          <p className="text-muted-foreground mt-1">Manage hospital rooms and wards</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Room/Ward
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} data={rooms} filterColumn="RoomWardName" />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Room/Ward" : "Add Room/Ward"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Floor</Label>
              <Select value={floorValue} onValueChange={(val) => setValue("floorId", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.FloorName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.floorId && <p className="text-sm text-destructive">{errors.floorId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Room/Ward Type</Label>
              <Select value={typeValue} onValueChange={(val) => setValue("RoomWardType", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private Room">Private Room</SelectItem>
                  <SelectItem value="Ward">Ward</SelectItem>
                </SelectContent>
              </Select>
              {errors.RoomWardType && <p className="text-sm text-destructive">{errors.RoomWardType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Room/Ward Name</Label>
              <Input {...register("RoomWardName")} placeholder="Enter name" />
              {errors.RoomWardName && <p className="text-sm text-destructive">{errors.RoomWardName.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isFunctional"
                checked={isFunctional}
                onCheckedChange={(checked) => setValue("isFunctional", !!checked)}
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
