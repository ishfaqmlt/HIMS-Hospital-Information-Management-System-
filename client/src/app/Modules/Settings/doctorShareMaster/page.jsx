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
import doctorShareMasterService from "@/services/doctorShareMasterService";
import doctorService from "@/services/doctor.service";
import serviceService from "@/services/serviceService";
import departmentService from "@/services/department.service";
import { Loader2, Plus } from "lucide-react";

export default function DoctorShareMasterPage() {
  const [loading, setLoading] = useState(true);
  const [shares, setShares] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState(null);

  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [doctorShare, setDoctorShare] = useState(100);
  const [hospitalShare, setHospitalShare] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDoctorShare, setEditDoctorShare] = useState(0);
  const [editHospitalShare, setEditHospitalShare] = useState(0);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sRes, dRes, depRes] = await Promise.all([
        doctorShareMasterService.getAll(),
        doctorService.getAll(),
        departmentService.getAll(),
      ]);
      setShares(sRes.data);
      setDoctors(dRes.data.filter((d) => d.Name !== "Self"));
      setDepartments(depRes.data);
    } catch {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const loadServicesByDepartment = async (departmentId, doctorId) => {
    if (!departmentId) {
      setServices([]);
      setSelectedServices([]);
      return;
    }
    try {
      const res = await serviceService.getAll({ departmentId });
      setServices(res.data);

      if (doctorId) {
        const shareRes = await doctorShareMasterService.getAll({ doctorId, DepartmentId: departmentId });
        const existingServiceIds = shareRes.data.map((s) => s.ServiceId);
        setSelectedServices(existingServiceIds);
      } else {
        setSelectedServices([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDoctorChange = (val) => {
    setSelectedDoctor(val);
    loadSharesByDoctor(val);
    if (selectedDepartment) {
      loadServicesByDepartment(selectedDepartment, val);
    }
  };

  const handleDepartmentChange = (val) => {
    setSelectedDepartment(val);
    loadServicesByDepartment(val, selectedDoctor);
  };

  const loadSharesByDoctor = async (doctorId) => {
    if (!doctorId) {
      setShares([]);
      return;
    }
    try {
      const res = await doctorShareMasterService.getAll({ doctorId });
      setShares(res.data);
    } catch {
      setShares([]);
    }
  };

  const toggleAllCheck = () => {
    if (allChecked) {
      setSelectedServices([]);
    } else {
      setSelectedServices(services.map((s) => s.id));
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleAdd = async () => {
    if (!selectedDoctor) {
      setMessage({ type: "error", text: "Please select a consultant" });
      return;
    }
    if (!selectedDepartment) {
      setMessage({ type: "error", text: "Please select a department" });
      return;
    }
    if (selectedServices.length === 0) {
      setMessage({ type: "error", text: "Please select at least one service" });
      return;
    }
    setLoading(true);
    try {
      const res = await doctorShareMasterService.bulkCreate({
        doctorId: selectedDoctor,
        DepartmentId: selectedDepartment,
        DoctorShare: doctorShare,
        hospitalShare: hospitalShare,
        serviceIds: selectedServices,
      });
      setMessage({ type: "success", text: res.data.message });
      setSelectedServices([]);
      loadSharesByDoctor(selectedDoctor);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to add shares" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedServices.length === 0) {
      setMessage({ type: "error", text: "Please select services to remove" });
      return;
    }
    if (!confirm(`Remove share for ${selectedServices.length} selected service(s)?`)) return;

    setLoading(true);
    try {
      const idsToRemove = shares
        .filter((s) => selectedServices.includes(s.ServiceId))
        .map((s) => s.Id);
      if (idsToRemove.length > 0) {
        await doctorShareMasterService.bulkDelete(idsToRemove);
        setMessage({ type: "success", text: "Shares removed successfully" });
        setSelectedServices([]);
        loadSharesByDoctor(selectedDoctor);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to remove shares" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedDoctor("");
    setSelectedDepartment("");
    setDoctorShare(100);
    setHospitalShare(0);
    setSelectedServices([]);
    setServices([]);
    setShares([]);
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setEditDoctorShare(item.DoctorShare);
    setEditHospitalShare(item.hospitalShare);
    setIsEditDialogOpen(true);
  };

  const handleUpdateShare = async () => {
    if (!editingItem) return;
    try {
      await doctorShareMasterService.update(editingItem.Id, {
        DoctorShare: editDoctorShare,
        hospitalShare: editHospitalShare,
      });
      setMessage({ type: "success", text: "Share updated successfully" });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      loadSharesByDoctor(selectedDoctor);
    } catch {
      setMessage({ type: "error", text: "Failed to update share" });
    }
  };

  const columns = getColumns({ onEdit: openEditDialog, onDelete: () => {} });

  const allChecked = services.length > 0 && selectedServices.length === services.length;

  useEffect(() => {
    const init = async () => {
      await loadAll();
    };
    init();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Doctor Share</h1>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - Bulk Add Form */}
        <div className="col-span-4 border rounded-lg p-4 space-y-4 bg-card">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Consultant</Label>
            <Select value={selectedDoctor} onValueChange={handleDoctorChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select consultant" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.Name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Department</Label>
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.DepartmentName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Consultant Share %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={doctorShare}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDoctorShare(val);
                  setHospitalShare(100 - val);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hospital Share %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={hospitalShare}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setHospitalShare(val);
                  setDoctorShare(100 - val);
                }}
              />
            </div>
          </div>

          {services.length > 0 && (
            <>
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  id="allCheck"
                  checked={allChecked}
                  onCheckedChange={toggleAllCheck}
                />
                <Label htmlFor="allCheck" className="text-sm font-medium cursor-pointer">
                  All Check / Un Check
                </Label>
              </div>

              <div className="border rounded-md max-h-[400px] overflow-y-auto">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-2 px-3 py-1.5 border-b last:border-b-0 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <span className="text-sm">{service.ServiceName}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reset
            </Button>
            <Button className="flex-1" onClick={handleAdd} disabled={loading || !selectedDoctor || !selectedDepartment || selectedServices.length === 0}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Add
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleRemoveSelected} disabled={selectedServices.length === 0}>
              Remove Share
            </Button>
          </div>
        </div>

        {/* Right Panel - DataTable */}
        <div className="col-span-8 border rounded-lg p-4 bg-card">
          {selectedDoctor && (
            <h2 className="text-lg font-semibold text-center mb-4 pb-2 border-b bg-muted/50 rounded-md py-2">
              {doctors.find((d) => d.id === selectedDoctor)?.Name || "Doctor"}
            </h2>
          )}
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <DataTable columns={columns} data={shares} filterColumn="serviceName" />
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Edit Share</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Consultant Share %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editDoctorShare}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditDoctorShare(val);
                    setEditHospitalShare(100 - val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Hospital Share %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editHospitalShare}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditHospitalShare(val);
                    setEditDoctorShare(100 - val);
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateShare}>Update</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
