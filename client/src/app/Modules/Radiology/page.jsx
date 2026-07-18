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
import { Textarea } from "@/components/ui/textarea";
import radiologyScanService from "@/services/radiologyScan.service";
import departmentService from "@/services/department.service";
import { Loader2, Plus, Search, Clock } from "lucide-react";

export default function RadiologyPage() {
  const [loading, setLoading] = useState(false);
  const [scans, setScans] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingScan, setEditingScan] = useState(null);
  const [viewingScan, setViewingScan] = useState(null);

  const [formData, setFormData] = useState({
    ScanCode: "",
    ScanName: "",
    Category: "",
    DepartmentId: "",
    Price: 0,
    Description: "",
    PreparationNotes: "",
    DurationMinutes: 30,
    isActive: true,
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      setDepartments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setMessage({ type: "error", text: "Please enter a search term" });
      return;
    }
    try {
      setLoading(true);
      const res = await radiologyScanService.getAll({ search: searchTerm });
      setScans(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No scans found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const resetScans = () => {
    setSearchTerm("");
    setScans([]);
  };

  const openCreate = () => {
    setEditingScan(null);
    setFormData({
      ScanCode: "",
      ScanName: "",
      Category: "",
      DepartmentId: "",
      Price: 0,
      Description: "",
      PreparationNotes: "",
      DurationMinutes: 30,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (scan) => {
    setEditingScan(scan);
    setFormData({
      ScanCode: scan.ScanCode,
      ScanName: scan.ScanName,
      Category: scan.Category || "",
      DepartmentId: scan.DepartmentId || "",
      Price: scan.Price,
      Description: scan.Description || "",
      PreparationNotes: scan.PreparationNotes || "",
      DurationMinutes: scan.DurationMinutes,
      isActive: scan.isActive,
    });
    setIsDialogOpen(true);
  };

  const openView = (scan) => {
    setViewingScan(scan);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingScan) {
        await radiologyScanService.update(editingScan.Id, formData);
        setMessage({ type: "success", text: "Scan updated successfully" });
      } else {
        await radiologyScanService.create(formData);
        setMessage({ type: "success", text: "Scan created successfully" });
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
    if (!confirm("Are you sure you want to delete this scan?")) return;
    try {
      await radiologyScanService.delete(id);
      setMessage({ type: "success", text: "Scan deleted successfully" });
      setScans((prev) => prev.filter((s) => s.Id !== id));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete scan" });
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
          <h1 className="text-2xl font-bold text-foreground">Radiology</h1>
          <p className="text-muted-foreground mt-1">Manage radiology scans and services</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Scan
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by Scan Code, Name, or Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />Search
          </Button>
        </form>
        <Button variant="ghost" onClick={resetScans} disabled={loading}>
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
        <DataTable columns={columns} data={scans} filterColumn="ScanCode" />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingScan ? "Edit Scan" : "Add Scan"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Scan Code *</Label>
                  <Input
                    value={formData.ScanCode}
                    onChange={(e) => setFormData({ ...formData, ScanCode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scan Name *</Label>
                  <Input
                    value={formData.ScanName}
                    onChange={(e) => setFormData({ ...formData, ScanName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.Category}
                    onValueChange={(val) => setFormData({ ...formData, Category: val })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="CT">CT</SelectItem>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.DepartmentId}
                    onValueChange={(val) => setFormData({ ...formData, DepartmentId: val })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.DepartmentName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.Price}
                    onChange={(e) => setFormData({ ...formData, Price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input
                    type="number"
                    value={formData.DurationMinutes}
                    onChange={(e) => setFormData({ ...formData, DurationMinutes: parseInt(e.target.value) || 30 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preparation Notes</Label>
                <Textarea
                  value={formData.PreparationNotes}
                  onChange={(e) => setFormData({ ...formData, PreparationNotes: e.target.value })}
                  placeholder="Preparation instructions for patient"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  placeholder="Scan description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingScan ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isViewDialogOpen && viewingScan && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Scan Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Scan Code</p>
                  <p className="font-medium">{viewingScan.ScanCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Scan Name</p>
                  <p className="font-medium">{viewingScan.ScanName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <Badge variant="outline">{viewingScan.Category || "-"}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{viewingScan.department?.DepartmentName || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">{Number(viewingScan.Price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{viewingScan.DurationMinutes} minutes</p>
                </div>
              </div>
              {viewingScan.PreparationNotes && (
                <div>
                  <p className="text-sm text-muted-foreground">Preparation Notes</p>
                  <p className="text-sm">{viewingScan.PreparationNotes}</p>
                </div>
              )}
              {viewingScan.Description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{viewingScan.Description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
