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
import labTestService from "@/services/labTest.service";
import departmentService from "@/services/department.service";
import { Loader2, Plus, Search } from "lucide-react";

export default function LaboratoryPage() {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [viewingTest, setViewingTest] = useState(null);

  const [formData, setFormData] = useState({
    TestCode: "",
    TestName: "",
    Category: "",
    DepartmentId: "",
    Price: 0,
    Description: "",
    NormalRange: "",
    Unit: "",
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
      const res = await labTestService.getAll({ search: searchTerm });
      setTests(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No tests found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const resetTests = () => {
    setSearchTerm("");
    setTests([]);
  };

  const openCreate = () => {
    setEditingTest(null);
    setFormData({
      TestCode: "",
      TestName: "",
      Category: "",
      DepartmentId: "",
      Price: 0,
      Description: "",
      NormalRange: "",
      Unit: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEdit = (test) => {
    setEditingTest(test);
    setFormData({
      TestCode: test.TestCode,
      TestName: test.TestName,
      Category: test.Category || "",
      DepartmentId: test.DepartmentId || "",
      Price: test.Price,
      Description: test.Description || "",
      NormalRange: test.NormalRange || "",
      Unit: test.Unit || "",
      isActive: test.isActive,
    });
    setIsDialogOpen(true);
  };

  const openView = (test) => {
    setViewingTest(test);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await labTestService.update(editingTest.Id, formData);
        setMessage({ type: "success", text: "Test updated successfully" });
      } else {
        await labTestService.create(formData);
        setMessage({ type: "success", text: "Test created successfully" });
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
    if (!confirm("Are you sure you want to delete this test?")) return;
    try {
      await labTestService.delete(id);
      setMessage({ type: "success", text: "Test deleted successfully" });
      setTests((prev) => prev.filter((t) => t.Id !== id));
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete test" });
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
          <h1 className="text-2xl font-bold text-foreground">Laboratory</h1>
          <p className="text-muted-foreground mt-1">Manage lab tests and configurations</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Test
        </Button>
      </div>

      <div className="flex gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by Test Code, Name, or Category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />Search
          </Button>
        </form>
        <Button variant="ghost" onClick={resetTests} disabled={loading}>
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
        <DataTable columns={columns} data={tests} filterColumn="TestCode" />
      )}

      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTest ? "Edit Test" : "Add Test"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test Code *</Label>
                  <Input
                    value={formData.TestCode}
                    onChange={(e) => setFormData({ ...formData, TestCode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Name *</Label>
                  <Input
                    value={formData.TestName}
                    onChange={(e) => setFormData({ ...formData, TestName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={formData.Category}
                    onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                  />
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

              <div className="grid grid-cols-3 gap-4">
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
                  <Label>Normal Range</Label>
                  <Input
                    value={formData.NormalRange}
                    onChange={(e) => setFormData({ ...formData, NormalRange: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    value={formData.Unit}
                    onChange={(e) => setFormData({ ...formData, Unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.Description}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  placeholder="Test description"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTest ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {isViewDialogOpen && viewingTest && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Test Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Test Code</p>
                  <p className="font-medium">{viewingTest.TestCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Test Name</p>
                  <p className="font-medium">{viewingTest.TestName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <Badge variant="outline">{viewingTest.Category || "-"}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{viewingTest.department?.DepartmentName || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">{Number(viewingTest.Price).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit</p>
                  <p className="font-medium">{viewingTest.Unit || "-"}</p>
                </div>
              </div>
              {viewingTest.NormalRange && (
                <div>
                  <p className="text-sm text-muted-foreground">Normal Range</p>
                  <p className="text-sm">{viewingTest.NormalRange}</p>
                </div>
              )}
              {viewingTest.Description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{viewingTest.Description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
