"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import patientService from "@/services/patient.service";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { Loader2, Plus, Search, CalendarDays, UserPlus } from "lucide-react";

export default function PatientsPage() {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState(null);

  const [patientIdSearch, setPatientIdSearch] = useState("");
  const [cnicSearch, setCnicSearch] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");

  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [prefillMobile, setPrefillMobile] = useState("");
  const [prefillCnic, setPrefillCnic] = useState("");

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const searchPatients = async (params) => {
    try {
      setLoading(true);
      const res = await patientService.getAll(params);
      setPatients(res.data);
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No patients found" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Search failed" });
    } finally {
      setLoading(false);
    }
  };

  const handlePatientIdSearch = () => {
    if (!patientIdSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a Patient ID" });
      return;
    }
    searchPatients({ patientId: patientIdSearch });
  };

  const handleCnicSearch = () => {
    if (!cnicSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a CNIC" });
      return;
    }
    searchPatients({ cnic: cnicSearch });
  };

  const handleMobileSearch = () => {
    if (!mobileSearch.trim()) {
      setMessage({ type: "error", text: "Please enter a Mobile number" });
      return;
    }
    searchPatients({ mobile: mobileSearch });
  };

  const loadTodaysPatients = async () => {
    setPatientIdSearch("");
    setCnicSearch("");
    setMobileSearch("");
    await searchPatients({ today: true });
  };

  const resetPatients = () => {
    setPatientIdSearch("");
    setCnicSearch("");
    setMobileSearch("");
    setPatients([]);
  };

  const openCreateDialog = () => {
    setEditingPatient(null);
    setPrefillMobile(mobileSearch);
    setPrefillCnic(cnicSearch);
    setIsPatientDialogOpen(true);
  };

  const openEditDialog = (patient) => {
    setEditingPatient(patient);
    setPrefillMobile("");
    setPrefillCnic("");
    setIsPatientDialogOpen(true);
  };

  const handlePatientSaved = () => {
    if (editingPatient) {
      searchPatients({ patientId: editingPatient.patientId });
    } else {
      setPatients([]);
    }
  };

  const columns = getColumns({ onEdit: openEditDialog });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Search Patients</h2>
        <p className="text-muted-foreground">Search Historical Records</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Patient ID"
              value={patientIdSearch}
              onChange={(e) => setPatientIdSearch(e.target.value)}
            />
            <Button onClick={handlePatientIdSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="CNIC"
              value={cnicSearch}
              onChange={(e) => setCnicSearch(e.target.value)}
            />
            <Button onClick={handleCnicSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Mobile Number"
              value={mobileSearch}
              onChange={(e) => setMobileSearch(e.target.value)}
            />
            <Button onClick={handleMobileSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button variant="outline" onClick={loadTodaysPatients} disabled={loading}>
            <CalendarDays className="h-4 w-4 mr-2" />Today's Patients
          </Button>
          <Button variant="ghost" onClick={resetPatients} disabled={loading}>
            Reset
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground mt-1">Manage patient records</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />Add Patient
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
        <DataTable columns={columns} data={patients} filterColumn="pName" />
      )}

      <AddPatientDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onPatientAdded={handlePatientSaved}
        editingPatient={editingPatient}
        prefillMobile={prefillMobile}
        prefillCnic={prefillCnic}
      />
    </div>
  );
}
