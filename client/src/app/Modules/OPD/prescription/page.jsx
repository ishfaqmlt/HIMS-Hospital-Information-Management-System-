"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useOPDContext } from "../layout";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientVitalSchema, opdHistorySchema } from "@/lib/zodeSchema";
import patientVitalService from "@/services/patientVital.service";
import opdHistoryService from "@/services/opdHistory.service";
import opdSymptomService from "@/services/opdSymptom.service";
import masterSymptomService from "@/services/masterSymptom.service";
import opdPhysicalExamService from "@/services/opdPhysicalExam.service";
import masterPhysicalExamService from "@/services/masterPhysicalExam.service";
import opdDiagnosisService from "@/services/opdDiagnosis.service";
import masterDiagnosisService from "@/services/masterDiagnosis.service";
import opdInvestigationService from "@/services/opdInvestigation.service";
import serviceService from "@/services/serviceService";
import departmentService from "@/services/department.service";
import patientService from "@/services/patient.service";
import opdPrescriptionService from "@/services/opdPrescription.service";
import labCaseService from "@/services/labCase.service";
import hospitalProfileService from "@/services/hospitalProfile.service";
import hospitalOutputSettingService from "@/services/hospitalOutputSetting.service";
import doctorService from "@/services/doctor.service";
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
  Trash2,
  History,
  Copy,
  FlaskConical,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Clock,
  Save,
  Check,
  Sparkles,
  Search,
  Plus,
  X,
  Tag,
} from "lucide-react";
import { useSelector } from "react-redux";
import { formatDate, getImageUrl, calculateAge } from "@/lib/utils";

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

  const [existingVitalId, setExistingVitalId] = useState(null);

  // Patient Medical History State & Form
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    register: registerHistory,
    handleSubmit: handleSubmitHistory,
    reset: resetHistory,
    setValue: setHistoryValue,
    getValues: getHistoryValues,
    formState: { errors: historyErrors, isSubmitting: isSubmittingHistory },
  } = useForm({
    resolver: zodResolver(opdHistorySchema),
    defaultValues: {
      patientId: "",
      past_medical_history: "",
      past_surgical_history: "",
      medication_history: "",
      allergy_history: "",
      family_history: "",
      social_history: "",
    },
  });

  // Left Column State: 1. Previous Prescriptions
  const [previousPrescriptions, setPreviousPrescriptions] = useState([]);
  const [loadingPrevPrescriptions, setLoadingPrevPrescriptions] = useState(false);

  // Left Column State: 2. Previous Lab Results
  const [previousLabCases, setPreviousLabCases] = useState([]);
  const [loadingPrevLabCases, setLoadingPrevLabCases] = useState(false);
  const [selectedLabCaseId, setSelectedLabCaseId] = useState(null);

  // Left Column State: 3. Prescription Advice & Follow-Up State
  const [advice, setAdvice] = useState("");
  const [followupDate, setFollowupDate] = useState("");
  const [rawFollowupDate, setRawFollowupDate] = useState("");

  // Prescription Clinical Data State for A4 Print
  const [vitals, setVitals] = useState(null);
  const [complaints, setComplaints] = useState("");
  const [examination, setExamination] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [investigations, setInvestigations] = useState("");
  const [medicines, setMedicines] = useState([]);

  const targetPatientId =
    activePatient?.patientId ||
    activePatient?.patient_id ||
    activePatient?.patient?.id ||
    activePatient?.PatientId;
  const targetPatientMrn =
    activePatient?.patient_mrn || activePatient?.patient?.mrn || activePatient?.mrn;

  const [currentPrescription, setCurrentPrescription] = useState(null);

  // Patient Symptoms State & Dialog
  const [isSymptomsOpen, setIsSymptomsOpen] = useState(false);
  const [masterSymptoms, setMasterSymptoms] = useState([]);
  const [loadingMasterSymptoms, setLoadingMasterSymptoms] = useState(false);
  const [patientSymptoms, setPatientSymptoms] = useState([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [symptomSearchQuery, setSymptomSearchQuery] = useState("");
  const [customSymptomInput, setCustomSymptomInput] = useState("");
  const [selectedSymptomsDraft, setSelectedSymptomsDraft] = useState([]);
  const [isSavingSymptoms, setIsSavingSymptoms] = useState(false);

  // Patient Physical Examination State & Dialog
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [masterExams, setMasterExams] = useState([]);
  const [loadingMasterExams, setLoadingMasterExams] = useState(false);
  const [patientExams, setPatientExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examSearchQuery, setExamSearchQuery] = useState("");
  const [customExamInput, setCustomExamInput] = useState("");
  const [selectedExamsDraft, setSelectedExamsDraft] = useState([]);
  const [isSavingExams, setIsSavingExams] = useState(false);

  // Patient Diagnosis State & Dialog
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [masterDiagnoses, setMasterDiagnoses] = useState([]);
  const [loadingMasterDiagnoses, setLoadingMasterDiagnoses] = useState(false);
  const [patientDiagnoses, setPatientDiagnoses] = useState([]);
  const [loadingDiagnoses, setLoadingDiagnoses] = useState(false);
  const [diagnosisSearchQuery, setDiagnosisSearchQuery] = useState("");
  const [customDiagnosisInput, setCustomDiagnosisInput] = useState("");
  const [selectedDiagnosesDraft, setSelectedDiagnosesDraft] = useState([]);
  const [isSavingDiagnoses, setIsSavingDiagnoses] = useState(false);

  // Patient Investigations State & Dialog
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);
  const [masterServices, setMasterServices] = useState([]);
  const [masterDepartments, setMasterDepartments] = useState([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [loadingMasterServices, setLoadingMasterServices] = useState(false);
  const [patientInvestigations, setPatientInvestigations] = useState([]);
  const [loadingInvestigations, setLoadingInvestigations] = useState(false);
  const [investigationSearchQuery, setInvestigationSearchQuery] = useState("");
  const [selectedInvestigationsDraft, setSelectedInvestigationsDraft] = useState([]);
  const [isSavingInvestigations, setIsSavingInvestigations] = useState(false);

  const targetVisitId = activePatient?.visit_id || activePatient?.visitId || activePatient?.id || activePatient?.Id;

  useEffect(() => {
    fetchHeaderData();
    fetchPatientVitals();
    fetchCurrentPrescription(targetVisitId, targetPatientId);
    fetchPatientSymptoms(currentPrescription?.id, targetPatientId, targetVisitId);
    fetchPatientExams(currentPrescription?.id, targetPatientId, targetVisitId);
    fetchPatientDiagnoses(currentPrescription?.id, targetPatientId, targetVisitId);
    fetchPatientInvestigations(currentPrescription?.id, targetPatientId, targetVisitId);
    if (targetPatientId) {
      fetchPatientHistory(targetPatientId);
      fetchPreviousPrescriptions(targetPatientId);
      fetchPreviousLabCases(targetPatientId, targetPatientMrn);
    } else {
      fetchPreviousPrescriptions();
      fetchPreviousLabCases();
    }
  }, [activePatient, authUser]);

  const fetchMasterSymptoms = async () => {
    try {
      setLoadingMasterSymptoms(true);
      const res = await masterSymptomService.getAll();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMasterSymptoms(list);
    } catch (err) {
      console.error("Failed to fetch master symptoms:", err);
    } finally {
      setLoadingMasterSymptoms(false);
    }
  };

  const fetchPatientSymptoms = async (prescriptionId, patientId, visitId) => {
    try {
      if (!prescriptionId && !patientId && !visitId) return;
      setLoadingSymptoms(true);
      const params = {};
      if (prescriptionId) params.prescriptionId = prescriptionId;
      else if (visitId) params.visitId = visitId;
      else if (patientId) params.patientId = patientId;

      const res = await opdSymptomService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const names = list.map((item) => item.name);
      setPatientSymptoms(names);
    } catch (err) {
      console.error("Failed to fetch patient symptoms:", err);
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const fetchMasterExams = async () => {
    try {
      setLoadingMasterExams(true);
      const res = await masterPhysicalExamService.getAll();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMasterExams(list);
    } catch (err) {
      console.error("Failed to fetch master physical exams:", err);
    } finally {
      setLoadingMasterExams(false);
    }
  };

  const fetchPatientExams = async (prescriptionId, patientId, visitId) => {
    try {
      if (!prescriptionId && !patientId && !visitId) return;
      setLoadingExams(true);
      const params = {};
      if (prescriptionId) params.prescriptionId = prescriptionId;
      else if (visitId) params.visitId = visitId;
      else if (patientId) params.patientId = patientId;

      const res = await opdPhysicalExamService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const names = list.map((item) => item.name);
      setPatientExams(names);
    } catch (err) {
      console.error("Failed to fetch patient physical exams:", err);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchMasterDiagnoses = async () => {
    try {
      setLoadingMasterDiagnoses(true);
      const res = await masterDiagnosisService.getAll();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMasterDiagnoses(list);
    } catch (err) {
      console.error("Failed to fetch master diagnoses:", err);
    } finally {
      setLoadingMasterDiagnoses(false);
    }
  };

  const fetchPatientDiagnoses = async (prescriptionId, patientId, visitId) => {
    try {
      if (!prescriptionId && !patientId && !visitId) return;
      setLoadingDiagnoses(true);
      const params = {};
      if (prescriptionId) params.prescriptionId = prescriptionId;
      else if (visitId) params.visitId = visitId;
      else if (patientId) params.patientId = patientId;

      const res = await opdDiagnosisService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const names = list.map((item) => item.name);
      setPatientDiagnoses(names);
    } catch (err) {
      console.error("Failed to fetch patient diagnoses:", err);
    } finally {
      setLoadingDiagnoses(false);
    }
  };

  const fetchMasterServices = async () => {
    try {
      setLoadingMasterServices(true);
      const [servicesRes, deptsRes] = await Promise.all([
        serviceService.getAll({ service_type: "investigation" }),
        departmentService.getAll().catch(() => ({ data: [] })),
      ]);
      const sList = Array.isArray(servicesRes.data) ? servicesRes.data : servicesRes.data?.data || [];
      const dList = Array.isArray(deptsRes.data) ? deptsRes.data : deptsRes.data?.data || [];
      
      const filtered = sList.filter(
        (s) => s.service_type === "investigation" || (!s.service_type && s.service_type !== "consultation")
      );

      setMasterServices(filtered);
      setMasterDepartments(dList);
    } catch (err) {
      console.error("Failed to fetch master services:", err);
    } finally {
      setLoadingMasterServices(false);
    }
  };

  const fetchPatientInvestigations = async (prescriptionId, patientId, visitId) => {
    try {
      if (!prescriptionId && !patientId && !visitId) return;
      setLoadingInvestigations(true);
      const params = {};
      if (prescriptionId) params.prescriptionId = prescriptionId;
      else if (visitId) params.visitId = visitId;
      else if (patientId) params.patientId = patientId;

      const res = await opdInvestigationService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPatientInvestigations(list);
    } catch (err) {
      console.error("Failed to fetch patient investigations:", err);
    } finally {
      setLoadingInvestigations(false);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    if (!patientId) return;
    try {
      setLoadingHistory(true);
      const res = await opdHistoryService.getAll({ patientId });
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (list.length > 0) {
        const h = list[0];
        setPatientHistory(h);
        resetHistory({
          patientId: patientId,
          past_medical_history: h.past_medical_history || "",
          past_surgical_history: h.past_surgical_history || "",
          medication_history: h.medication_history || "",
          allergy_history: h.allergy_history || "",
          family_history: h.family_history || "",
          social_history: h.social_history || "",
        });
      } else {
        setPatientHistory(null);
        resetHistory({
          patientId: patientId,
          past_medical_history: "",
          past_surgical_history: "",
          medication_history: "",
          allergy_history: "",
          family_history: "",
          social_history: "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch patient history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCurrentPrescription = async (visitId, patientId) => {
    try {
      if (activePatient?.currentPrescription) {
        const p = activePatient.currentPrescription;
        setCurrentPrescription(p);
        fetchPatientSymptoms(p.id, targetPatientId, targetVisitId);
        fetchPatientExams(p.id, targetPatientId, targetVisitId);
        fetchPatientDiagnoses(p.id, targetPatientId, targetVisitId);
        fetchPatientInvestigations(p.id, targetPatientId, targetVisitId);
        if (p.advice) setAdvice(p.advice);
        if (p.followUpDate) {
          setRawFollowupDate(p.followUpDate.split("T")[0]);
          setFollowupDate(`On ${formatDate(p.followUpDate)}`);
        }
        return;
      }

      if (!visitId && !patientId) return;
      const params = {};
      if (visitId) params.visitId = visitId;
      else if (patientId) params.patientId = patientId;

      const res = await opdPrescriptionService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      if (list.length > 0) {
        const p = list[0];
        setCurrentPrescription(p);
        fetchPatientSymptoms(p.id, targetPatientId, targetVisitId);
        fetchPatientExams(p.id, targetPatientId, targetVisitId);
        fetchPatientDiagnoses(p.id, targetPatientId, targetVisitId);
        fetchPatientInvestigations(p.id, targetPatientId, targetVisitId);
        if (p.advice) setAdvice(p.advice);
        if (p.followUpDate) {
          setRawFollowupDate(p.followUpDate.split("T")[0]);
          setFollowupDate(`On ${formatDate(p.followUpDate)}`);
        }
      }
    } catch (err) {
      console.error("Failed to fetch today's prescription:", err);
    }
  };

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  // 1. Fetch Previous Prescriptions
  const fetchPreviousPrescriptions = async (patientId) => {
    try {
      setLoadingPrevPrescriptions(true);
      const params = {};
      if (patientId) params.patientId = patientId;
      const res = await opdPrescriptionService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPreviousPrescriptions(list);
    } catch (err) {
      console.error("Failed to fetch previous prescriptions:", err);
      setPreviousPrescriptions([]);
    } finally {
      setLoadingPrevPrescriptions(false);
    }
  };

  // 2. Fetch Previous Lab Cases & Results
  const fetchPreviousLabCases = async (patientId, mrn) => {
    try {
      setLoadingPrevLabCases(true);
      const params = {};
      if (patientId) params.patientId = patientId;
      if (mrn) params.mrn = mrn;
      const res = await labCaseService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPreviousLabCases(list);
      if (list.length > 0 && !selectedLabCaseId) {
        setSelectedLabCaseId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch previous lab cases:", err);
      setPreviousLabCases([]);
    } finally {
      setLoadingPrevLabCases(false);
    }
  };

  // Copy previous prescription data into today's active prescription
  const handleCopyPrescription = (prevPresc) => {
    if (!prevPresc) return;

    if (prevPresc.advice) {
      setAdvice(prevPresc.advice);
    }
    if (prevPresc.followUpDate) {
      setRawFollowupDate(prevPresc.followUpDate.split("T")[0]);
      setFollowupDate(`On ${formatDate(prevPresc.followUpDate)}`);
    }

    setMessage({
      type: "success",
      text: `Prescription #${prevPresc.prescriptionNo} details copied into today's prescription!`,
    });
  };

  // Open full printable lab report in new window / tab
  const handlePrintLabReport = (caseItem) => {
    if (!caseItem?.caseNo) return;
    window.open(`/Modules/laboratory/patientReports?caseNo=${caseItem.caseNo}`, "_blank");
  };

  // Quick advice preset handler
  const handleApplyAdvicePreset = (text) => {
    setAdvice((prev) => (prev ? `${prev.trim()} ${text}` : text));
  };

  // Quick followup date preset handler
  const handleApplyFollowupDays = (days, label) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setRawFollowupDate(dateStr);
    setFollowupDate(`${label} (${dd}-${mm}-${yyyy})`);
  };

  const handleManualFollowupDateChange = (e) => {
    const val = e.target.value;
    setRawFollowupDate(val);
    if (val) {
      const parts = val.split("-");
      if (parts.length === 3) {
        setFollowupDate(`On ${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        setFollowupDate(val);
      }
    } else {
      setFollowupDate("As directed / SOS");
    }
  };

  const fetchPatientVitals = async () => {
    const pId = targetPatientId;
    const targetVisitId = activePatient?.id || activePatient?.visitId || activePatient?.visit_id;

    if (!pId && !targetVisitId) {
      setVitals(null);
      setExistingVitalId(null);
      return;
    }

    try {
      const params = {};
      if (targetVisitId) params.visitId = targetVisitId;
      else if (pId) params.patientId = pId;

      const res = await patientVitalService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      if (list.length > 0) {
        const latest = list[0];
        setExistingVitalId(latest.id);
        setVitals({
          bp:
            latest.blood_pressure || (latest.systolic && latest.diastolic)
              ? (latest.blood_pressure || `${latest.systolic}/${latest.diastolic}`) + " mmHg"
              : latest.systolic
              ? `${latest.systolic} mmHg`
              : null,
          pulse: latest.pulse_rate ? `${latest.pulse_rate} bpm` : null,
          temp: latest.temperature ? `${latest.temperature} °F` : null,
          weight: latest.weight ? `${latest.weight} kg` : null,
          spo2: latest.spo2 ? `${latest.spo2}%` : null,
          bsr: latest.bsr ? `${latest.bsr} mg/dL` : null,
        });

        resetVital({
          patientId: pId || "patient-temp-id",
          visitId: targetVisitId || null,
          systolic: latest.systolic ? String(latest.systolic) : "",
          diastolic: latest.diastolic ? String(latest.diastolic) : "",
          pulse_rate: latest.pulse_rate ? String(latest.pulse_rate) : "",
          temperature: latest.temperature ? String(latest.temperature) : "",
          respiratory_rate: latest.respiratory_rate ? String(latest.respiratory_rate) : "",
          spo2: latest.spo2 ? String(latest.spo2) : "",
          weight: latest.weight ? String(latest.weight) : "",
          height: latest.height ? String(latest.height) : "",
          bsr: latest.bsr ? String(latest.bsr) : "",
          notes: latest.notes || "",
        });
      } else {
        setVitals(null);
        setExistingVitalId(null);
        resetVital({
          patientId: pId || "patient-temp-id",
          visitId: targetVisitId || null,
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
        });
      }
    } catch (err) {
      console.error("Failed to fetch patient vitals:", err);
      setVitals(null);
      setExistingVitalId(null);
    }
  };

  const handleOpenVitalsDialog = () => {
    setDialogError(null);
    fetchPatientVitals();
    setIsVitalsOpen(true);
  };

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
        matchedDoc = doctorsList.find(
          (d) => d.Name?.toLowerCase() === activePatient.doctor_name.toLowerCase()
        );
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
      let pId = targetPatientId;
      let targetVisitId = activePatient?.id || activePatient?.visitId || activePatient?.visit_id;

      if (!pId) {
        try {
          const patientsRes = await patientService.getAll().catch(() => ({ data: [] }));
          const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data?.data || [];
          if (patientsList.length > 0) {
            pId = patientsList[0].id;
          }
        } catch (e) {
          console.error("Failed to fetch fallback patient:", e);
        }
      }

      if (!pId) {
        setDialogError("No active patient record found in database. Please register a patient first.");
        return;
      }

      const payload = {
        patientId: pId,
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

      if (existingVitalId) {
        await patientVitalService.update(existingVitalId, payload);
      } else {
        const createdRes = await patientVitalService.create(payload);
        if (createdRes?.data?.id) {
          setExistingVitalId(createdRes.data.id);
        }
      }

      setVitals({
        bp: data.systolic || data.diastolic ? `${data.systolic || ""}/${data.diastolic || ""} mmHg` : null,
        pulse: data.pulse_rate ? `${data.pulse_rate} bpm` : null,
        temp: data.temperature ? `${data.temperature} °F` : null,
        weight: data.weight ? `${data.weight} kg` : null,
        spo2: data.spo2 ? `${data.spo2}%` : null,
        bsr: data.bsr ? `${data.bsr} mg/dL` : null,
      });

      setMessage({
        type: "success",
        text: existingVitalId ? "Patient Vitals updated successfully!" : "Patient Vitals recorded successfully!",
      });
      setIsVitalsOpen(false);
      setDialogError(null);
      resetVital();
    } catch (err) {
      console.error("Failed to save patient vitals:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to save patient vitals record");
      setDialogError(errMsg);
    }
  };

  const onDeleteVitals = async () => {
    if (!existingVitalId) return;
    if (!confirm("Are you sure you want to delete this patient vitals record from the database?")) return;

    setDialogError(null);
    try {
      await patientVitalService.delete(existingVitalId);
      setVitals(null);
      setExistingVitalId(null);
      resetVital({
        patientId: targetPatientId || "patient-temp-id",
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
      });
      setMessage({ type: "success", text: "Patient Vitals record deleted successfully!" });
      setIsVitalsOpen(false);
    } catch (err) {
      console.error("Failed to delete patient vitals record:", err);
      const errMsg = err.response?.data?.message || "Failed to delete patient vitals record";
      setDialogError(errMsg);
    }
  };

  const handleOpenHistoryDialog = () => {
    setDialogError(null);
    if (patientHistory) {
      resetHistory({
        patientId: targetPatientId || "patient-temp-id",
        past_medical_history: patientHistory.past_medical_history || "",
        past_surgical_history: patientHistory.past_surgical_history || "",
        medication_history: patientHistory.medication_history || "",
        allergy_history: patientHistory.allergy_history || "",
        family_history: patientHistory.family_history || "",
        social_history: patientHistory.social_history || "",
      });
    } else {
      resetHistory({
        patientId: targetPatientId || "patient-temp-id",
        past_medical_history: "",
        past_surgical_history: "",
        medication_history: "",
        allergy_history: "",
        family_history: "",
        social_history: "",
      });
    }
    setIsHistoryOpen(true);
  };

  const onSubmitHistory = async (data) => {
    try {
      setDialogError(null);
      if (!targetPatientId) {
        setDialogError("Please select a patient first to record medical history.");
        return;
      }
      const payload = {
        ...data,
        patientId: targetPatientId,
      };
      const res = await opdHistoryService.create(payload);
      setPatientHistory(res.data);
      setMessage({ type: "success", text: "Patient medical history saved successfully!" });
      setIsHistoryOpen(false);
    } catch (err) {
      console.error("Failed to save patient history:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to save patient medical history");
      setDialogError(errMsg);
    }
  };

  const handleAppendHistoryChip = (field, text) => {
    const current = getHistoryValues(field) || "";
    const updated = current ? `${current}, ${text}` : text;
    setHistoryValue(field, updated, { shouldValidate: true, shouldDirty: true });
  };

  // Symptoms Dialog Handlers
  const handleOpenSymptomsDialog = () => {
    setDialogError(null);
    setSymptomSearchQuery("");
    setCustomSymptomInput("");
    setSelectedSymptomsDraft([...patientSymptoms]);
    fetchMasterSymptoms();
    setIsSymptomsOpen(true);
  };

  const handleToggleSymptom = (name) => {
    if (selectedSymptomsDraft.includes(name)) {
      setSelectedSymptomsDraft(selectedSymptomsDraft.filter((item) => item !== name));
    } else {
      setSelectedSymptomsDraft([...selectedSymptomsDraft, name]);
    }
  };

  const handleAddCustomSymptom = async (e) => {
    if (e) e.preventDefault();
    const val = customSymptomInput.trim();
    if (!val) return;

    try {
      setDialogError(null);

      // 1. Add in master_symptoms table first
      const masterRes = await masterSymptomService.create({
        name: val,
        is_active: true,
      });

      const masterSymptomId = masterRes?.data?.id;

      // 2. Add into opd_symptoms table for current prescription/patient
      const targetPrescId = currentPrescription?.id;
      await opdSymptomService.create({
        prescriptionId: targetPrescId || null,
        patientId: targetPatientId || null,
        visitId: targetVisitId || null,
        symptomId: masterSymptomId || null,
        name: val,
      });

      // 3. Update drafts and live patient symptoms state
      const updatedDraft = selectedSymptomsDraft.includes(val)
        ? selectedSymptomsDraft
        : [...selectedSymptomsDraft, val];

      const updatedLive = patientSymptoms.includes(val)
        ? patientSymptoms
        : [...patientSymptoms, val];

      setSelectedSymptomsDraft(updatedDraft);
      setPatientSymptoms(updatedLive);
      setCustomSymptomInput("");

      // 4. Refresh master symptoms list in background
      fetchMasterSymptoms();
      setMessage({ type: "success", text: `Symptom "${val}" added to master list and patient prescription!` });
    } catch (err) {
      console.error("Failed to add custom symptom:", err);
      if (!selectedSymptomsDraft.includes(val)) {
        setSelectedSymptomsDraft([...selectedSymptomsDraft, val]);
      }
      setCustomSymptomInput("");
    }
  };

  const handleRemoveSymptomDraft = (name) => {
    setSelectedSymptomsDraft(selectedSymptomsDraft.filter((item) => item !== name));
  };

  const handleSaveSymptoms = async () => {
    try {
      setIsSavingSymptoms(true);
      setDialogError(null);

      const targetPrescId = currentPrescription?.id;

      await opdSymptomService.sync({
        prescriptionId: targetPrescId || null,
        patientId: targetPatientId || null,
        visitId: targetVisitId || null,
        symptoms: selectedSymptomsDraft,
      });

      setPatientSymptoms(selectedSymptomsDraft);
      setIsSymptomsOpen(false);
      setMessage({ type: "success", text: "Patient symptoms updated successfully!" });
    } catch (err) {
      console.error("Failed to save patient symptoms:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to save patient symptoms");
      setDialogError(errMsg);
    } finally {
      setIsSavingSymptoms(false);
    }
  };

  // Physical Examination Dialog Handlers
  const handleOpenExamDialog = () => {
    setDialogError(null);
    setExamSearchQuery("");
    setCustomExamInput("");
    setSelectedExamsDraft([...patientExams]);
    fetchMasterExams();
    setIsExamOpen(true);
  };

  const handleToggleExam = (name) => {
    if (selectedExamsDraft.includes(name)) {
      setSelectedExamsDraft(selectedExamsDraft.filter((item) => item !== name));
    } else {
      setSelectedExamsDraft([...selectedExamsDraft, name]);
    }
  };

  const handleAddCustomExam = async (e) => {
    if (e) e.preventDefault();
    const val = customExamInput.trim();
    if (!val) return;

    try {
      setDialogError(null);

      // 1. Add in master_physical_exam table first
      const masterRes = await masterPhysicalExamService.create({
        name: val,
        is_active: true,
      });

      const masterExamId = masterRes?.data?.id;

      // 2. Add into opd_physical_exams table
      const targetPrescId = currentPrescription?.id;
      await opdPhysicalExamService.create({
        prescriptionId: targetPrescId || null,
        patientId: targetPatientId || null,
        visitId: targetVisitId || null,
        physicalExamId: masterExamId || null,
        name: val,
      });

      // 3. Update drafts and live patient exams state
      const updatedDraft = selectedExamsDraft.includes(val)
        ? selectedExamsDraft
        : [...selectedExamsDraft, val];

      const updatedLive = patientExams.includes(val)
        ? patientExams
        : [...patientExams, val];

      setSelectedExamsDraft(updatedDraft);
      setPatientExams(updatedLive);
      setCustomExamInput("");

      // 4. Refresh master list
      fetchMasterExams();
      setMessage({ type: "success", text: `Physical exam finding "${val}" added to master list and patient prescription!` });
    } catch (err) {
      console.error("Failed to add custom exam:", err);
      if (!selectedExamsDraft.includes(val)) {
        setSelectedExamsDraft([...selectedExamsDraft, val]);
      }
      setCustomExamInput("");
    }
  };

  const handleRemoveExamDraft = (name) => {
    setSelectedExamsDraft(selectedExamsDraft.filter((item) => item !== name));
  };

  const handleSaveExams = async () => {
    try {
      setIsSavingExams(true);
      setDialogError(null);

      const targetPrescId = currentPrescription?.id;

      await opdPhysicalExamService.sync({
        prescriptionId: targetPrescId || null,
        patientId: targetPatientId || null,
        visitId: targetVisitId || null,
        exams: selectedExamsDraft,
      });

      setPatientExams(selectedExamsDraft);
      setIsExamOpen(false);
      setMessage({ type: "success", text: "Physical examination findings updated successfully!" });
    } catch (err) {
      console.error("Failed to save physical examination findings:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to save physical examination findings");
      setDialogError(errMsg);
    } finally {
      setIsSavingExams(false);
    }
  };

  // Diagnosis Dialog Handlers
  const handleOpenDiagnosisDialog = () => {
    setDialogError(null);
    setDiagnosisSearchQuery("");
    setCustomDiagnosisInput("");
    setSelectedDiagnosesDraft([...patientDiagnoses]);
    fetchMasterDiagnoses();
    setIsDiagnosisOpen(true);
  };

  const handleToggleDiagnosis = (name) => {
    if (selectedDiagnosesDraft.includes(name)) {
      setSelectedDiagnosesDraft(selectedDiagnosesDraft.filter((item) => item !== name));
    } else {
      setSelectedDiagnosesDraft([...selectedDiagnosesDraft, name]);
    }
  };

  const handleAddCustomDiagnosis = async (e) => {
    if (e) e.preventDefault();
    const val = customDiagnosisInput.trim();
    if (!val) return;

    try {
      setDialogError(null);

      // 1. Add in master_diagnosis table first
      const masterRes = await masterDiagnosisService.create({
        name: val,
        is_active: true,
      });

      const masterDiagnosisId = masterRes?.data?.id;

      // 2. Add into opd_diagnoses table
      const targetPrescId = currentPrescription?.id;
      await opdDiagnosisService.create({
        prescriptionId: targetPrescId || null,
        patientId: targetPatientId || null,
        visitId: targetVisitId || null,
        diagnosisId: masterDiagnosisId || null,
        name: val,
      });

      // 3. Update drafts and live patient diagnoses state
      const updatedDraft = selectedDiagnosesDraft.includes(val)
        ? selectedDiagnosesDraft
        : [...selectedDiagnosesDraft, val];

      const updatedLive = patientDiagnoses.includes(val)
        ? patientDiagnoses
        : [...patientDiagnoses, val];

      setSelectedDiagnosesDraft(updatedDraft);
      setPatientDiagnoses(updatedLive);
      setCustomDiagnosisInput("");

      // 4. Refresh master list
      fetchMasterDiagnoses();
      setMessage({ type: "success", text: `Diagnosis "${val}" added to master list and patient prescription!` });
    } catch (err) {
      console.error("Failed to add custom diagnosis:", err);
      if (!selectedDiagnosesDraft.includes(val)) {
        setSelectedDiagnosesDraft([...selectedDiagnosesDraft, val]);
      }
      setCustomDiagnosisInput("");
    }
  };

  const handleRemoveDiagnosisDraft = (name) => {
    setSelectedDiagnosesDraft(selectedDiagnosesDraft.filter((item) => item !== name));
  };

  const handleSaveDiagnoses = async () => {
    try {
      setIsSavingDiagnoses(true);
      setDialogError(null);

      const targetPrescId = currentPrescription?.id;

      await opdDiagnosisService.sync({
        prescriptionId: targetPrescId || null,
        patientId: targetPatientId || null,
        visitId: targetVisitId || null,
        diagnoses: selectedDiagnosesDraft,
      });

      setPatientDiagnoses(selectedDiagnosesDraft);
      setIsDiagnosisOpen(false);
      setMessage({ type: "success", text: "Diagnosis updated successfully!" });
    } catch (err) {
      console.error("Failed to save diagnosis:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to save diagnosis");
      setDialogError(errMsg);
    } finally {
      setIsSavingDiagnoses(false);
    }
  };

  // Investigation Dialog Handlers
  const handleOpenInvestigationDialog = () => {
    setDialogError(null);
    setInvestigationSearchQuery("");
    setSelectedDeptFilter("all");
    const drafts = patientInvestigations.map((item) => ({
      serviceId: item.serviceId || item.id,
      name: item.serviceName || item.name,
      serviceName: item.serviceName || item.name,
      departmentId: item.departmentId,
      departmentName: item.departmentName,
      code: item.serviceCode || item.code,
      charges: item.charges,
      instructions: item.instructions || "",
    }));
    setSelectedInvestigationsDraft(drafts);
    fetchMasterServices();
    setIsInvestigationOpen(true);
  };

  const handleToggleInvestigation = (svc) => {
    const exists = selectedInvestigationsDraft.some(
      (item) => item.serviceId === svc.id || item.name === svc.ServiceName
    );
    if (exists) {
      setSelectedInvestigationsDraft(
        selectedInvestigationsDraft.filter(
          (item) => item.serviceId !== svc.id && item.name !== svc.ServiceName
        )
      );
    } else {
      const dept = masterDepartments.find((d) => d.id === svc.DepartmentId);
      setSelectedInvestigationsDraft([
        ...selectedInvestigationsDraft,
        {
          serviceId: svc.id,
          serviceName: svc.ServiceName,
          name: svc.ServiceName,
          departmentId: svc.DepartmentId,
          departmentName: dept?.DepartmentName || "",
          code: svc.Code,
          charges: svc.DefaultCharges,
          instructions: "",
        },
      ]);
    }
  };

  const handleRemoveInvestigationDraft = (serviceIdOrName) => {
    setSelectedInvestigationsDraft(
      selectedInvestigationsDraft.filter(
        (item) => item.serviceId !== serviceIdOrName && item.name !== serviceIdOrName
      )
    );
  };

  const handleSaveInvestigations = async () => {
    try {
      setIsSavingInvestigations(true);
      setDialogError(null);

      const targetPrescId = currentPrescription?.id;

      const res = await opdInvestigationService.sync({
        prescriptionId: targetPrescId || null,
        patientId: targetPatientId || null,
        visitId: targetVisitId || null,
        investigations: selectedInvestigationsDraft,
      });

      const list = Array.isArray(res.data) ? res.data : res.data?.data || selectedInvestigationsDraft;
      setPatientInvestigations(list);
      setIsInvestigationOpen(false);
      setMessage({ type: "success", text: "Ordered investigations updated successfully!" });
    } catch (err) {
      console.error("Failed to save investigations:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to save investigations");
      setDialogError(errMsg);
    } finally {
      setIsSavingInvestigations(false);
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
  const doctorName = currentDoctor?.Name || activePatient?.doctor_name || activePatient?.doctor?.Name || authUser?.name || "";
  const doctorQualification = currentDoctor?.Qualification || activePatient?.doctor?.Qualification || "";
  const doctorDept = currentDoctor?.Specialization || activePatient?.department_name || activePatient?.doctor?.Specialization || "";
  const doctorPmdc =
    currentDoctor?.RegistrationNo || activePatient?.doctor?.RegistrationNo
      ? `PMDC Reg #: ${currentDoctor?.RegistrationNo || activePatient.doctor.RegistrationNo}`
      : "";
  const doctorStamp = currentDoctor?.Stamp || activePatient?.doctor?.Stamp || "";

  // Patient Info Fallbacks & Dynamic Age Calculation
  const patientName = activePatient?.patient_name || activePatient?.patient?.pName || (activePatient ? "Patient Record" : "-");
  const patientMrn = activePatient?.patient_mrn || activePatient?.patient?.mrn || "-";
  const patientGender = activePatient?.patient_gender || activePatient?.patient?.gender || "-";
  const patientMobile = activePatient?.patient_mobile || activePatient?.patient?.mobile || "-";

  const patientDob = activePatient?.patient_dob || activePatient?.patient?.dob || activePatient?.dob;
  const rawAge = activePatient?.patient?.age || activePatient?.age;
  let patientAge = "-";
  if (patientDob) {
    patientAge = calculateAge(patientDob);
  } else if (rawAge) {
    patientAge = String(rawAge).includes("Y") || String(rawAge).includes("M") ? String(rawAge) : `${rawAge} Y`;
  }

  const rawGuardian = activePatient?.patient_gname || activePatient?.patient?.gName || activePatient?.patient?.guardianName || activePatient?.gName;
  const guardianName = rawGuardian
    ? rawGuardian.toLowerCase().startsWith("s/o") || rawGuardian.toLowerCase().startsWith("w/o") || rawGuardian.toLowerCase().startsWith("d/o")
      ? rawGuardian
      : `S/O: ${rawGuardian}`
    : "-";
  const tokenNo = activePatient?.tokenNo || (activePatient ? 1 : "-");
  const visitNo = activePatient?.visitNo || activePatient?.InvoiceNo || "-";
  const visitDate = activePatient?.InvoiceDate ? formatDate(activePatient.InvoiceDate) : (activePatient ? new Date().toLocaleDateString("en-GB") : "-");

  const selectedCase = previousLabCases.find((c) => c.id === selectedLabCaseId) || previousLabCases[0];

  const filteredMasterSymptoms = masterSymptoms.filter((s) => {
    if (!symptomSearchQuery.trim()) return true;
    const q = symptomSearchQuery.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.code && s.code.toLowerCase().includes(q))
    );
  });

  const filteredMasterExams = masterExams.filter((e) => {
    if (!examSearchQuery.trim()) return true;
    const q = examSearchQuery.toLowerCase();
    return e.name && e.name.toLowerCase().includes(q);
  });

  const filteredMasterDiagnoses = masterDiagnoses.filter((d) => {
    if (!diagnosisSearchQuery.trim()) return true;
    const q = diagnosisSearchQuery.toLowerCase();
    return d.name && d.name.toLowerCase().includes(q);
  });

  const filteredMasterServices = masterServices.filter((svc) => {
    if (selectedDeptFilter !== "all" && svc.DepartmentId !== selectedDeptFilter) {
      return false;
    }
    if (!investigationSearchQuery.trim()) return true;
    const q = investigationSearchQuery.toLowerCase();
    return (
      (svc.ServiceName && svc.ServiceName.toLowerCase().includes(q)) ||
      (svc.Code && svc.Code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {message && (
        <Alert
          className={
            message.type === "error"
              ? "bg-red-50 text-red-900 border-red-200"
              : "bg-emerald-50 text-emerald-900 border-emerald-200"
          }
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="h-5 w-5 text-teal-600" />
            OPD Prescription Workspace & Report Preview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activePatient ? (
              <>
                Prescription encounter for token <strong className="text-slate-800">#{String(tokenNo).padStart(2, "0")}</strong> - {patientName}
              </>
            ) : (
              "Prescription encounter (Select a patient from OPD queue or search to begin)"
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            onClick={handleOpenVitalsDialog}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-teal-300 text-teal-800 hover:bg-teal-50 font-medium"
          >
            <Activity className="h-3.5 w-3.5 mr-1 text-teal-600" />
            Vitals
          </Button>

          <Button
            onClick={handleOpenHistoryDialog}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-blue-300 text-blue-800 hover:bg-blue-50 font-medium relative"
          >
            <FileText className="h-3.5 w-3.5 mr-1 text-blue-600" />
            History
            {patientHistory && (
              <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-blue-600" title="History recorded" />
            )}
          </Button>

          <Button
            onClick={handleOpenSymptomsDialog}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-amber-300 text-amber-900 hover:bg-amber-50 font-medium relative"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-600" />
            Symptoms
            {patientSymptoms && patientSymptoms.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-amber-100 text-amber-900 border-amber-300">
                {patientSymptoms.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleOpenExamDialog}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-blue-300 text-blue-900 hover:bg-blue-50 font-medium relative"
          >
            <Stethoscope className="h-3.5 w-3.5 mr-1 text-blue-600" />
            Examination
            {patientExams && patientExams.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-blue-100 text-blue-900 border-blue-300">
                {patientExams.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleOpenDiagnosisDialog}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-teal-300 text-teal-900 hover:bg-teal-50 font-medium relative"
          >
            <Brain className="h-3.5 w-3.5 mr-1 text-teal-600" />
            Diagnosis
            {patientDiagnoses && patientDiagnoses.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-teal-100 text-teal-900 border-teal-300">
                {patientDiagnoses.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleOpenInvestigationDialog}
            size="sm"
            variant="outline"
            className="h-8 text-xs border-amber-300 text-amber-900 hover:bg-amber-50 font-medium relative"
          >
            <TestTube className="h-3.5 w-3.5 mr-1 text-amber-600" />
            Investigations
            {patientInvestigations && patientInvestigations.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-amber-100 text-amber-900 border-amber-300">
                {patientInvestigations.length}
              </Badge>
            )}
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

      {/* Side-by-Side 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (5 Columns): 3 Stacked Sections */}
        <div className="lg:col-span-5 space-y-5">
          {/* ========================================================================= */}
          {/* COLUMN 1: Previous Prescriptions History */}
          {/* ========================================================================= */}
          <Card className="border border-slate-200 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-3.5 border-b bg-slate-50/70 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-teal-500/10 text-teal-700">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold text-slate-800">
                    Previous Prescriptions History
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">
                    Copy previous medications & advice into todays prescription
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-slate-600 hover:text-teal-700"
                onClick={() => fetchPreviousPrescriptions(targetPatientId)}
                disabled={loadingPrevPrescriptions}
                title="Refresh Prescriptions"
              >
                <RefreshCw className={`h-3 w-3 ${loadingPrevPrescriptions ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPrevPrescriptions ? (
                <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />
                  Loading prescriptions history...
                </div>
              ) : previousPrescriptions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <FileText className="h-6 w-6 text-slate-300 mx-auto mb-1 stroke-[1.5]" />
                  No previous prescriptions found for this patient.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                  <Table className="text-xs">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="h-7 text-[11px] font-semibold text-slate-600">Prescription #</TableHead>
                        <TableHead className="h-7 text-[11px] font-semibold text-slate-600">Date</TableHead>
                        <TableHead className="h-7 text-[11px] font-semibold text-slate-600">Doctor</TableHead>
                        <TableHead className="h-7 text-[11px] font-semibold text-slate-600 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousPrescriptions.map((presc) => (
                        <TableRow key={presc.id} className="hover:bg-slate-50/80">
                          <TableCell className="py-2 font-mono font-bold text-slate-800 text-[11px]">
                            {presc.prescriptionNo}
                          </TableCell>
                          <TableCell className="py-2 text-slate-600 text-[11px]">
                            {formatDate(presc.presc_date || presc.created_at)}
                          </TableCell>
                          <TableCell className="py-2 text-slate-700 text-[11px] truncate max-w-25">
                            {presc.doctorName || presc.doctor?.Name || "Consultant"}
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyPrescription(presc)}
                              className="h-6 text-[10px] px-2 bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 font-semibold gap-1"
                              title="Copy to Today's Prescription"
                            >
                              <Copy className="h-2.5 w-2.5" />
                              Copy
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* COLUMN 2: Prescription Advice & Follow-Up Date */}
          {/* ========================================================================= */}
          <Card className="border border-slate-200 shadow-xs bg-white">
            <CardHeader className="p-3.5 border-b bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-700">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold text-slate-800">
                    Prescription Advice & Follow-Up Date
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">
                    Doctors precautions, diet advice, and review schedule
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Advice Input Field */}
              <div className="space-y-1.5">
                <Label htmlFor="advice-input" className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Special Advice & Precautions:</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Syncs live with report</span>
                </Label>
                <Textarea
                  id="advice-input"
                  rows={3}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="Enter diet, precautions, and instructions for the patient..."
                  className="text-xs font-medium resize-none"
                />

                {/* Quick Advice Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "Take medicines after meals with water.",
                    "Complete bed rest for 3 days.",
                    "Low salt & low fat diet.",
                    "Drink plenty of boiled water / ORS.",
                    "Avoid cold drinks, oily & spicy food.",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyAdvicePreset(preset)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-600 rounded-md border border-slate-200 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up Date Field */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <Label htmlFor="followup-input" className="text-xs font-semibold text-slate-800">
                  Next Review / Follow-Up Appointment:
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                  <Input
                    id="followup-input"
                    type="date"
                    value={rawFollowupDate}
                    onChange={handleManualFollowupDateChange}
                    className="h-8 text-xs font-medium"
                  />
                  <span className="text-xs font-bold text-teal-800 truncate bg-teal-50/80 px-2 py-1.5 rounded-md border border-teal-200/80">
                    {followupDate}
                  </span>
                </div>

                {/* Quick Follow-up Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { days: 3, label: "After 3 Days" },
                    { days: 7, label: "After 7 Days" },
                    { days: 10, label: "After 10 Days" },
                    { days: 14, label: "After 2 Weeks" },
                    { days: 30, label: "After 1 Month" },
                  ].map((p, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplyFollowupDays(p.days, p.label)}
                      className="h-6 text-[10px] px-2 font-medium bg-blue-50/50 text-blue-900 border-blue-200 hover:bg-blue-100"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ========================================================================= */}
          {/* COLUMN 3: Previous Laboratory Results */}
          {/* ========================================================================= */}
          <Card className="border border-slate-200 shadow-xs bg-white overflow-hidden">
            <CardHeader className="p-3.5 border-b bg-slate-50/70 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-700">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xs font-bold text-slate-800">
                    Previous Laboratory Results
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">
                    Select a case to inspect test names & print full results
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 text-slate-600 hover:text-amber-700"
                onClick={() => fetchPreviousLabCases(targetPatientId, targetPatientMrn)}
                disabled={loadingPrevLabCases}
                title="Refresh Lab Results"
              >
                <RefreshCw className={`h-3 w-3 ${loadingPrevLabCases ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPrevLabCases ? (
                <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                  Loading laboratory results...
                </div>
              ) : previousLabCases.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <FlaskConical className="h-6 w-6 text-slate-300 mx-auto mb-1 stroke-[1.5]" />
                  No previous laboratory cases found for this patient.
                </div>
              ) : (
                <div>
                  {/* Master Cases Table */}
                  <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border-b border-slate-100">
                    <Table className="text-xs">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="h-7 text-[11px] font-semibold text-slate-600">Case No</TableHead>
                          <TableHead className="h-7 text-[11px] font-semibold text-slate-600">Case Date</TableHead>
                          <TableHead className="h-7 text-[11px] font-semibold text-slate-600">Referred By</TableHead>
                          <TableHead className="h-7 text-[11px] font-semibold text-slate-600 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previousLabCases.map((c) => {
                          const isSelected = selectedLabCaseId === c.id;
                          return (
                            <TableRow
                              key={c.id}
                              onClick={() => setSelectedLabCaseId(c.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? "bg-amber-50/80 font-medium" : "hover:bg-slate-50/80"
                              }`}
                            >
                              <TableCell className="py-2 text-[11px]">
                                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800">
                                  {isSelected ? (
                                    <ChevronDown className="h-3.5 w-3.5 text-amber-600" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                  )}
                                  <span>{c.caseNo}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2 text-slate-600 text-[11px]">
                                {formatDate(c.caseDate || c.created_at)}
                              </TableCell>
                              <TableCell className="py-2 text-slate-700 text-[11px] truncate max-w-27">
                                {c.orReffBy || c.doctor_name || "Self"}
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintLabReport(c);
                                  }}
                                  className="h-6 text-[10px] px-2 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-semibold gap-1"
                                  title="Print / View Lab Report"
                                >
                                  <Printer className="h-2.5 w-2.5" />
                                  Print
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Appended Sub-Rows: Test Names for Selected Case */}
                  {selectedCase && (
                    <div className="p-3 bg-amber-50/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1">
                          <FlaskConical className="h-3 w-3 text-amber-600" />
                          Tests in Case #{selectedCase.caseNo} ({selectedCase.tests?.length || 0})
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrintLabReport(selectedCase)}
                          className="h-5 text-[10px] px-1.5 text-amber-800 hover:text-amber-950 font-bold hover:bg-amber-100"
                        >
                          <ExternalLink className="h-2.5 w-2.5 mr-1" />
                          Open Full Report
                        </Button>
                      </div>

                      {selectedCase.tests && selectedCase.tests.length > 0 ? (
                        <div className="space-y-1">
                          {selectedCase.tests.map((test, tIdx) => (
                            <div
                              key={test.id || tIdx}
                              className="flex items-center justify-between p-1.5 rounded-md bg-white border border-amber-200/80 text-[11px] shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 font-semibold text-[10px] w-4">
                                  {tIdx + 1}.
                                </span>
                                <span className="font-semibold text-slate-800">
                                  {test.testName || "Laboratory Test"}
                                </span>
                                {test.testCode && (
                                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {test.testCode}
                                  </span>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  test.isApproved
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] px-1.5 py-0 font-medium"
                                    : test.isPerformed
                                    ? "bg-blue-50 text-blue-700 border-blue-300 text-[10px] px-1.5 py-0 font-medium"
                                    : "bg-slate-100 text-slate-600 border-slate-300 text-[10px] px-1.5 py-0 font-medium"
                                }
                              >
                                {test.isApproved ? "Approved" : test.isPerformed ? "Performed" : "Pending"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic p-1">No test records registered for this case.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side (7 Columns): Current A4 Prescription Report Live Preview */}
        <div className="lg:col-span-7 flex justify-center bg-slate-100/80 p-4 sm:p-6 rounded-xl overflow-x-auto shadow-inner">
          <div
            ref={contentRef}
            className="w-[210mm] min-h-[297mm] bg-white border border-slate-300 shadow-md p-8 flex flex-col justify-between text-slate-800 text-xs print:w-[210mm] print:h-[297mm] print:shadow-none print:p-6 print:m-0 shrink-0"
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
                <div className="flex items-start justify-between border-b-2 border-teal-600 pb-5 mb-5 min-h-24">
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
              <div className="grid grid-cols-12 gap-3 bg-teal-50/50 border border-teal-200/80 rounded-xl p-3.5 mb-4 text-xs items-center shadow-2xs">
                <div className="col-span-4 border-r border-teal-200/60 pr-3 space-y-0.5">
                  <p className="font-bold text-slate-900 text-sm tracking-tight leading-tight">{patientName}</p>
                  <p className="text-slate-600 text-xs font-medium">{guardianName}</p>
                </div>

                <div className="col-span-3 border-r border-teal-200/60 px-3 space-y-1">
                  <p className="text-slate-600 font-medium">
                    MRN: <strong className="text-slate-900 font-mono text-xs font-bold">{patientMrn}</strong>
                  </p>
                  <p className="text-slate-600 font-medium">
                    Mobile: <strong className="text-slate-900 font-mono text-xs font-bold">{patientMobile}</strong>
                  </p>
                </div>

                <div className="col-span-3 border-r border-teal-200/60 px-3 space-y-1">
                  <p className="text-slate-600 font-medium">
                    Age / Sex: <strong className="text-slate-900 text-xs font-bold">{patientAge} / {patientGender}</strong>
                  </p>
                  <p className="text-slate-600 font-medium">
                    Visit No: <strong className="text-slate-900 font-mono text-xs font-bold">{visitNo}</strong>
                  </p>
                </div>

                <div className="col-span-2 text-right pl-3 space-y-1">
                  <p className="text-slate-600 font-medium">Date:</p>
                  <p className="text-slate-900 text-xs font-bold">{visitDate}</p>
                </div>
              </div>

              {/* 3. Vitals Bar */}
              {vitals && (vitals.bp || vitals.pulse || vitals.temp || vitals.weight || vitals.spo2 || vitals.bsr) && (
                <div className="flex flex-wrap items-center gap-5 bg-slate-50 border border-slate-200 rounded-md p-2.5 mb-4 text-xs font-medium">
                  <span className="font-bold text-slate-800 uppercase flex items-center gap-1">
                    <Activity className="h-4 w-4 text-teal-600" /> Vitals:
                  </span>
                  {vitals.bp && <span>BP: <strong className="text-slate-900 font-bold">{vitals.bp}</strong></span>}
                  {vitals.pulse && <span>Pulse: <strong className="text-slate-900 font-bold">{vitals.pulse}</strong></span>}
                  {vitals.temp && <span>Temp: <strong className="text-slate-900 font-bold">{vitals.temp}</strong></span>}
                  {vitals.weight && <span>Weight: <strong className="text-slate-900 font-bold">{vitals.weight}</strong></span>}
                  {vitals.spo2 && <span>SpO2: <strong className="text-slate-900 font-bold">{vitals.spo2}</strong></span>}
                  {vitals.bsr && <span>BSR: <strong className="text-slate-900 font-bold">{vitals.bsr}</strong></span>}
                </div>
              )}

              {/* 3.1 Patient Medical History Bar */}
              {patientHistory && (
                patientHistory.past_medical_history ||
                patientHistory.past_surgical_history ||
                patientHistory.medication_history ||
                patientHistory.allergy_history ||
                patientHistory.family_history ||
                patientHistory.social_history
              ) && (
                <div className="bg-blue-50/60 border border-blue-200/80 rounded-md p-2.5 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 uppercase text-[11px] mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-blue-700" />
                    <span>Patient Medical History:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-slate-700 text-xs">
                    {patientHistory.past_medical_history && (
                      <div>
                        <strong className="text-slate-900">Medical:</strong> {patientHistory.past_medical_history}
                      </div>
                    )}
                    {patientHistory.past_surgical_history && (
                      <div>
                        <strong className="text-slate-900">Surgical:</strong> {patientHistory.past_surgical_history}
                      </div>
                    )}
                    {patientHistory.medication_history && (
                      <div>
                        <strong className="text-slate-900">Medications:</strong> {patientHistory.medication_history}
                      </div>
                    )}
                    {patientHistory.allergy_history && (
                      <div className="text-rose-900">
                        <strong className="text-rose-950">Allergies:</strong> {patientHistory.allergy_history}
                      </div>
                    )}
                    {patientHistory.family_history && (
                      <div>
                        <strong className="text-slate-900">Family:</strong> {patientHistory.family_history}
                      </div>
                    )}
                    {patientHistory.social_history && (
                      <div>
                        <strong className="text-slate-900">Social:</strong> {patientHistory.social_history}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3.2 Patient Symptoms / Complaints */}
              {patientSymptoms && patientSymptoms.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-amber-50/50 border border-amber-200/80 rounded-md p-2.5 mb-3 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-amber-900 uppercase text-[11px] shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                    Presenting Symptoms:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {patientSymptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-950 font-medium text-xs shadow-2xs"
                      >
                        • {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3.3 Patient Physical Examination Findings */}
              {patientExams && patientExams.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-md p-2.5 mb-3 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 uppercase text-[11px] shrink-0">
                    <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                    Physical Examination Findings:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {patientExams.map((exam, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900 font-medium text-xs shadow-2xs"
                      >
                        • {exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3.4 Patient Diagnosis / Clinical Impression */}
              {((patientDiagnoses && patientDiagnoses.length > 0) || diagnosis) && (
                <div className="flex flex-wrap items-center gap-2 bg-teal-50/70 border border-teal-200 rounded-md p-2.5 mb-3 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-teal-950 uppercase text-[11px] shrink-0">
                    <Brain className="h-3.5 w-3.5 text-teal-700" />
                    Diagnosis / Clinical Impression:
                  </span>
                  {patientDiagnoses && patientDiagnoses.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      {patientDiagnoses.map((diag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded bg-white border border-teal-400 text-teal-950 font-bold text-xs shadow-2xs"
                        >
                          ✓ {diag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-teal-950 bg-white px-2 py-0.5 rounded border border-teal-200">
                      {diagnosis}
                    </span>
                  )}
                </div>
              )}

              {/* 4. Investigations Ordered Grid */}
              {((patientInvestigations && patientInvestigations.length > 0) || investigations) && (
                <div className="flex flex-wrap items-center gap-2 bg-amber-50/60 border border-amber-200/80 rounded-md p-2.5 mb-4 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-amber-950 uppercase text-[11px] shrink-0">
                    <TestTube className="h-3.5 w-3.5 text-amber-700" />
                    Investigations Ordered:
                  </span>
                  {patientInvestigations && patientInvestigations.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 flex-1">
                      {patientInvestigations.map((inv, idx) => {
                        const invName = typeof inv === "string" ? inv : (inv.serviceName || inv.name);
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded bg-white border border-amber-300 text-slate-900 font-bold text-xs shadow-2xs font-mono"
                          >
                            • {invName}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-amber-300 font-mono">
                      {investigations}
                    </span>
                  )}
                </div>
              )}

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
               {advice &&( <div>
                  <span className="font-bold text-slate-800 uppercase text-xs tracking-wider block mb-1">
                    Advice & Special Instructions:
                  </span>
                  <p className="text-slate-800 font-medium">{advice }</p>
                </div>
                )}
                
                {followupDate && (
                  <div className="text-right">
                    <span className="font-bold text-teal-800 uppercase text-xs tracking-wider block mb-1">
                      Next Review / Follow-Up:
                    </span>
                    <p className="font-bold text-teal-950 text-xs">{followupDate}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 7. Footer / Doctor Signature & Notice */}
            <div className="pt-8 border-t border-slate-200 mt-6 flex items-end justify-between text-xs">
              <div>
                <p className="text-slate-500 text-[11px]">
                  Printed Date: {new Date().toLocaleDateString("en-GB")}{" "}
                  {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-center space-y-0.5 min-w-45">
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
      </div>

      {/* Patient Vitals Dialog Modal */}
      <Dialog open={isVitalsOpen} onOpenChange={(open) => { setIsVitalsOpen(open); if (!open) setDialogError(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2 text-teal-800 pr-6">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600" />
                {existingVitalId ? "Update Patient Vital Signs" : "Record Patient Vital Signs"}
              </span>
              <Badge
                variant="outline"
                className={
                  existingVitalId
                    ? "bg-amber-50 text-amber-900 border-amber-300 font-bold px-2 py-0.5 text-[11px]"
                    : "bg-teal-50 text-teal-900 border-teal-300 font-bold px-2 py-0.5 text-[11px]"
                }
              >
                {existingVitalId ? "UPDATE MODE" : "INSERT MODE"}
              </Badge>
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

            <div className="flex items-center justify-between pt-2 border-t">
              {existingVitalId ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteVitals}
                  className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove Vitals
                </Button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsVitalsOpen(false)} size="sm" className="h-8 text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingVital}
                  size="sm"
                  className={
                    existingVitalId
                      ? "h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                      : "h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                  }
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  {existingVitalId ? "Update Vitals Record" : "Save Vitals Record"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Medical History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-800">
                    Patient Medical History
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Centralized continuous medical history for <strong>{patientName}</strong> ({patientMrn})
                  </p>
                </div>
              </div>

              {patientHistory?.updated_by_name && (
                <div className="text-right">
                  <Badge variant="outline" className="bg-slate-50 text-slate-600 text-[10px]">
                    Last updated by: {patientHistory.updated_by_name}
                  </Badge>
                  {patientHistory.updated_at && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(patientHistory.updated_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {dialogError && (
            <Alert className="bg-red-50 text-red-900 border-red-200 py-2">
              <AlertDescription className="text-xs">{dialogError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmitHistory(onSubmitHistory)} className="space-y-4 pt-1">
            {/* 1. Past Medical History */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-rose-600" />
                  Past Medical History:
                </Label>
                <span className="text-[10px] text-muted-foreground">HTN, Diabetes, Cardiac, etc.</span>
              </div>
              <Textarea
                placeholder="e.g. Known hypertensive for 5 years, Type-2 Diabetes on oral medications..."
                rows={2}
                {...registerHistory("past_medical_history")}
                className="text-xs bg-white resize-none"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {["HTN (Hypertension)", "Type-2 Diabetes Mellitus", "Asthma", "Ischemic Heart Disease (IHD)", "CKD"].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendHistoryChip("past_medical_history", preset)}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 rounded border border-slate-200 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Past Surgical History */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                  Past Surgical History:
                </Label>
                <span className="text-[10px] text-muted-foreground">Prior surgeries & interventions</span>
              </div>
              <Textarea
                placeholder="e.g. Laparoscopic Appendectomy (2020), Cholecystectomy (2023)..."
                rows={2}
                {...registerHistory("past_surgical_history")}
                className="text-xs bg-white resize-none"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {["Appendectomy", "Cholecystectomy", "C-Section", "Inguinal Hernia Repair", "CABG"].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendHistoryChip("past_surgical_history", preset)}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-600 rounded border border-slate-200 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Medication History */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5 text-teal-600" />
                  Medication History:
                </Label>
                <span className="text-[10px] text-muted-foreground">Regular & ongoing drugs</span>
              </div>
              <Textarea
                placeholder="e.g. Tab. Metformin 500mg BD, Tab. Amlodipine 5mg OD..."
                rows={2}
                {...registerHistory("medication_history")}
                className="text-xs bg-white resize-none"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {["Tab. Metformin 500mg", "Tab. Amlodipine 5mg", "Tab. Aspirin 75mg", "Cap. Omeprazole 20mg", "Inj. Insulin 70/30"].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendHistoryChip("medication_history", preset)}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-600 rounded border border-slate-200 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Allergy History */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Allergy History:
                </Label>
                <span className="text-[10px] text-muted-foreground">Drug, food & environmental allergies</span>
              </div>
              <Textarea
                placeholder="e.g. Penicillin causes skin rash, Sulfa drug allergy..."
                rows={2}
                {...registerHistory("allergy_history")}
                className="text-xs bg-white resize-none"
              />
              <div className="flex flex-wrap gap-1 pt-0.5">
                {["Penicillin Allergy", "Sulfa Drugs Allergy", "NSAIDs / Aspirin Allergy", "Dust & Pollen Allergy", "No Known Drug Allergies (NKDA)"].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAppendHistoryChip("allergy_history", preset)}
                    className="text-[10px] px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-slate-600 rounded border border-slate-200 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Family History & 6. Social History Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Family History */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-purple-600" />
                  Family History:
                </Label>
                <Textarea
                  placeholder="e.g. Father had CAD & HTN, Mother has Diabetes..."
                  rows={2}
                  {...registerHistory("family_history")}
                  className="text-xs bg-white resize-none"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {["CAD in father", "Diabetes in mother", "Hypertension", "Asthma"].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAppendHistoryChip("family_history", preset)}
                      className="text-[10px] px-2 py-0.5 bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-slate-600 rounded border border-slate-200 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social History */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/70 border border-slate-200/80">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Social History:
                </Label>
                <Textarea
                  placeholder="e.g. Non-smoker, sedentary lifestyle, teacher by profession..."
                  rows={2}
                  {...registerHistory("social_history")}
                  className="text-xs bg-white resize-none"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {["Non-smoker", "Cigarette Smoker", "Sedentary lifestyle", "Active lifestyle"].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAppendHistoryChip("social_history", preset)}
                      className="text-[10px] px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-600 rounded border border-slate-200 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsHistoryOpen(false)}
                size="sm"
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingHistory}
                size="sm"
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {patientHistory ? "Update Medical History" : "Save Medical History"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Symptoms Modal */}
      <Dialog open={isSymptomsOpen} onOpenChange={setIsSymptomsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-800">
                    Patient Symptoms
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select and record presenting symptoms for <strong>{patientName}</strong> ({patientMrn})
                  </p>
                </div>
              </div>

              {selectedSymptomsDraft.length > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-mono text-xs">
                  {selectedSymptomsDraft.length} selected
                </Badge>
              )}
            </div>
          </DialogHeader>

          {dialogError && (
            <Alert className="bg-red-50 text-red-900 border-red-200 py-2">
              <AlertDescription className="text-xs">{dialogError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 pt-1">
            {/* 1. Selected Symptoms Display & Textarea */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-amber-600" />
                  Selected Symptoms Text Area:
                </Label>
                {selectedSymptomsDraft.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSymptomsDraft([])}
                    className="text-[10px] text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Textarea showing selected symptoms list */}
              <Textarea
                rows={2}
                value={selectedSymptomsDraft.join(", ")}
                readOnly
                placeholder="Selected symptoms will appear here..."
                className="text-xs bg-white resize-none font-medium text-slate-800 border-amber-200 focus-visible:ring-amber-500"
              />

              {selectedSymptomsDraft.length === 0 ? (
                <p className="text-xs text-slate-400 italic pt-0.5">
                  No symptoms selected yet. Pick from the master list below or add a custom symptom.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSymptomsDraft.map((symptom, idx) => (
                    <Badge
                      key={idx}
                      className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs py-1 px-2.5 shadow-2xs font-medium"
                    >
                      <span>{symptom}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSymptomDraft(symptom)}
                        className="rounded-full hover:bg-amber-700/50 p-0.5"
                        title="Remove symptom"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Search & Select from Master Symptoms */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Search & Select from Master Symptoms:
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Type to search symptoms (e.g. Fever, Cough, Headache, Chest Pain)..."
                  value={symptomSearchQuery}
                  onChange={(e) => setSymptomSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              {/* Master Symptoms Filterable Grid/List */}
              <div className="max-h-48 overflow-y-auto p-2 rounded-md border bg-white divide-y divide-slate-100">
                {loadingMasterSymptoms ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                    Loading master symptoms...
                  </div>
                ) : filteredMasterSymptoms.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching master symptoms found. You can add it as a custom symptom below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1">
                    {filteredMasterSymptoms.map((s) => {
                      const isSelected = selectedSymptomsDraft.includes(s.name);
                      return (
                        <button
                          key={s.id || s.code}
                          type="button"
                          onClick={() => handleToggleSymptom(s.name)}
                          className={`flex items-center justify-between p-2 rounded text-left text-xs transition-colors border ${
                            isSelected
                              ? "bg-amber-50 text-amber-900 border-amber-300 font-semibold"
                              : "hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200"
                          }`}
                        >
                          <span>{s.name}</span>
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Add Custom Symptom Input */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label className="text-xs font-semibold text-slate-800">
                Or Add Custom Symptom:
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter custom symptom name..."
                  value={customSymptomInput}
                  onChange={(e) => setCustomSymptomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSymptom();
                    }
                  }}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCustomSymptom}
                  disabled={!customSymptomInput.trim()}
                  className="h-8 text-xs border-amber-300 text-amber-900 hover:bg-amber-50 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* 4. Quick Common Preset Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Quick Preset Symptoms:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  "Fever",
                  "High Grade Fever",
                  "Dry Cough",
                  "Productive Cough",
                  "Headache",
                  "Chest Pain",
                  "Shortness of Breath",
                  "Abdominal Pain",
                  "Vomiting",
                  "Loose Motions",
                  "Dizziness",
                  "Generalized Body Aches",
                  "Loss of Appetite",
                  "Sore Throat",
                ].map((preset, idx) => {
                  const isSelected = selectedSymptomsDraft.includes(preset);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleSymptom(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        isSelected
                          ? "bg-amber-100 border-amber-400 text-amber-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-800"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSymptomsOpen(false)}
                size="sm"
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveSymptoms}
                disabled={isSavingSymptoms}
                size="sm"
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {isSavingSymptoms ? "Saving..." : "Save Symptoms"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Physical Examination Modal */}
      <Dialog open={isExamOpen} onOpenChange={setIsExamOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-800">
                    Physical Examination Findings
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Record clinical examination observations for <strong>{patientName}</strong> ({patientMrn})
                  </p>
                </div>
              </div>

              {selectedExamsDraft.length > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300 font-mono text-xs">
                  {selectedExamsDraft.length} selected
                </Badge>
              )}
            </div>
          </DialogHeader>

          {dialogError && (
            <Alert className="bg-red-50 text-red-900 border-red-200 py-2">
              <AlertDescription className="text-xs">{dialogError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 pt-1">
            {/* 1. Selected Exams Display & Textarea */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-blue-600" />
                  Selected Examination Text Area:
                </Label>
                {selectedExamsDraft.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedExamsDraft([])}
                    className="text-[10px] text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <Textarea
                rows={2}
                value={selectedExamsDraft.join(", ")}
                readOnly
                placeholder="Selected physical examination findings will appear here..."
                className="text-xs bg-white resize-none font-medium text-slate-800 border-blue-200 focus-visible:ring-blue-500"
              />

              {selectedExamsDraft.length === 0 ? (
                <p className="text-xs text-slate-400 italic pt-0.5">
                  No examination findings selected yet. Pick from the master list below or add a custom finding.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedExamsDraft.map((exam, idx) => (
                    <Badge
                      key={idx}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs py-1 px-2.5 shadow-2xs font-medium"
                    >
                      <span>{exam}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExamDraft(exam)}
                        className="rounded-full hover:bg-blue-800/50 p-0.5"
                        title="Remove finding"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Search & Select from Master Exams */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Search & Select from Master Examination Catalog:
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Type to search examination findings (e.g. Chest clear, CVS normal, Abdomen soft)..."
                  value={examSearchQuery}
                  onChange={(e) => setExamSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="max-h-48 overflow-y-auto p-2 rounded-md border bg-white divide-y divide-slate-100">
                {loadingMasterExams ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
                    Loading master examination list...
                  </div>
                ) : filteredMasterExams.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching master examination findings. You can add it as a custom finding below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1">
                    {filteredMasterExams.map((e) => {
                      const isSelected = selectedExamsDraft.includes(e.name);
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => handleToggleExam(e.name)}
                          className={`flex items-center justify-between p-2 rounded text-left text-xs transition-colors border ${
                            isSelected
                              ? "bg-blue-50 text-blue-900 border-blue-300 font-semibold"
                              : "hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200"
                          }`}
                        >
                          <span>{e.name}</span>
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Add Custom Exam Input */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label className="text-xs font-semibold text-slate-800">
                Or Add Custom Examination Finding:
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter custom examination finding..."
                  value={customExamInput}
                  onChange={(e) => setCustomExamInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomExam();
                    }
                  }}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCustomExam}
                  disabled={!customExamInput.trim()}
                  className="h-8 text-xs border-blue-300 text-blue-900 hover:bg-blue-50 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* 4. Quick Common Preset Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Quick Preset Examination Findings:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  "Chest: Clear bilaterally, normal vesicular breathing",
                  "CVS: S1 S2 normal, no murmurs",
                  "Abdomen: Soft, non-tender, no organomegaly",
                  "Throat: Congested / Erythematous",
                  "Tonsils: Normal, no exudates",
                  "Pallor: Absent",
                  "Jaundice: Absent",
                  "Cyanosis / Clubbing: Absent",
                  "Pedal Edema: Absent",
                  "CNS: Conscious, alert, GCS 15/15",
                  "P/A: Tenderness in Epigastrium",
                  "P/A: Tenderness in Right Iliac Fossa",
                  "Skin: No active rash or lesions",
                ].map((preset, idx) => {
                  const isSelected = selectedExamsDraft.includes(preset);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleExam(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        isSelected
                          ? "bg-blue-100 border-blue-400 text-blue-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-800"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExamOpen(false)}
                size="sm"
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveExams}
                disabled={isSavingExams}
                size="sm"
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {isSavingExams ? "Saving..." : "Save Findings"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Diagnosis Modal */}
      <Dialog open={isDiagnosisOpen} onOpenChange={setIsDiagnosisOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-800">
                    Diagnosis / Clinical Impression
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select and record diagnoses for <strong>{patientName}</strong> ({patientMrn})
                  </p>
                </div>
              </div>

              {selectedDiagnosesDraft.length > 0 && (
                <Badge variant="outline" className="bg-teal-50 text-teal-900 border-teal-300 font-mono text-xs">
                  {selectedDiagnosesDraft.length} selected
                </Badge>
              )}
            </div>
          </DialogHeader>

          {dialogError && (
            <Alert className="bg-red-50 text-red-900 border-red-200 py-2">
              <AlertDescription className="text-xs">{dialogError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 pt-1">
            {/* 1. Selected Diagnoses Display & Textarea */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-teal-600" />
                  Selected Diagnoses Text Area:
                </Label>
                {selectedDiagnosesDraft.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDiagnosesDraft([])}
                    className="text-[10px] text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <Textarea
                rows={2}
                value={selectedDiagnosesDraft.join(", ")}
                readOnly
                placeholder="Selected diagnoses will appear here..."
                className="text-xs bg-white resize-none font-medium text-slate-800 border-teal-200 focus-visible:ring-teal-500"
              />

              {selectedDiagnosesDraft.length === 0 ? (
                <p className="text-xs text-slate-400 italic pt-0.5">
                  No diagnoses selected yet. Pick from the master list below or add a custom diagnosis.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedDiagnosesDraft.map((diag, idx) => (
                    <Badge
                      key={idx}
                      className="bg-teal-600 hover:bg-teal-700 text-white gap-1 text-xs py-1 px-2.5 shadow-2xs font-medium"
                    >
                      <span>{diag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDiagnosisDraft(diag)}
                        className="rounded-full hover:bg-teal-800/50 p-0.5"
                        title="Remove diagnosis"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Search & Select from Master Diagnoses */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-800">
                Search & Select from Master Diagnosis Catalog:
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Type to search diagnoses (e.g. Hypertension, Diabetes, URTI, Typhoid)..."
                  value={diagnosisSearchQuery}
                  onChange={(e) => setDiagnosisSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="max-h-48 overflow-y-auto p-2 rounded-md border bg-white divide-y divide-slate-100">
                {loadingMasterDiagnoses ? (
                  <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-teal-600" />
                    Loading master diagnoses...
                  </div>
                ) : filteredMasterDiagnoses.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching master diagnoses found. You can add it as a custom diagnosis below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-1">
                    {filteredMasterDiagnoses.map((d) => {
                      const isSelected = selectedDiagnosesDraft.includes(d.name);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleToggleDiagnosis(d.name)}
                          className={`flex items-center justify-between p-2 rounded text-left text-xs transition-colors border ${
                            isSelected
                              ? "bg-teal-50 text-teal-900 border-teal-300 font-semibold"
                              : "hover:bg-slate-50 text-slate-700 border-transparent hover:border-slate-200"
                          }`}
                        >
                          <span>{d.name}</span>
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                          ) : (
                            <Plus className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Add Custom Diagnosis Input */}
            <div className="space-y-1.5 pt-2 border-t">
              <Label className="text-xs font-semibold text-slate-800">
                Or Add Custom Diagnosis:
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter custom diagnosis name..."
                  value={customDiagnosisInput}
                  onChange={(e) => setCustomDiagnosisInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomDiagnosis();
                    }
                  }}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddCustomDiagnosis}
                  disabled={!customDiagnosisInput.trim()}
                  className="h-8 text-xs border-teal-300 text-teal-900 hover:bg-teal-50 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* 4. Quick Common Preset Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Quick Preset Diagnoses:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  "Acute Febrile Illness / Viral Syndrome",
                  "Essential Hypertension (HTN)",
                  "Type 2 Diabetes Mellitus (T2DM)",
                  "Upper Respiratory Tract Infection (URTI)",
                  "Lower Respiratory Tract Infection (LRTI)",
                  "Acute Gastroenteritis (AGE)",
                  "Enteric Fever / Typhoid",
                  "Gastritis / Acid Peptic Disease",
                  "Urinary Tract Infection (UTI)",
                  "Ischemic Heart Disease (IHD)",
                  "Bronchial Asthma",
                  "COPD Exacerbation",
                  "Migraine / Tension Headache",
                  "Iron Deficiency Anemia",
                  "Generalized Myalgia",
                ].map((preset, idx) => {
                  const isSelected = selectedDiagnosesDraft.includes(preset);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleDiagnosis(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        isSelected
                          ? "bg-teal-100 border-teal-400 text-teal-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-800"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDiagnosisOpen(false)}
                size="sm"
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveDiagnoses}
                disabled={isSavingDiagnoses}
                size="sm"
                className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {isSavingDiagnoses ? "Saving..." : "Save Diagnosis"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Investigations Modal (Indoor Services) */}
      <Dialog open={isInvestigationOpen} onOpenChange={setIsInvestigationOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <TestTube className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-slate-800">
                    Order Indoor Investigations & Lab / Radiology Tests
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prescribe hospital services and diagnostic tests for <strong>{patientName}</strong> ({patientMrn})
                  </p>
                </div>
              </div>

              {selectedInvestigationsDraft.length > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-mono text-xs">
                  {selectedInvestigationsDraft.length} ordered
                </Badge>
              )}
            </div>
          </DialogHeader>

          {dialogError && (
            <Alert className="bg-red-50 text-red-900 border-red-200 py-2">
              <AlertDescription className="text-xs">{dialogError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 pt-1">
            {/* 1. Selected Investigations Display & Textarea */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-amber-600" />
                  Selected Investigations Text Area:
                </Label>
                {selectedInvestigationsDraft.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedInvestigationsDraft([])}
                    className="text-[10px] text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <Textarea
                rows={2}
                value={selectedInvestigationsDraft.map((i) => i.serviceName || i.name).join(", ")}
                readOnly
                placeholder="Selected indoor tests and investigations will appear here..."
                className="text-xs bg-white resize-none font-medium text-slate-800 border-amber-200 focus-visible:ring-amber-500 font-mono"
              />

              {selectedInvestigationsDraft.length === 0 ? (
                <p className="text-xs text-slate-400 italic pt-0.5">
                  No investigations selected yet. Choose from the hospital services catalog or click a preset below.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedInvestigationsDraft.map((inv, idx) => {
                    const name = inv.serviceName || inv.name;
                    return (
                      <Badge
                        key={idx}
                        className="bg-amber-600 hover:bg-amber-700 text-white gap-1 text-xs py-1 px-2.5 shadow-2xs font-medium"
                      >
                        <span>{name}</span>
                        {inv.departmentName && (
                          <span className="text-[9px] bg-amber-800/60 px-1 py-0.2 rounded text-amber-100 font-normal">
                            {inv.departmentName}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveInvestigationDraft(inv.serviceId || name)}
                          className="rounded-full hover:bg-amber-800/50 p-0.5"
                          title="Remove test"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Department Filter & Search from Services */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                <Label className="text-xs font-semibold text-slate-800 shrink-0">
                  Search Hospital Services Catalog:
                </Label>

                {masterDepartments.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground font-medium">Department:</span>
                    <select
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="text-xs border rounded-md px-2 py-1 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="all">All Diagnostic Depts ({masterServices.length})</option>
                      {masterDepartments
                        .filter((dept) => masterServices.some((s) => s.DepartmentId === dept.id))
                        .map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.DepartmentName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by test name or service code (e.g. CBC, X-Ray, Ultrasound, ECG, LFT)..."
                  value={investigationSearchQuery}
                  onChange={(e) => setInvestigationSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="max-h-56 overflow-y-auto p-2 rounded-md border bg-white divide-y divide-slate-100">
                {loadingMasterServices ? (
                  <div className="p-5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
                    Loading hospital services catalog...
                  </div>
                ) : filteredMasterServices.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">
                    No matching services found in hospital catalog.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1">
                    {filteredMasterServices.map((svc) => {
                      const isSelected = selectedInvestigationsDraft.some(
                        (item) => item.serviceId === svc.id || item.name === svc.ServiceName
                      );
                      const dept = masterDepartments.find((d) => d.id === svc.DepartmentId);
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => handleToggleInvestigation(svc)}
                          className={`flex items-center justify-between p-2 rounded text-left text-xs transition-colors border ${
                            isSelected
                              ? "bg-amber-50 text-amber-950 border-amber-400 font-semibold"
                              : "hover:bg-slate-50 text-slate-700 border-slate-200/60"
                          }`}
                        >
                          <div className="space-y-0.5 overflow-hidden pr-2">
                            <p className="font-semibold text-slate-900 truncate">{svc.ServiceName}</p>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                              {svc.Code && <span>Code: {svc.Code}</span>}
                              {dept?.DepartmentName && (
                                <span className="px-1 py-0 rounded bg-slate-100 text-slate-600 font-sans">
                                  {dept.DepartmentName}
                                </span>
                              )}
                              {svc.DefaultCharges > 0 && (
                                <span className="text-teal-700 font-bold font-sans">
                                  Rs. {Number(svc.DefaultCharges).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected ? (
                            <Check className="h-4 w-4 text-amber-700 shrink-0" />
                          ) : (
                            <Plus className="h-4 w-4 text-slate-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Quick Common Preset Chips */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Quick Common Presets:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  "CBC",
                  "ESR",
                  "LFTs",
                  "RFTs",
                  "Serum Electrolytes",
                  "Blood Sugar Fasting",
                  "Blood Sugar Random",
                  "Lipid Profile",
                  "Urine R/E",
                  "Stool R/E",
                  "Chest X-Ray PA",
                  "Ultrasound Abdomen & Pelvis",
                  "ECG",
                  "Serum Uric Acid",
                  "HbA1c",
                  "Thyroid Profile (TSH)",
                ].map((preset, idx) => {
                  const isSelected = selectedInvestigationsDraft.some(
                    (item) => (item.serviceName || item.name)?.toLowerCase().includes(preset.toLowerCase())
                  );
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        // Find matching service from catalog or add as draft
                        const matched = masterServices.find(
                          (s) =>
                            s.ServiceName?.toLowerCase() === preset.toLowerCase() ||
                            s.ServiceName?.toLowerCase().startsWith(preset.toLowerCase())
                        );
                        if (matched) {
                          handleToggleInvestigation(matched);
                        } else {
                          const exists = selectedInvestigationsDraft.some((item) => item.name === preset);
                          if (exists) {
                            setSelectedInvestigationsDraft(
                              selectedInvestigationsDraft.filter((item) => item.name !== preset)
                            );
                          } else {
                            setSelectedInvestigationsDraft([
                              ...selectedInvestigationsDraft,
                              {
                                serviceId: null,
                                serviceName: preset,
                                name: preset,
                                departmentId: null,
                                departmentName: "General",
                                instructions: "",
                              },
                            ]);
                          }
                        }
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                        isSelected
                          ? "bg-amber-100 border-amber-400 text-amber-900 font-semibold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-800"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInvestigationOpen(false)}
                size="sm"
                className="h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveInvestigations}
                disabled={isSavingInvestigations}
                size="sm"
                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                {isSavingInvestigations ? "Saving..." : "Save Investigations"}
              </Button>
            </div>
          </div>
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
