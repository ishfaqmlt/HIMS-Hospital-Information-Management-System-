"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import pharmacyItemService from "@/services/pharmacyItem.service";
import { Loader2, Plus, Search, AlertTriangle } from "lucide-react";

const pharmacySchema = {
  ItemCode: "",
  ItemName: "",
  Category: "",
  Manufacturer: "",
  Unit: "piece",
  PurchasePrice: 0,
  SellingPrice: 0,
  StockQuantity: 0,
  ReorderLevel: 10,
  ExpiryDate: "",
  BatchNo: "",
  isActive: true,
};

export default function PharmacyPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: pharmacySchema,
  });

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage({ type: "error", text: "Please enter a search term" });
      return;
    }
    try {
      setLoading(true);
      const res = await pharmacyItemService.getAll({ search: searchTerm });
      setItems(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No items found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const loadLowStockItems = async () => {
    try {
      setLoading(true);
      setSearchTerm("");
      const res = await pharmacyItemService.getAll({ lowStock: true });
      setItems(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No low stock items found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to load items" });
    } finally {
      setLoading(false);
    }
  };

  const resetItems = () => {
    setSearchTerm("");
    setItems([]);
  };

  const openCreate = () => {
    setEditingItem(null);
    reset(pharmacySchema);
    setIsDialogOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    reset({
      ItemCode: item.ItemCode,
      ItemName: item.ItemName,
      Category: item.Category || "",
      Manufacturer: item.Manufacturer || "",
      Unit: item.Unit,
      PurchasePrice: item.PurchasePrice,
      SellingPrice: item.SellingPrice,
      StockQuantity: item.StockQuantity,
      ReorderLevel: item.ReorderLevel,
      ExpiryDate: item.ExpiryDate ? new Date(item.ExpiryDate).toISOString().split("T")[0] : "",
      BatchNo: item.BatchNo || "",
      isActive: item.isActive,
    });
    setIsDialogOpen(true);
  };

  const openView = (item) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await pharmacyItemService.update(editingItem.Id, data);
        setMessage({ type: "success", text: "Item updated successfully" });
      } else {
        await pharmacyItemService.create(data);
        setMessage({ type: "success", text: "Item created successfully" });
      }
      setIsDialogOpen(false);
      if (searchTerm) {
        handleSearch({ preventDefault: () => {} });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await pharmacyItemService.delete(id);
      setMessage({ type: "success", text: "Item deleted successfully" });
      setItems((prev) => prev.filter((i) => i.Id !== id));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete item" });
    }
  };

  const columns = getColumns({
    onEdit: openEdit,
    onDelete: handleDelete,
    onView: openView,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pharmacy</h1>
          <p className="text-muted-foreground mt-1">Manage medicine inventory</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Item
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by Item Code, Name, Manufacturer, or Batch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />Search
          </Button>
        </form>
        <Button variant="outline" onClick={loadLowStockItems} disabled={loading}>
          <AlertTriangle className="h-4 w-4 mr-2" />Low Stock
        </Button>
        <Button variant="ghost" onClick={resetItems} disabled={loading}>
          Reset
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={columns} data={items} filterColumn="ItemCode" />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Item Code *</Label>
                  <Input {...register("ItemCode", { required: "Item code is required" })} />
                  {errors.ItemCode && <p className="text-sm text-destructive">{errors.ItemCode.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Item Name *</Label>
                  <Input {...register("ItemName", { required: "Item name is required" })} />
                  {errors.ItemName && <p className="text-sm text-destructive">{errors.ItemName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={watch("Category")} onValueChange={(val) => setValue("Category", val)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Capsule">Capsule</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Ointment">Ointment</SelectItem>
                      <SelectItem value="Drops">Drops</SelectItem>
                      <SelectItem value="Inhaler">Inhaler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Manufacturer</Label>
                  <Input {...register("Manufacturer")} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Unit *</Label>
                  <Select value={watch("Unit")} onValueChange={(val) => setValue("Unit", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="bottle">Bottle</SelectItem>
                      <SelectItem value="strip">Strip</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="tube">Tube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Purchase Price *</Label>
                  <Input type="number" step="0.01" {...register("PurchasePrice")} />
                </div>
                <div className="space-y-2">
                  <Label>Selling Price *</Label>
                  <Input type="number" step="0.01" {...register("SellingPrice")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Quantity *</Label>
                  <Input type="number" {...register("StockQuantity")} />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Level *</Label>
                  <Input type="number" {...register("ReorderLevel")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" {...register("ExpiryDate")} />
                </div>
                <div className="space-y-2">
                  <Label>Batch No</Label>
                  <Input {...register("BatchNo")} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isViewDialogOpen && viewingItem && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Item Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Item Code</p>
                  <p className="font-medium">{viewingItem.ItemCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Item Name</p>
                  <p className="font-medium">{viewingItem.ItemName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <Badge variant="outline">{viewingItem.Category || "-"}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{viewingItem.Manufacturer || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit</p>
                  <p className="font-medium">{viewingItem.Unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stock</p>
                  <p className={`font-medium ${viewingItem.StockQuantity <= viewingItem.ReorderLevel ? "text-red-600" : "text-green-600"}`}>
                    {viewingItem.StockQuantity} (Reorder: {viewingItem.ReorderLevel})
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purchase Price</p>
                  <p className="font-medium">{Number(viewingItem.PurchasePrice).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Selling Price</p>
                  <p className="font-medium">{Number(viewingItem.SellingPrice).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Batch No</p>
                  <p className="font-medium">{viewingItem.BatchNo || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">
                    {viewingItem.ExpiryDate ? new Date(viewingItem.ExpiryDate).toLocaleDateString("en-GB") : "-"}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
