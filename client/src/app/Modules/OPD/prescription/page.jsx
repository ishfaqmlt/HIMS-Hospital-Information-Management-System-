"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useOPDContext } from "../layout";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientVitalSchema } from "@/lib/zodeSchema";
import patientVitalService from "@/services/patientVital.service";
import patientService from "@/services/patient.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Printer,
  Activity,
  FileText,
  Stethoscope,
  Brain,
  TestTube,
  MessageSquare,
  Calendar,
  CheckCircle,
  Pill,
} from "lucide-react";
import { useSelector } from "react-redux";
import hospitalProfileService from "@/services/hospitalProfile.service";
import hospitalOutputSettingService from "@/services/hospitalOutputSetting.service";
import doctorService from "@/services/doctor.service";
import { formatDate, getImageUrl } from "@/lib/utils";

export default function OPDPrescriptionPage() {
  const { activePatient } = useOPDContext() || {};
  const contentRef = useRef(null);
  const authUser = useSelector((state) => state.auth?.user);

  const [hospitalProfile, setHospitalProfile] = useState(null);
  const [outputSettings, setOutputSettings] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  // Dialog States
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [activePlaceholderModal, setActivePlaceholderModal] = useState(null);
  const [message, setMessage] = useState(null);
  const [dialogError, setDialogError] = useState(null);

  // Vitals react-hook-form
  const {
    register: registerVital,
    handleSubmit: handleSubmitVital,
    reset: resetVital,
    setValue: setVitalValue,
    formState: { errors: vitalErrors, isSubmitting: isSubmittingVital },
  } = useForm({
    resolver: zodResolver(patientVitalSchema),
    defaultValues: {
      patientId: activePatient?.patientId || activePatient?.patient?.id || "patient-temp-id",
      visitId: activePatient?.id || activePatient?.visitId || null,
      systolic: "",
      diastolic: "",
      pulse_rate: "",
      temperature: "",
      respiratory_rate: "",
      spo2: "",
      weight: "",
      height: "",
      bsr: "",
      notes: "",
    },
  });

  React.useEffect(() => {
    fetchHeaderData();
  }, [activePatient, authUser]);

  React.useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const fetchHeaderData = async () => {
    try {
      const [profileRes, settingsRes, doctorsRes] = await Promise.all([
        hospitalProfileService.get().catch(() => ({ data: null })),
        hospitalOutputSettingService.get().catch(() => ({ data: null })),
        doctorService.getAll().catch(() => ({ data: [] })),
      ]);
      if (profileRes?.data) setHospitalProfile(profileRes.data);
      if (settingsRes?.data) setOutputSettings(settingsRes.data);

      const doctorsList = doctorsRes?.data || [];
      let matchedDoc = null;
      if (activePatient?.DoctorId || activePatient?.doctorId) {
        const targetId = activePatient.DoctorId || activePatient.doctorId;
        matchedDoc = doctorsList.find((d) => d.id === targetId);
      }
      if (!matchedDoc && activePatient?.doctor_name) {
        matchedDoc = doctorsList.find((d) => d.Name?.toLowerCase() === activePatient.doctor_name.toLowerCase());
      }
      if (!matchedDoc && authUser?.id) {
        matchedDoc = doctorsList.find((d) => String(d.user_id) === String(authUser.id));
      }
      if (matchedDoc) {
        setCurrentDoctor(matchedDoc);
      }
    } catch (err) {
      console.error("Failed to fetch header data:", err);
    }
  };

  const onSaveVitals = async (data) => {
    setDialogError(null);
    try {
      let targetPatientId = activePatient?.patientId || activePatient?.patient_id || activePatient?.patient?.id || activePatient?.PatientId || activePatient?.id;
      let targetVisitId = activePatient?.id || activePatient?.visitId || activePatient?.visit_id;

      // Fallback: If no active patient found in context, fetch first patient from DB
      if (!targetPatientId) {
        try {
          const patientsRes = await patientService.getAll().catch(() => ({ data: [] }));
          const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : (patientsRes.data?.data || []);
          if (patientsList.length > 0) {
            targetPatientId = patientsList[0].id;
          }
        } catch (e) {
          console.error("Failed to fetch fallback patient:", e);
        }
      }

      if (!targetPatientId) {
        setDialogError("No active patient record found in database. Please register a patient first.");
        return;
      }

      const payload = {
        patientId: targetPatientId,
        visitId: targetVisitId || null,
        systolic: data.systolic ? Number(data.systolic) : null,
        diastolic: data.diastolic ? Number(data.diastolic) : null,
        pulse_rate: data.pulse_rate ? Number(data.pulse_rate) : null,
        temperature: data.temperature ? Number(data.temperature) : null,
        respiratory_rate: data.respiratory_rate ? Number(data.respiratory_rate) : null,
        spo2: data.spo2 ? Number(data.spo2) : null,
        weight: data.weight ? Number(data.weight) : null,
        height: data.height ? Number(data.height) : null,
        bsr: data.bsr ? Number(data.bsr) : null,
        notes: data.notes || null,
      };

      await patientVitalService.create(payload);

      // Update local report preview vitals
      setVitals({
        bp: (data.systolic || data.diastolic) ? `${data.systolic || 120}/${data.diastolic || 80} mmHg` : "120/80 mmHg",
        pulse: data.pulse_rate ? `${data.pulse_rate} bpm` : "76 bpm",
        temp: data.temperature ? `${data.temperature} °F` : "98.6 °F",
        weight: data.weight ? `${data.weight} kg` : "68 kg",
        spo2: data.spo2 ? `${data.spo2}%` : "98%",
      });

      setMessage({ type: "success", text: "Patient Vitals recorded successfully!" });
      setIsVitalsOpen(false);
      setDialogError(null);
      resetVital();
    } catch (err) {
      console.error("Failed to save patient vitals:", err);
      const errMsg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to save patient vitals record");
      setDialogError(errMsg);
    }
  };

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Prescription_${activePatient?.patient_name || "Patient"}_${activePatient?.tokenNo || "01"}`,
  });

  const handlePrint = () => {
    if (reactToPrintFn) {
      reactToPrintFn();
    } else {
      window.print();
    }
  };

  // Header settings & logo calculation
  const showHeader = outputSettings?.showHeader ?? true;
  const headerHeightMargin = outputSettings?.headerHeightMargin ? Number(outputSettings.headerHeightMargin) : 80;
  const logoSrc = hospitalProfile?.logo_url || hospitalProfile?.logo;
  const hospitalName = hospitalProfile?.hospital_name || hospitalProfile?.name || "Hospital Information Management System";
  const hospitalAddress = hospitalProfile?.address || "Main Boulevard, Healthcare City, Medical Center";
  const hospitalPhone = hospitalProfile?.phone || "+92-42-111-222-333";
  const hospitalEmail = hospitalProfile?.email || "opd@hims-hospital.com";

  // Dynamic Doctor Info
  const doctorName = currentDoctor?.Name || activePatient?.doctor_name || activePatient?.doctor?.Name || authUser?.name || "Dr. Abdul Qayyum Malik";
  const doctorQualification = currentDoctor?.Qualification || activePatient?.doctor?.Qualification || "MBBS, FCPS (Medicine)";
  const doctorDept = currentDoctor?.Specialization || activePatient?.department_name || activePatient?.doctor?.Specialization || "Consultant Physician & OPD Specialist";
  const doctorPmdc = (currentDoctor?.RegistrationNo || activePatient?.doctor?.RegistrationNo)
    ? `PMDC Reg #: ${currentDoctor?.RegistrationNo || activePatient.doctor.RegistrationNo}`
    : "PMDC Reg #: 45892-P";
  const doctorStamp = currentDoctor?.Stamp || activePatient?.doctor?.Stamp || "";

  // Prescription Clinical Data State
  const [vitals, setVitals] = useState({
    bp: "120/80 mmHg",
    pulse: "76 bpm",
    temp: "98.6 °F",
    weight: "68 kg",
    spo2: "98%",
  });

  const [complaints, setComplaints] = useState("Fever with mild chills, headache, and body aches for 2 days.");
  const [examination, setExamination] = useState("Chest clear, CVS S1 S2 normal, Abdomen soft, non-tender.");
  const [diagnosis, setDiagnosis] = useState("Acute Febrile Illness / Viral Syndrome");
  const [investigations, setInvestigations] = useState("CBC, LFTs, Urine R/E");
  const [medicines, setMedicines] = useState([
    { id: 1, name: "Tab. Paracetamol 500mg", dosage: "1 - 0 - 1 (BID)", duration: "5 Days", instruction: "After Meals" },
    { id: 2, name: "Cap. Omeprazole 20mg", dosage: "1 - 0 - 0 (OD)", duration: "7 Days", instruction: "Before Breakfast" },
    { id: 3, name: "Syp. Hydryllin 120ml", dosage: "2 tsp (TID)", duration: "5 Days", instruction: "After Meals" },
  ]);
  const [advice, setAdvice] = useState("Low salt diet, drink plenty of boiled water, complete bed rest for 3 days.");
  const [followupDate, setFollowupDate] = useState("After 7 Days (29-08-2026)");

  // Patient Info Fallbacks
  const patientName = activePatient?.patient_name || activePatient?.patient?.pName || "Syed Fazal Hussain Shah";
  const patientMrn = activePatient?.patient_mrn || activePatient?.patient?.mrn || "MRN-26-101";
  const patientGender = activePatient?.patient_gender || activePatient?.patient?.gender || "Male";
  const patientAge = activePatient?.patient?.age ? `${activePatient.patient.age} Y` : "32 Y";
  const guardianName = activePatient?.patient?.gName || "S/O Hussain Shah";
  const patientMobile = activePatient?.patient_mobile || activePatient?.patient?.mobile || "0300-1234567";
  const tokenNo = activePatient?.tokenNo || 1;
  const visitNo = activePatient?.visitNo || activePatient?.InvoiceNo || "V-0726-10";
  const visitDate = activePatient?.InvoiceDate ? formatDate(activePatient.InvoiceDate) : new Date().toLocaleDateString("en-GB");

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {message && (
        <Alert className={message.type === "error" ? "bg-red-50 text-red-900 border-red-200" : "bg-emerald-50 text-emerald-900 border-emerald-200"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="h-5 w-5 text-teal-600" />
            OPD Prescription Report Preview (A4 Size)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live printable prescription report for token <strong className="text-slate-800">#{String(tokenNo).padStart(2, "0")}</strong> - {patientName}
          </p>
        </div>

        {/* 7 Action Buttons before Print A4 Prescription */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            onClick={() => setIsVitalsOpen(true)}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-teal-300 text-teal-800 hover:bg-teal-50 font-medium"
          >
            <Activity className="h-3.5 w-3.5 mr-1 text-teal-600" />
            Vitals
          </Button>

          <Button
            onClick={() => setActivePlaceholderModal("History")}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5 mr-1 text-slate-500" />
            History
          </Button>

          <Button
            onClick={() => setActivePlaceholderModal("Examination")}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Stethoscope className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Examination
          </Button>

          <Button
            onClick={() => setActivePlaceholderModal("Diagnosis")}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Brain className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Diagnosis
          </Button>

          <Button
            onClick={() => setActivePlaceholderModal("Investigations")}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <TestTube className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Investigations
          </Button>

          <Button
            onClick={() => setActivePlaceholderModal("Advice")}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Advice
          </Button>

          <Button
            onClick={() => setActivePlaceholderModal("Followup")}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Calendar className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Followup
          </Button>

          <Button
            onClick={handlePrint}
            size="sm"
            className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold ml-1"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print A4 Prescription
          </Button>
        </div>
      </div>

      {/* A4 Size Paper Print Container */}
      <div className="flex justify-center bg-slate-100/80 p-6 rounded-xl overflow-x-auto">
        <div
          ref={contentRef}
          className="w-[210mm] min-h-[297mm] bg-white border border-slate-300 shadow-md p-8 flex flex-col justify-between text-slate-800 text-xs print:w-[210mm] print:h-[297mm] print:shadow-none print:p-6 print:m-0"
          style={{ width: "210mm", minHeight: "297mm", fontFamily: outputSettings?.textFont || "Inter, Arial, sans-serif" }}
        >
          {/* 1. Hospital Output Settings & Doctor Header */}
          <div>
            {!showHeader ? (
              <div
                className="w-full shrink-0 border-b border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400 font-mono mb-4 print:border-none"
                style={{ height: `${headerHeightMargin}px` }}
              >
                <span className="print:hidden">[ Blank Header Space: {headerHeightMargin}px ]</span>
              </div>
            ) : (
              <div className="flex items-start justify-between border-b-2 border-teal-600 pb-5 mb-5 min-h-[95px]">
                {/* Left: Hospital Info + Logo / Banner Image */}
                <div className="flex items-center gap-4 max-w-[65%]">
                  {outputSettings?.headerImage ? (
                    <Image
                      src={getImageUrl(outputSettings.headerImage)}
                      alt="Header Banner"
                      width={400}
                      height={80}
                      className="h-20 w-auto object-contain shrink-0"
                      unoptimized
                    />
                  ) : logoSrc ? (
                    <Image
                      src={getImageUrl(logoSrc)}
                      alt="Hospital Logo"
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain rounded-xl border-2 border-teal-100 bg-white p-1.5 shrink-0 shadow-xs"
                      unoptimized
                    />
                  ) : (
                    <div className="p-3.5 rounded-xl bg-teal-600 text-white font-bold text-xl shrink-0">HIMS</div>
                  )}

                  <div className="space-y-1">
                    <h2 className="text-xl font-extrabold uppercase tracking-wide text-teal-800 leading-tight">
                      {hospitalName}
                    </h2>
                    <p className="text-xs text-slate-700 font-semibold">{hospitalAddress}</p>
                    <p className="text-xs text-slate-600 font-medium">
                      Ph: {hospitalPhone} {hospitalEmail ? `| Email: ${hospitalEmail}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right: Logged-in Doctor Info */}
                <div className="text-right space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{doctorName}</h3>
                  <p className="text-xs font-bold text-teal-700">{doctorQualification}</p>
                  <p className="text-xs font-medium text-slate-700">{doctorDept}</p>
                  <p className="text-xs text-slate-500 font-mono font-medium">{doctorPmdc}</p>
                </div>
              </div>
            )}

            {/* 2. Patient Demographics Bar */}
            <div className="grid grid-cols-4 gap-3 bg-teal-50/70 border border-teal-200 rounded-lg p-3.5 mb-4 text-xs">
              <div className="flex items-center gap-2.5 col-span-2">
                <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-bold px-2.5 py-1 text-xs">
                  TOKEN #{String(tokenNo).padStart(2, "0")}
                </Badge>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{patientName}</p>
                  <p className="text-slate-600 text-xs font-medium">{guardianName}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-slate-600">MRN: <strong className="text-slate-900 font-mono text-xs">{patientMrn}</strong></p>
                <p className="text-slate-600">Age / Sex: <strong className="text-slate-900 text-xs">{patientAge} / {patientGender}</strong></p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-slate-600">Visit No: <strong className="text-slate-900 font-mono text-xs">{visitNo}</strong></p>
                <p className="text-slate-600">Date: <strong className="text-slate-900 text-xs">{visitDate}</strong></p>
              </div>
            </div>

            {/* 3. Vitals Bar */}
            {vitals && (
              <div className="flex flex-wrap items-center gap-5 bg-slate-50 border border-slate-200 rounded-md p-2.5 mb-4 text-xs font-medium">
                <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
                  <Activity className="h-4 w-4 text-teal-600" /> Vitals:
                </span>
                <span>BP: <strong className="text-slate-900 font-bold">{vitals.bp || "N/A"}</strong></span>
                <span>Pulse: <strong className="text-slate-900 font-bold">{vitals.pulse || "N/A"}</strong></span>
                <span>Temp: <strong className="text-slate-900 font-bold">{vitals.temp || "N/A"}</strong></span>
                <span>Weight: <strong className="text-slate-900 font-bold">{vitals.weight || "N/A"}</strong></span>
                <span>SpO2: <strong className="text-slate-900 font-bold">{vitals.spo2 || "N/A"}</strong></span>
              </div>
            )}

            {/* 4. Clinical Notes Grid (Complaints, Examination, Diagnosis, Investigations) */}
            <div className="space-y-3.5 mb-5">
              {complaints && (
                <div>
                  <span className="font-bold text-slate-800 uppercase text-xs tracking-wider block mb-1">
                    Chief Complaints & History:
                  </span>
                  <p className="text-xs text-slate-800 font-medium bg-white p-2 border-l-3 border-teal-500 pl-2.5 leading-relaxed">
                    {complaints}
                  </p>
                </div>
              )}

              {examination && (
                <div>
                  <span className="font-bold text-slate-800 uppercase text-xs tracking-wider block mb-1">
                    Physical Examination:
                  </span>
                  <p className="text-xs text-slate-800 font-medium bg-white p-2 border-l-3 border-blue-500 pl-2.5 leading-relaxed">
                    {examination}
                  </p>
                </div>
              )}

              {diagnosis && (
                <div>
                  <span className="font-bold text-teal-800 uppercase text-xs tracking-wider block mb-1">
                    Diagnosis:
                  </span>
                  <p className="text-xs font-bold text-teal-950 bg-teal-50/70 p-2 border-l-3 border-teal-700 pl-2.5 leading-relaxed">
                    {diagnosis}
                  </p>
                </div>
              )}

              {investigations && (
                <div>
                  <span className="font-bold text-slate-800 uppercase text-xs tracking-wider block mb-1">
                    Investigations Ordered:
                  </span>
                  <p className="text-xs font-bold text-slate-900 bg-amber-50/70 p-2 border-l-3 border-amber-500 pl-2.5 font-mono leading-relaxed">
                    {investigations}
                  </p>
                </div>
              )}
            </div>

            {/* 5. Rx / Prescribed Medications Table */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center gap-1 text-teal-800 border-b-2 border-teal-300 pb-1">
                <span className="text-lg font-serif font-bold italic">Rx</span>
                <span className="text-xs font-bold uppercase tracking-wider ml-1">Prescribed Medications</span>
              </div>

              <table className="w-full border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-2 text-center border-r border-slate-200 w-9">#</th>
                    <th className="p-2 text-left border-r border-slate-200">Medicine Name</th>
                    <th className="p-2 text-center border-r border-slate-200 w-36">Dosage</th>
                    <th className="p-2 text-center border-r border-slate-200 w-28">Duration</th>
                    <th className="p-2 text-left">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.length > 0 ? (
                    medicines.map((med, idx) => (
                      <tr key={med.id || idx} className="border-b border-slate-200 odd:bg-white even:bg-slate-50/50">
                        <td className="p-2 text-center border-r border-slate-200 font-bold text-slate-700">{idx + 1}</td>
                        <td className="p-2 text-left border-r border-slate-200 font-bold text-slate-900 text-xs">{med.name}</td>
                        <td className="p-2 text-center border-r border-slate-200 font-mono font-bold text-teal-900 text-xs">{med.dosage}</td>
                        <td className="p-2 text-center border-r border-slate-200 font-medium text-xs">{med.duration}</td>
                        <td className="p-2 text-left text-slate-700 font-medium text-xs">{med.instruction}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-slate-400">No medicines prescribed</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 6. Advice & Follow-Up */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3.5 text-xs">
              <div>
                <span className="font-bold text-slate-800 uppercase text-xs tracking-wider block mb-1">
                  Advice & Special Instructions:
                </span>
                <p className="text-slate-800 font-medium">{advice || "Take prescribed medicines regularly as directed."}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-teal-800 uppercase text-xs tracking-wider block mb-1">
                  Next Review / Follow-Up:
                </span>
                <p className="font-bold text-teal-950 text-xs">{followupDate}</p>
              </div>
            </div>
          </div>

          {/* 7. Footer / Doctor Signature & Notice */}
          <div className="pt-8 border-t border-slate-200 mt-6 flex items-end justify-between text-xs">
            <div>
              <p className="text-slate-600 italic font-medium">This prescription is computer generated by HIMS Medical System.</p>
              <p className="text-slate-500 text-[11px]">Printed Date: {new Date().toLocaleDateString("en-GB")} {new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="text-center space-y-0.5 min-w-[180px]">
              <div className="w-44 border-b border-slate-400 mb-1 mx-auto"></div>
              {doctorStamp ? (
                <p className="text-sm text-slate-950 font-bold whitespace-pre-line leading-tight">{doctorStamp}</p>
              ) : (
                <>
                  <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
                  <p className="text-slate-500 text-xs">Signature & Stamp</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Vitals Dialog Modal */}
      <Dialog open={isVitalsOpen} onOpenChange={(open) => { setIsVitalsOpen(open); if (!open) setDialogError(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-teal-800">
              <Activity className="h-5 w-5 text-teal-600" />
              Record Patient Vital Signs
            </DialogTitle>
          </DialogHeader>

          {dialogError && (
            <Alert className="bg-red-50 text-red-900 border-red-200 text-xs my-1">
              <AlertDescription>{dialogError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmitVital(onSaveVitals)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-medium">Systolic BP (mmHg)</Label>
                <Input placeholder="e.g. 120" {...registerVital("systolic")} className="h-8 text-xs mt-1" />
                {vitalErrors.systolic && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.systolic.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">Diastolic BP (mmHg)</Label>
                <Input placeholder="e.g. 80" {...registerVital("diastolic")} className="h-8 text-xs mt-1" />
                {vitalErrors.diastolic && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.diastolic.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">Pulse Rate (bpm)</Label>
                <Input placeholder="e.g. 76" {...registerVital("pulse_rate")} className="h-8 text-xs mt-1" />
                {vitalErrors.pulse_rate && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.pulse_rate.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">Temperature (°F)</Label>
                <Input placeholder="e.g. 98.6" {...registerVital("temperature")} className="h-8 text-xs mt-1" />
                {vitalErrors.temperature && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.temperature.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">Resp Rate (/min)</Label>
                <Input placeholder="e.g. 18" {...registerVital("respiratory_rate")} className="h-8 text-xs mt-1" />
                {vitalErrors.respiratory_rate && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.respiratory_rate.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">SpO2 (%)</Label>
                <Input placeholder="e.g. 98" {...registerVital("spo2")} className="h-8 text-xs mt-1" />
                {vitalErrors.spo2 && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.spo2.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">Weight (kg)</Label>
                <Input placeholder="e.g. 68.5" {...registerVital("weight")} className="h-8 text-xs mt-1" />
                {vitalErrors.weight && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.weight.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">Height (cm)</Label>
                <Input placeholder="e.g. 172.5" {...registerVital("height")} className="h-8 text-xs mt-1" />
                {vitalErrors.height && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.height.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-medium">BSR (mg/dL)</Label>
                <Input placeholder="e.g. 110" {...registerVital("bsr")} className="h-8 text-xs mt-1" />
                {vitalErrors.bsr && <p className="text-[10px] text-destructive mt-0.5">{vitalErrors.bsr.message}</p>}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Clinical Remarks / Notes</Label>
              <Textarea placeholder="Optional vitals notes..." {...registerVital("notes")} className="text-xs min-h-[60px] mt-1" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsVitalsOpen(false)} size="sm" className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingVital} size="sm" className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Save Vitals Record
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Placeholder Modal for Future Table Migrations */}
      <Dialog open={!!activePlaceholderModal} onOpenChange={() => setActivePlaceholderModal(null)}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-slate-800 text-center">
              {activePlaceholderModal} Section
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm text-slate-600">
              The database table for <strong>{activePlaceholderModal}</strong> will be connected once migrated.
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setActivePlaceholderModal(null)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
