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
import { bedMasterSchema } from "@/lib/zodeSchema";
import bedMasterService from "@/services/bedMasterService";
import floorService from "@/services/floorService";
import roomsWardsService from "@/services/roomsWardsService";
import { Loader2, Plus } from "lucide-react";

export default function BedMasterPage() {
  const [loading, setLoading] = useState(true);
  const [beds, setBeds] = useState([]);
  const [floors, setFloors] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
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
    resolver: zodResolver(bedMasterSchema),
    defaultValues: {
      floorId: "",
      roomWardId: "",
      BedNo: "",
      Rent: 0,
      AcCharges: 0,
      isFunctional: true,
    },
  });

  const floorValue = watch("floorId");
  const roomValue = watch("roomWardId");
  const isFunctional = watch("isFunctional");

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (floorValue) {
      const filtered = allRooms.filter((r) => r.floorId === floorValue);
      setFilteredRooms(filtered);
      if (roomValue && !filtered.find((r) => r.id === roomValue)) {
        setValue("roomWardId", "");
      }
    } else {
      setFilteredRooms([]);
    }
  }, [floorValue, allRooms]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [bRes, fRes, rRes] = await Promise.all([
        bedMasterService.getAll(),
        floorService.getAll(),
        roomsWardsService.getAll(),
      ]);
      setBeds(bRes.data);
      setFloors(fRes.data);
      setAllRooms(rRes.data);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({ floorId: "", roomWardId: "", BedNo: "", Rent: 0, AcCharges: 0, isFunctional: true });
    setFilteredRooms([]);
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    const filtered = allRooms.filter((r) => r.floorId === item.floorId);
    setFilteredRooms(filtered);
    reset({
      floorId: item.floorId || "",
      roomWardId: item.roomWardId || "",
      BedNo: item.BedNo || "",
      Rent: item.Rent || 0,
      AcCharges: item.AcCharges || 0,
      isFunctional: item.isFunctional,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await bedMasterService.update(editingId, data);
        setMessage({ type: "success", text: "Bed updated successfully" });
      } else {
        await bedMasterService.create(data);
        setMessage({ type: "success", text: "Bed created successfully" });
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
          <h1 className="text-2xl font-bold text-foreground">Bed Master</h1>
          <p className="text-muted-foreground mt-1">Manage hospital beds</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Bed
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} data={beds} filterColumn="BedNo" />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Bed" : "Add Bed"}</DialogTitle>
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
              <Label>Room/Ward</Label>
              <Select value={roomValue} onValueChange={(val) => setValue("roomWardId", val)} disabled={!floorValue}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={floorValue ? "Select room/ward" : "Select floor first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.RoomWardName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomWardId && <p className="text-sm text-destructive">{errors.roomWardId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Bed No</Label>
              <Input {...register("BedNo")} placeholder="Enter bed number" />
              {errors.BedNo && <p className="text-sm text-destructive">{errors.BedNo.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rent (Rs.)</Label>
                <Input type="number" step="0.01" {...register("Rent")} />
                {errors.Rent && <p className="text-sm text-destructive">{errors.Rent.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>AC Charges (Rs.)</Label>
                <Input type="number" step="0.01" {...register("AcCharges")} />
                {errors.AcCharges && <p className="text-sm text-destructive">{errors.AcCharges.message}</p>}
              </div>
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
