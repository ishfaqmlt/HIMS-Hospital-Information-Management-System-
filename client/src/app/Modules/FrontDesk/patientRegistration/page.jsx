"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import patientService from "@/services/patient.service";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import { Loader2, Plus, Search, UserPlus } from "lucide-react";

export default function PatientsPage() {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [message, setMessage] = useState(null);

  const [mrnSearch, setMrnSearch] = useState("");
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

  const handleMrnSearch = () => {
    if (!mrnSearch.trim()) {
      setMessage({ type: "error", text: "Please enter an MRN" });
      return;
    }
    searchPatients({ mrn: "MRN-" + mrnSearch });
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

  const handleLoadAll = () => {
    setMrnSearch("");
    setCnicSearch("");
    setMobileSearch("");
    searchPatients({});
  };

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setPrefillMobile("");
    setPrefillCnic("");
    setIsPatientDialogOpen(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setPrefillMobile(patient.mobile || "");
    setPrefillCnic(patient.cnic || "");
    setIsPatientDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Registration</h1>
          <p className="text-muted-foreground mt-1">Manage patient records</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />New Patient
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1">
          <div className="flex items-center h-9 px-2 text-xs bg-muted border border-input rounded-md text-muted-foreground shrink-0">
            MRN-
          </div>
          <Input
            placeholder=""
            value={mrnSearch}
            onChange={(e) => setMrnSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleMrnSearch()}
            className="w-32"
          />
          <Button onClick={handleMrnSearch} disabled={!mrnSearch.trim()}>
            <Search className="h-4 w-4 mr-1" />MRN
          </Button>
        </div>
        <Input
          placeholder="CNIC"
          value={cnicSearch}
          onChange={(e) => setCnicSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCnicSearch()}
          className="w-40"
        />
        <Button onClick={handleCnicSearch} disabled={!cnicSearch.trim()}>
          <Search className="h-4 w-4 mr-1" />CNIC
        </Button>
        <Input
          placeholder="Mobile"
          value={mobileSearch}
          onChange={(e) => setMobileSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleMobileSearch()}
          className="w-40"
        />
        <Button onClick={handleMobileSearch} disabled={!mobileSearch.trim()}>
          <Search className="h-4 w-4 mr-1" />Mobile
        </Button>
        <Button variant="outline" onClick={handleLoadAll}>Show All</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable columns={getColumns({ onEdit: handleEdit })} data={patients} filterColumn="mrn" />
      )}

      <AddPatientDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        editingPatient={editingPatient}
        prefillMobile={prefillMobile}
        prefillCnic={prefillCnic}
        onPatientSaved={(patient) => {
          setIsPatientDialogOpen(false);
          setEditingPatient(null);
          if (patient) {
            searchPatients({ mrn: patient.mrn });
          }
        }}
      />
    </div>
  );
}
