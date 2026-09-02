"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
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
import opdMedicationService from "@/services/opdMedication.service";
import pharmacyMedicineService from "@/services/pharmacyMedicine.service";
import masterFrequencyService from "@/services/masterFrequency.service";
import masterDurationService from "@/services/masterDuration.service";
import masterInstructionService from "@/services/masterInstruction.service";
import labCaseService from "@/services/labCase.service";
import hospitalProfileService from "@/services/hospitalProfile.service";
import hospitalOutputSettingService from "@/services/hospitalOutputSetting.service";
import doctorService from "@/services/doctor.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Heart,
  Thermometer,
  Scale,
  Wind,
  AlertCircle,
  ShieldAlert,
  Users,
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
    setValue: setVitalValue,
    watch: watchVital,
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

  // Watched vitals for dynamic clinical calculation (ui-ux-pro-max)
  const watchedSystolic = watchVital("systolic");
  const watchedDiastolic = watchVital("diastolic");
  const watchedPulse = watchVital("pulse_rate");
  const watchedTemp = watchVital("temperature");
  const watchedResp = watchVital("respiratory_rate");
  const watchedSpo2 = watchVital("spo2");
  const watchedWeight = watchVital("weight");
  const watchedHeight = watchVital("height");
  const watchedBsr = watchVital("bsr");
  const watchedNotes = watchVital("notes");

  // Clinical Vitals Real-Time Feedback
  const bpStatus = useMemo(() => {
    const sys = Number(watchedSystolic);
    const dia = Number(watchedDiastolic);
    if (!sys && !dia) return null;
    if (sys >= 180 || dia >= 120) {
      return { label: "Crisis HTN", color: "bg-rose-100 text-rose-800 border-rose-300" };
    }
    if (sys >= 140 || dia >= 90) {
      return { label: "Stage 2 HTN", color: "bg-rose-50 text-rose-700 border-rose-300" };
    }
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
      return { label: "Stage 1 HTN", color: "bg-amber-50 text-amber-800 border-amber-300" };
    }
    if (sys >= 120 && sys <= 129 && dia < 80) {
      return { label: "Elevated", color: "bg-yellow-50 text-yellow-800 border-yellow-300" };
    }
    if (sys > 0 && dia > 0 && sys < 120 && dia < 80) {
      return { label: "Normal BP", color: "bg-emerald-50 text-emerald-800 border-emerald-300" };
    }
    return null;
  }, [watchedSystolic, watchedDiastolic]);

  const pulseStatus = useMemo(() => {
    const p = Number(watchedPulse);
    if (!p) return null;
    if (p < 60) return { label: "Bradycardia", color: "bg-blue-50 text-blue-700 border-blue-300" };
    if (p > 100) return { label: "Tachycardia", color: "bg-rose-50 text-rose-700 border-rose-300" };
    return { label: "Normal", color: "bg-emerald-50 text-emerald-800 border-emerald-300" };
  }, [watchedPulse]);

  const tempStatus = useMemo(() => {
    const t = Number(watchedTemp);
    if (!t) return null;
    if (t > 100.4) return { label: "Febrile / High", color: "bg-rose-50 text-rose-700 border-rose-300" };
    if (t > 99.0) return { label: "Low Grade Fever", color: "bg-amber-50 text-amber-800 border-amber-300" };
    if (t >= 97.0) return { label: "Normal", color: "bg-emerald-50 text-emerald-800 border-emerald-300" };
    return { label: "Hypothermia", color: "bg-blue-50 text-blue-700 border-blue-300" };
  }, [watchedTemp]);

  const spo2Status = useMemo(() => {
    const s = Number(watchedSpo2);
    if (!s) return null;
    if (s < 90) return { label: "Hypoxia Alert", color: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse" };
    if (s < 95) return { label: "Borderline", color: "bg-amber-50 text-amber-800 border-amber-300" };
    return { label: "Normal", color: "bg-emerald-50 text-emerald-800 border-emerald-300" };
  }, [watchedSpo2]);

  const bmiData = useMemo(() => {
    const wt = parseFloat(watchedWeight);
    const ht = parseFloat(watchedHeight);
    if (!wt || !ht || wt <= 0 || ht <= 0) return null;
    const htInMeters = ht / 100;
    const bmiVal = (wt / (htInMeters * htInMeters)).toFixed(1);
    const num = Number(bmiVal);
    let category = "Normal";
    let color = "bg-emerald-50 text-emerald-800 border-emerald-300";
    if (num < 18.5) {
      category = "Underweight";
      color = "bg-blue-50 text-blue-700 border-blue-300";
    } else if (num >= 25 && num < 30) {
      category = "Overweight";
      color = "bg-amber-50 text-amber-800 border-amber-300";
    } else if (num >= 30) {
      category = "Obese";
      color = "bg-rose-50 text-rose-800 border-rose-300";
    }
    return { bmi: bmiVal, category, color };
  }, [watchedWeight, watchedHeight]);

  const appendVitalNote = (chipText) => {
    const current = watchedNotes || "";
    if (current.includes(chipText)) return;
    const separator = current.trim() ? " • " : "";
    setVitalValue("notes", `${current}${separator}${chipText}`);
  };

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

  // Patient Medication State & Dialog
  const [isMedicationOpen, setIsMedicationOpen] = useState(false);
  const [masterMedicines, setMasterMedicines] = useState([]);
  const [loadingMasterMedicines, setLoadingMasterMedicines] = useState(false);
  const [medicineSearchQuery, setMedicineSearchQuery] = useState("");
  const [selectedFormFilter, setSelectedFormFilter] = useState("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedMedicinesDraft, setSelectedMedicinesDraft] = useState([]);
  const [masterFrequencies, setMasterFrequencies] = useState([]);
  const [masterDurations, setMasterDurations] = useState([]);
  const [masterInstructions, setMasterInstructions] = useState([]);
  const [loadingMasterRegimens, setLoadingMasterRegimens] = useState(false);
  const [isSavingMedications, setIsSavingMedications] = useState(false);

  // Quick-entry input state for new medication
  const [newMed, setNewMed] = useState({
    medicineId: null,
    medicineName: "",
    genericName: "",
    dosageForm: "",
    frequency: "",
    duration: "",
    instruction: "",
    quantity: 1,
  });

  const [openMedSuggestions, setOpenMedSuggestions] = useState(false);
  const [openFreqSuggestions, setOpenFreqSuggestions] = useState(false);
  const [openDurSuggestions, setOpenDurSuggestions] = useState(false);
  const [openInstSuggestions, setOpenInstSuggestions] = useState(false);
  const [highlightedMedIndex, setHighlightedMedIndex] = useState(-1);
  const [highlightedFreqIndex, setHighlightedFreqIndex] = useState(-1);
  const [highlightedDurIndex, setHighlightedDurIndex] = useState(-1);
  const [highlightedInstIndex, setHighlightedInstIndex] = useState(-1);

  const medInputRef = useRef(null);
  const freqInputRef = useRef(null);
  const durInputRef = useRef(null);
  const instInputRef = useRef(null);

  const targetVisitId = activePatient?.visit_id || activePatient?.visitId || activePatient?.id || activePatient?.Id;

  useEffect(() => {
    fetchHeaderData();
    fetchPatientVitals();
    fetchMasterRegimens();
    fetchCurrentPrescription(targetVisitId, targetPatientId);
    fetchPatientSymptoms(currentPrescription?.id, targetPatientId, targetVisitId);
    fetchPatientExams(currentPrescription?.id, targetPatientId, targetVisitId);
    fetchPatientDiagnoses(currentPrescription?.id, targetPatientId, targetVisitId);
    fetchPatientInvestigations(currentPrescription?.id, targetPatientId, targetVisitId);
    fetchPatientMedications(currentPrescription?.id, targetPatientId, targetVisitId);
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

  const fetchPatientMedications = async (prescriptionId, patientId, visitId) => {
    try {
      if (!prescriptionId && !patientId && !visitId) return;
      const params = {};
      if (prescriptionId) params.prescriptionId = prescriptionId;
      else if (visitId) params.visitId = visitId;
      else if (patientId) params.patientId = patientId;

      const res = await opdMedicationService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      if (list.length > 0) {
        const mapped = list.map((item) => ({
          id: item.id,
          medicineId: item.medicineId,
          name: item.medicineName,
          genericName: item.genericName || "",
          dosageForm: item.dosageForm || "",
          dosage: item.dosage || "",
          frequency: item.frequency || item.dosage || "1-0-1",
          duration: item.duration || "5 Days",
          instruction: item.instruction || "After meals with water",
          quantity: item.quantity || 1,
        }));
        setMedicines(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch patient medications:", err);
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
        fetchPatientMedications(p.id, targetPatientId, targetVisitId);
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

  // 1. Fetch Previous Prescriptions (strictly excluding today's prescription)
  const fetchPreviousPrescriptions = async (patientId) => {
    try {
      setLoadingPrevPrescriptions(true);
      const params = { exclude_today: true };
      if (patientId) params.patientId = patientId;
      if (targetVisitId) params.excludeVisitId = targetVisitId;
      if (currentPrescription?.id) params.excludePrescriptionId = currentPrescription.id;

      const res = await opdPrescriptionService.getAll(params);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Additional frontend safeguard: strictly filter out today's prescriptions
      const now = new Date();
      const todayYMD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const filtered = list.filter((presc) => {
        if (currentPrescription?.id && presc.id === currentPrescription.id) return false;
        if (targetVisitId && presc.visitId === targetVisitId) return false;
        const pDate = presc.presc_date || presc.created_at;
        if (pDate) {
          const dateStr = typeof pDate === "string" ? pDate.substring(0, 10) : "";
          if (dateStr && dateStr >= todayYMD) return false;
        }
        return true;
      });

      setPreviousPrescriptions(filtered);
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
              ? (latest.blood_pressure || `${latest.systolic}/${latest.diastolic}`)
              : latest.systolic
              ? `${latest.systolic}`
              : null,
          pulse: latest.pulse_rate ? String(latest.pulse_rate) : null,
          temp: latest.temperature ? String(latest.temperature) : null,
          weight: latest.weight ? String(latest.weight) : null,
          spo2: latest.spo2 ? String(latest.spo2) : null,
          bsr: latest.bsr ? String(latest.bsr) : null,
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

      const formattedVitals = {
        bp:
          data.systolic || data.diastolic
            ? `${data.systolic || ""}/${data.diastolic || ""}`
            : data.blood_pressure || null,
        pulse: data.pulse_rate ? String(data.pulse_rate) : null,
        temp: data.temperature ? String(data.temperature) : null,
        weight: data.weight ? String(data.weight) : null,
        spo2: data.spo2 ? String(data.spo2) : null,
        bsr: data.bsr ? String(data.bsr) : null,
      };

      setVitals(formattedVitals);

      setMessage({
        type: "success",
        text: existingVitalId ? "Patient Vitals updated successfully!" : "Patient Vitals recorded successfully!",
      });
      setIsVitalsOpen(false);
      setDialogError(null);
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
      let pId = targetPatientId;
      if (!pId) {
        try {
          const patientsRes = await patientService.getAll().catch(() => ({ data: [] }));
          const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data?.data || [];
          if (patientsList.length > 0) {
            pId = patientsList[0].id;
          }
        } catch (e) {
          console.error("Failed to fetch fallback patient for history:", e);
        }
      }

      if (!pId) {
        setDialogError("Please select a patient first to record medical history.");
        return;
      }
      const payload = {
        ...data,
        patientId: pId,
      };
      const res = await opdHistoryService.create(payload);
      setPatientHistory(res.data || payload);
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
    if (current.includes(text)) return;
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

  const fetchMasterRegimens = async () => {
    try {
      setLoadingMasterRegimens(true);
      const [freqRes, durRes, instRes] = await Promise.all([
        masterFrequencyService.getAll({ isActive: true }),
        masterDurationService.getAll({ isActive: true }),
        masterInstructionService.getAll({ isActive: true }),
      ]);
      const rawFreq = Array.isArray(freqRes.data) ? freqRes.data : freqRes.data?.data || [];
      const rawDur = Array.isArray(durRes.data) ? durRes.data : durRes.data?.data || [];
      const rawInst = Array.isArray(instRes.data) ? instRes.data : instRes.data?.data || [];

      // Deduplicate by trimmed label
      const freqList = Array.from(new Map(rawFreq.filter((f) => f.frequency?.trim()).map((f) => [f.frequency.trim(), f])).values());
      const durList = Array.from(new Map(rawDur.filter((d) => d.duration?.trim()).map((d) => [d.duration.trim(), d])).values());
      const instList = Array.from(new Map(rawInst.filter((i) => i.instruction?.trim()).map((i) => [i.instruction.trim(), i])).values());

      setMasterFrequencies(freqList);
      setMasterDurations(durList);
      setMasterInstructions(instList);
    } catch (err) {
      console.error("Failed to fetch master prescription regimens:", err);
    } finally {
      setLoadingMasterRegimens(false);
    }
  };

  const fetchMasterMedicines = async () => {
    try {
      setLoadingMasterMedicines(true);
      const res = await pharmacyMedicineService.getAll();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMasterMedicines(list);
    } catch (err) {
      console.error("Failed to fetch pharmacy medicines:", err);
    } finally {
      setLoadingMasterMedicines(false);
    }
  };

  // Medication Dialog Handlers
  const handleOpenMedicationDialog = () => {
    setDialogError(null);
    setNewMed({
      medicineId: null,
      medicineName: "",
      genericName: "",
      dosageForm: "",
      frequency: "",
      duration: "",
      instruction: "",
      quantity: 1,
    });
    setOpenMedSuggestions(false);
    setOpenFreqSuggestions(false);
    setOpenDurSuggestions(false);
    setOpenInstSuggestions(false);
    setHighlightedMedIndex(-1);
    setHighlightedFreqIndex(-1);
    setHighlightedDurIndex(-1);
    setHighlightedInstIndex(-1);
    const drafts = medicines.map((item, idx) => ({
      id: item.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + idx)),
      medicineId: item.medicineId || null,
      name: item.name || item.brand_name || item.medicineName || "",
      genericName: item.genericName || item.generic_name || "",
      dosageForm: item.dosageForm || item.dosage_form_name || "",
      dosage: item.frequency || item.dosage || "1-0-1",
      frequency: item.frequency || item.dosage || "1-0-1",
      duration: item.duration || "5 Days",
      instruction: item.instruction || "After meals with water",
      quantity: item.quantity || 1,
    }));
    setSelectedMedicinesDraft(drafts);
    fetchMasterMedicines();
    fetchMasterRegimens();
    setIsMedicationOpen(true);
    setTimeout(() => medInputRef.current?.focus(), 150);
  };

  const handleSelectMedicine = (med) => {
    setNewMed((prev) => ({
      ...prev,
      medicineId: med.id,
      medicineName: med.brand_name,
      genericName: med.generic_name || "",
      dosageForm: med.dosage_form_name || "",
    }));
    setOpenMedSuggestions(false);
    setHighlightedMedIndex(-1);
    setTimeout(() => freqInputRef.current?.focus(), 50);
  };

  const handleSelectFrequency = (f) => {
    setNewMed((prev) => ({
      ...prev,
      frequency: f.frequency,
    }));
    setOpenFreqSuggestions(false);
    setHighlightedFreqIndex(-1);
    setTimeout(() => durInputRef.current?.focus(), 50);
  };

  const handleSelectDuration = (d) => {
    setNewMed((prev) => ({
      ...prev,
      duration: d.duration,
    }));
    setOpenDurSuggestions(false);
    setHighlightedDurIndex(-1);
    setTimeout(() => instInputRef.current?.focus(), 50);
  };

  const handleSelectInstruction = (inst) => {
    setNewMed((prev) => ({
      ...prev,
      instruction: inst.instruction,
    }));
    setOpenInstSuggestions(false);
    setHighlightedInstIndex(-1);
  };

  const handleAddMedicineToDraft = (e, overrideMed = null) => {
    if (e) e.preventDefault();
    const current = overrideMed || newMed;
    if (!current.medicineName?.trim()) return;

    const itemToAdd = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      medicineId: current.medicineId || null,
      name: current.medicineName.trim(),
      genericName: current.genericName || "",
      dosageForm: current.dosageForm || "",
      dosage: current.frequency?.trim() || "1-0-1",
      frequency: current.frequency?.trim() || "1-0-1",
      duration: current.duration?.trim() || "5 Days",
      instruction: current.instruction?.trim() || "After meals with water",
      quantity: 1,
    };

    setSelectedMedicinesDraft((prev) => [...prev, itemToAdd]);
    setNewMed({
      medicineId: null,
      medicineName: "",
      genericName: "",
      dosageForm: "",
      frequency: "",
      duration: "",
      instruction: "",
      quantity: 1,
    });
    setOpenMedSuggestions(false);
    setOpenFreqSuggestions(false);
    setOpenDurSuggestions(false);
    setOpenInstSuggestions(false);
    setHighlightedMedIndex(-1);
    setHighlightedFreqIndex(-1);
    setHighlightedDurIndex(-1);
    setHighlightedInstIndex(-1);
    setTimeout(() => medInputRef.current?.focus(), 50);
  };

  const handleRemoveMedicineDraft = (index) => {
    setSelectedMedicinesDraft((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveMedications = async () => {
    try {
      setIsSavingMedications(true);
      setDialogError(null);

      const targetPrescId = currentPrescription?.id;

      if (targetPrescId || targetPatientId || targetVisitId) {
        await opdMedicationService.sync({
          prescriptionId: targetPrescId || null,
          patientId: targetPatientId || null,
          visitId: targetVisitId || null,
          medications: selectedMedicinesDraft,
        });
      }

      setMedicines(selectedMedicinesDraft);
      setIsMedicationOpen(false);
      setMessage({
        type: "success",
        text: `${selectedMedicinesDraft.length} prescribed medication(s) saved and applied to prescription!`,
      });
    } catch (err) {
      console.error("Failed to save medications:", err);
      // Fallback: still update local state so doctor can print
      setMedicines(selectedMedicinesDraft);
      setIsMedicationOpen(false);
      setMessage({
        type: "success",
        text: `${selectedMedicinesDraft.length} prescribed medication(s) updated in prescription!`,
      });
    } finally {
      setIsSavingMedications(false);
    }
  };

  // Autocomplete Suggestions for Quick-Entry Inputs
  const filteredMedSuggestions = useMemo(() => {
    const q = (newMed.medicineName || "").toLowerCase().trim();
    if (!q) return masterMedicines.slice(0, 15);
    return masterMedicines.filter((med) => {
      const brand = (med.brand_name || "").toLowerCase();
      const generic = (med.generic_name || "").toLowerCase();
      const code = (med.item_code || "").toLowerCase();
      return brand.includes(q) || generic.includes(q) || code.includes(q);
    }).slice(0, 15);
  }, [masterMedicines, newMed.medicineName]);

  const filteredFreqSuggestions = useMemo(() => {
    const q = (newMed.frequency || "").toLowerCase().trim();
    if (!q) return masterFrequencies.slice(0, 12);
    return masterFrequencies.filter((f) =>
      (f.frequency || "").toLowerCase().includes(q)
    ).slice(0, 12);
  }, [masterFrequencies, newMed.frequency]);

  const filteredDurSuggestions = useMemo(() => {
    const q = (newMed.duration || "").toLowerCase().trim();
    if (!q) return masterDurations.slice(0, 12);
    return masterDurations.filter((d) =>
      (d.duration || "").toLowerCase().includes(q)
    ).slice(0, 12);
  }, [masterDurations, newMed.duration]);

  const filteredInstSuggestions = useMemo(() => {
    const q = (newMed.instruction || "").toLowerCase().trim();
    if (!q) return masterInstructions.slice(0, 12);
    return masterInstructions.filter((i) =>
      (i.instruction || "").toLowerCase().includes(q)
    ).slice(0, 12);
  }, [masterInstructions, newMed.instruction]);

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Prescription_${activePatient?.patient_name || "Patient"}_${activePatient?.tokenNo || "01"}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      @media print {
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .prescription-sheet {
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          min-height: 290mm !important;
          width: 210mm !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 8mm 10mm !important;
          background: white !important;
          border: none !important;
          box-shadow: none !important;
        }
        .prescription-sheet:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
      }
    `,
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

  // Dynamic Multi-Page Prescription Pagination Calculation based on actual pixel heights
  const prescriptionPages = useMemo(() => {
    // Printable A4 safe height budget in pixels:
    // 297mm = 1122.5px @ 96dpi. With 16mm vertical padding (60px) and safety buffer for doctor stamp,
    // 945px guarantees that the footer is ALWAYS 100% visible and the last item is never cut off.
    const PAGE_HEIGHT_BUDGET = 945;

    // 1. Header height
    const headerHeight = !showHeader ? (headerHeightMargin || 80) + 12 : 110;

    // 2. Patient Demographics Bar height
    const demographicsHeight = 65;

    // 3. Vitals Strip (if present)
    let vitalsHeight = 0;
    if (vitals && (vitals.bp || vitals.pulse || vitals.temp || vitals.weight || vitals.spo2 || vitals.bsr)) {
      vitalsHeight = 42;
    }

    // 4. Clinical Assessment Block (strictly mirrors actual rendered DOM lines)
    let assessmentHeight = 0;
    const hasSymptoms = Boolean(patientSymptoms && patientSymptoms.length > 0);
    const hasHistory = Boolean(
      patientHistory &&
        (patientHistory.past_medical_history ||
          patientHistory.past_surgical_history ||
          patientHistory.medication_history ||
          patientHistory.allergy_history ||
          patientHistory.family_history ||
          patientHistory.social_history)
    );
    const hasExams = Boolean(patientExams && patientExams.length > 0);
    const hasDiagnosis = Boolean((patientDiagnoses && patientDiagnoses.length > 0) || diagnosis);
    const hasInvestigations = Boolean((patientInvestigations && patientInvestigations.length > 0) || investigations);

    if (hasSymptoms || hasHistory || hasExams || hasDiagnosis || hasInvestigations) {
      assessmentHeight += 28; // Container padding & border

      // Row 1: Symptoms and Medical History (side-by-side grid)
      let symptomsH = 0;
      if (hasSymptoms) {
        const chipRows = Math.ceil(patientSymptoms.length / 4);
        symptomsH = 22 + (chipRows * 26);
      }

      let historyH = 0;
      if (hasHistory) {
        let lines = 0;
        if (patientHistory.medication_history) lines++;
        if (patientHistory.allergy_history) lines++;
        if (patientHistory.past_medical_history) lines++;
        if (patientHistory.past_surgical_history) lines++;
        if (patientHistory.family_history) lines++;
        if (patientHistory.social_history) lines++;
        historyH = 22 + (lines * 22);
      }
      assessmentHeight += Math.max(symptomsH, historyH);

      // Row 2: Physical Examination
      if (hasExams) {
        const examRows = Math.ceil(patientExams.length / 2);
        assessmentHeight += 12 + 20 + (examRows * 26);
      }

      // Row 3: Diagnoses and Investigations (side-by-side grid)
      let diagH = 0;
      if (hasDiagnosis) {
        const count = patientDiagnoses?.length || 1;
        const rows = Math.ceil(count / 3);
        diagH = 20 + (rows * 28);
      }

      let invH = 0;
      if (hasInvestigations) {
        const count = patientInvestigations?.length || 1;
        const rows = Math.ceil(count / 3);
        invH = 20 + (rows * 28);
      }

      if (hasDiagnosis || hasInvestigations) {
        assessmentHeight += 12 + Math.max(diagH, invH);
      }
    }

    // 5. Table Title & Header row overhead
    const tableHeaderOverhead = 70;

    // 6. Advice & Follow-Up box
    let adviceFollowupHeight = 0;
    if (advice || followupDate) {
      adviceFollowupHeight = 56;
    }

    // 7. Doctor Signature & Verification Footer
    const footerHeight = 85;

    // Accurate height per medication row (accounting for formula, title, padding, and borders)
    const getMedRowHeight = (med) => {
      let h = 38;
      if (med.genericName) h += 16;
      if (med.name && med.name.length > 26) h += 14;
      if (med.instruction && med.instruction.length > 30) h += 14;
      return h;
    };

    const totalMeds = medicines.length;

    // Calculate total height if all medications stay on Page 1 together with advice and footer
    const totalMedsHeight = medicines.reduce((sum, med) => sum + getMedRowHeight(med), 0);
    const singlePageTotalHeight =
      headerHeight +
      demographicsHeight +
      vitalsHeight +
      assessmentHeight +
      tableHeaderOverhead +
      totalMedsHeight +
      adviceFollowupHeight +
      footerHeight;

    // If total height fits comfortably within single page budget -> 1 PAGE ONLY!
    if (singlePageTotalHeight <= PAGE_HEIGHT_BUDGET || totalMeds <= 1) {
      return [
        {
          pageNumber: 1,
          totalPages: 1,
          meds: medicines,
          startIndex: 0,
          isFirst: true,
          isLast: true,
        },
      ];
    }

    // Multi-page pagination when content exceeds Page 1:
    // On Page 1, Advice and Follow-up are moved to the final page, freeing space for medications
    const page1Fixed = headerHeight + demographicsHeight + vitalsHeight + assessmentHeight + tableHeaderOverhead + footerHeight;
    const page1AvailForMeds = PAGE_HEIGHT_BUDGET - page1Fixed;

    let page1MedsCount = 0;
    let accumulatedH = 0;
    for (let i = 0; i < medicines.length; i++) {
      const medH = getMedRowHeight(medicines[i]);
      if (accumulatedH + medH <= page1AvailForMeds) {
        accumulatedH += medH;
        page1MedsCount++;
      } else {
        break;
      }
    }

    // Ensure Page 1 gets at least 1 medicine, but doesn't absorb all items
    page1MedsCount = Math.max(1, Math.min(page1MedsCount, totalMeds - 1));

    const pages = [];
    pages.push({
      pageNumber: 1,
      meds: medicines.slice(0, page1MedsCount),
      startIndex: 0,
      isFirst: true,
      isLast: false,
    });

    // Subsequent pages:
    // Header + Demographics + TableHeader + Footer (plus Advice & Followup on final page)
    let remainingMeds = medicines.slice(page1MedsCount);
    let currentPageNum = 2;
    let currentStartIndex = page1MedsCount;

    const subPageFixed = headerHeight + demographicsHeight + tableHeaderOverhead + adviceFollowupHeight + footerHeight;
    const subPageAvailForMeds = PAGE_HEIGHT_BUDGET - subPageFixed;

    while (remainingMeds.length > 0) {
      let pageMedsCount = 0;
      let subAccumH = 0;
      for (let i = 0; i < remainingMeds.length; i++) {
        const medH = getMedRowHeight(remainingMeds[i]);
        if (subAccumH + medH <= subPageAvailForMeds) {
          subAccumH += medH;
          pageMedsCount++;
        } else {
          break;
        }
      }
      pageMedsCount = Math.max(1, pageMedsCount);
      const chunk = remainingMeds.slice(0, pageMedsCount);
      remainingMeds = remainingMeds.slice(pageMedsCount);

      pages.push({
        pageNumber: currentPageNum,
        meds: chunk,
        startIndex: currentStartIndex,
        isFirst: false,
        isLast: remainingMeds.length === 0,
      });

      currentStartIndex += chunk.length;
      currentPageNum++;
    }

    const totalPages = pages.length;
    return pages.map((p) => ({ ...p, totalPages }));
  }, [
    medicines,
    vitals,
    patientSymptoms,
    patientHistory,
    patientExams,
    patientDiagnoses,
    diagnosis,
    patientInvestigations,
    investigations,
    advice,
    followupDate,
    showHeader,
    headerHeightMargin,
  ]);

  // Modular Prescription Render Helpers
  const renderPrescriptionHeader = (pageNumber = 1, totalPages = 1) => {
    if (!showHeader) {
      return (
        <div
          className="w-full shrink-0 border-b border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-400 font-mono mb-3 print:border-none"
          style={{ height: `${headerHeightMargin}px` }}
        >
          <span className="print:hidden">[ Blank Header Space: {headerHeightMargin}px ]</span>
          {totalPages > 1 && (
            <span className="text-xs font-mono text-slate-500 font-bold">
              Page {pageNumber} of {totalPages}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3 min-h-24">
        {/* Left: Hospital Info + Logo / Banner Image */}
        <div className="flex items-center gap-3.5 max-w-[62%]">
          {outputSettings?.headerImage ? (
            <Image
              src={getImageUrl(outputSettings.headerImage)}
              alt="Header Banner"
              width={400}
              height={80}
              className="h-18 w-auto object-contain shrink-0"
              unoptimized
            />
          ) : logoSrc ? (
            <Image
              src={getImageUrl(logoSrc)}
              alt="Hospital Logo"
              width={80}
              height={80}
              className="h-16 w-16 object-contain rounded-lg border border-slate-200 bg-white p-1 shrink-0"
              unoptimized
            />
          ) : (
            <div className="p-2.5 rounded-lg bg-slate-900 text-white font-bold text-xl shrink-0">HIMS</div>
          )}

          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 font-serif leading-tight">
              {hospitalName}
            </h2>
            <p className="text-xs text-slate-700 font-medium">{hospitalAddress}</p>
            <p className="text-xs text-slate-500 font-mono">
              Ph: {hospitalPhone} {hospitalEmail ? `| Email: ${hospitalEmail}` : ""}
            </p>
          </div>
        </div>

        {/* Right: Doctor Info + Page Indicator if multi-page */}
        <div className="text-right space-y-0.5">
          <h3 className="text-lg font-bold text-slate-950 leading-tight">{doctorName}</h3>
          <p className="text-sm font-bold text-teal-800">{doctorQualification}</p>
          <p className="text-sm font-medium text-slate-700">{doctorDept}</p>
          <p className="text-xs text-slate-500 font-mono">{doctorPmdc}</p>
          {totalPages > 1 && (
            <p className="text-xs font-mono text-teal-900 font-bold pt-0.5">
              Page {pageNumber} of {totalPages}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderPatientDemographics = (pageNumber = 1, totalPages = 1) => (
    <div className="border border-slate-300 rounded-md p-2.5 mb-3 bg-slate-50/50 text-xs shadow-2xs">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-4 border-r border-slate-200 pr-2">
          <div className="flex items-center gap-2">
            <p className="font-extrabold text-slate-950 text-sm tracking-tight">{patientName}</p>
            {pageNumber > 1 && (
              <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded border border-teal-300">
                Page {pageNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 font-medium">{guardianName}</p>
        </div>

        <div className="col-span-3 border-r border-slate-200 px-2 space-y-0.5">
          <p className="text-xs text-slate-700">
            MRN: <strong className="text-slate-950 font-mono font-bold">{patientMrn}</strong>
          </p>
          <p className="text-xs text-slate-700">
            Mobile: <strong className="text-slate-950 font-mono font-medium">{patientMobile}</strong>
          </p>
        </div>

        <div className="col-span-3 border-r border-slate-200 px-2 space-y-0.5">
          <p className="text-xs text-slate-700">
            Age / Sex: <strong className="text-slate-950 font-bold">{patientAge} / {patientGender}</strong>
          </p>
          <p className="text-xs text-slate-700">
            Visit No: <strong className="text-slate-950 font-mono font-bold">{visitNo}</strong>
          </p>
        </div>

        <div className="col-span-2 text-right pl-2 space-y-0.5">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Date:</p>
          <p className="text-slate-950 font-bold text-xs font-mono">{visitDate}</p>
        </div>
      </div>
    </div>
  );

  const renderVitalsStrip = () => {
    if (!vitals || (!vitals.bp && !vitals.pulse && !vitals.temp && !vitals.weight && !vitals.spo2 && !vitals.bsr)) {
      return null;
    }

    return (
      <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 mb-3 text-xs">
        <span className="font-bold text-slate-900 uppercase text-xs tracking-wider flex items-center gap-1 shrink-0">
          <Activity className="h-4 w-4 text-teal-700" />
          VITALS:
        </span>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-800">
          {vitals.bp && (
            <span>
              BP: <strong className="text-slate-950 font-bold font-mono">{String(vitals.bp).includes("mmHg") ? vitals.bp : `${vitals.bp} mmHg`}</strong>
            </span>
          )}
          {vitals.pulse && (
            <span>
              Pulse: <strong className="text-slate-950 font-bold font-mono">{String(vitals.pulse).includes("bpm") ? vitals.pulse : `${vitals.pulse} bpm`}</strong>
            </span>
          )}
          {vitals.temp && (
            <span>
              Temp: <strong className="text-slate-950 font-bold font-mono">{String(vitals.temp).includes("°F") ? vitals.temp : `${vitals.temp} °F`}</strong>
            </span>
          )}
          {vitals.weight && (
            <span>
              Weight: <strong className="text-slate-950 font-bold font-mono">{String(vitals.weight).includes("kg") ? vitals.weight : `${vitals.weight} kg`}</strong>
            </span>
          )}
          {vitals.spo2 && (
            <span>
              SpO2: <strong className="text-slate-950 font-bold font-mono">{String(vitals.spo2).includes("%") ? vitals.spo2 : `${vitals.spo2}%`}</strong>
            </span>
          )}
          {vitals.bsr && (
            <span>
              BSR: <strong className="text-slate-950 font-bold font-mono">{String(vitals.bsr).includes("mg/dL") ? vitals.bsr : `${vitals.bsr} mg/dL`}</strong>
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderClinicalAssessment = () => {
    const hasAnyAssessment =
      (patientSymptoms && patientSymptoms.length > 0) ||
      (patientExams && patientExams.length > 0) ||
      (patientDiagnoses && patientDiagnoses.length > 0) ||
      diagnosis ||
      (patientInvestigations && patientInvestigations.length > 0) ||
      investigations ||
      (patientHistory && (
        patientHistory.past_medical_history ||
        patientHistory.past_surgical_history ||
        patientHistory.medication_history ||
        patientHistory.allergy_history ||
        patientHistory.family_history ||
        patientHistory.social_history
      ));

    if (!hasAnyAssessment) return null;

    return (
      <div className="border border-slate-200 rounded-lg p-3 mb-3 bg-white space-y-2.5 shadow-2xs">
        {/* Row 1: Symptoms & History */}
        {((patientSymptoms && patientSymptoms.length > 0) || (patientHistory && (
          patientHistory.past_medical_history ||
          patientHistory.past_surgical_history ||
          patientHistory.medication_history ||
          patientHistory.allergy_history ||
          patientHistory.family_history ||
          patientHistory.social_history
        ))) && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
            {patientSymptoms && patientSymptoms.length > 0 && (
              <div className={(patientHistory && (
                patientHistory.past_medical_history ||
                patientHistory.past_surgical_history ||
                patientHistory.medication_history ||
                patientHistory.allergy_history ||
                patientHistory.family_history ||
                patientHistory.social_history
              )) ? "md:col-span-6 space-y-1" : "md:col-span-12 space-y-1"}>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Presenting Symptoms:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patientSymptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50/80 border border-amber-200 text-amber-950 font-medium text-xs"
                    >
                      • {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patientHistory && (
              patientHistory.past_medical_history ||
              patientHistory.past_surgical_history ||
              patientHistory.medication_history ||
              patientHistory.allergy_history ||
              patientHistory.family_history ||
              patientHistory.social_history
            ) && (
              <div className={(patientSymptoms && patientSymptoms.length > 0) ? "md:col-span-6 space-y-1" : "md:col-span-12 space-y-1"}>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                  Patient Medical History:
                </span>
                <div className="text-xs text-slate-700 space-y-0.5">
                  {patientHistory.medication_history && (
                    <p><strong className="text-slate-900">Medications:</strong> {patientHistory.medication_history}</p>
                  )}
                  {patientHistory.allergy_history && (
                    <p className="text-rose-700"><strong className="text-rose-900">Allergies:</strong> {patientHistory.allergy_history}</p>
                  )}
                  {patientHistory.past_medical_history && (
                    <p><strong className="text-slate-900">Medical:</strong> {patientHistory.past_medical_history}</p>
                  )}
                  {patientHistory.past_surgical_history && (
                    <p><strong className="text-slate-900">Surgical:</strong> {patientHistory.past_surgical_history}</p>
                  )}
                  {patientHistory.family_history && (
                    <p><strong className="text-slate-900">Family:</strong> {patientHistory.family_history}</p>
                  )}
                  {patientHistory.social_history && (
                    <p><strong className="text-slate-900">Social:</strong> {patientHistory.social_history}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Row 2: Physical Examination */}
        {patientExams && patientExams.length > 0 && (
          <div className="border-t border-slate-100 pt-2 text-xs space-y-1">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
              Physical Examination Findings:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {patientExams.map((exam, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs"
                >
                  • {exam}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Row 3: Diagnosis & Ordered Investigations (Clinical Impression) */}
        {(((patientDiagnoses && patientDiagnoses.length > 0) || diagnosis) || ((patientInvestigations && patientInvestigations.length > 0) || investigations)) && (
          <div className="border-t border-slate-100 pt-2 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-start">
            {/* Diagnosis */}
            {((patientDiagnoses && patientDiagnoses.length > 0) || diagnosis) && (
              <div className="md:col-span-6 space-y-1">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-teal-700" />
                  Diagnosis / Clinical Impression:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patientDiagnoses && patientDiagnoses.length > 0 ? (
                    patientDiagnoses.map((diag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-300 text-teal-950 font-bold text-xs shadow-2xs"
                      >
                        ✓ {diag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-bold text-teal-950 bg-teal-50 px-2 py-0.5 rounded border border-teal-300">
                      {diagnosis}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Investigations */}
            {((patientInvestigations && patientInvestigations.length > 0) || investigations) && (
              <div className="md:col-span-6 space-y-1">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <TestTube className="h-3.5 w-3.5 text-amber-700" />
                  Investigations Ordered:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {patientInvestigations && patientInvestigations.length > 0 ? (
                    patientInvestigations.map((inv, idx) => {
                      const invName = typeof inv === "string" ? inv : (inv.serviceName || inv.name);
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded bg-amber-50/70 border border-amber-300 text-slate-900 font-bold text-xs font-mono"
                        >
                          • {invName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 font-mono">
                      {investigations}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMedicationsTable = (pageMeds = [], startIndex = 0, isContinuation = false) => (
    <div className="space-y-1.5 mb-3">
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5">
        <div className="flex items-center gap-1.5 text-slate-950">
          <span className="text-2xl font-serif font-black italic text-teal-800 leading-none">℞</span>
          <span className="text-sm font-black uppercase tracking-wider ml-1">
            {isContinuation ? "Prescribed Medications (Continued)" : "Prescribed Medications"}
          </span>
        </div>
        {medicines.length > 0 && (
          <span className="text-xs font-mono text-slate-600 font-semibold">
            {isContinuation ? `Items ${startIndex + 1}–${startIndex + pageMeds.length} of ${medicines.length}` : `Total: ${medicines.length} Item(s)`}
          </span>
        )}
      </div>

      <div className="border border-slate-300 rounded-md overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-200 border-b border-slate-300 font-bold text-xs uppercase tracking-wider">
              <th className="py-1.5 px-2.5 text-center w-10 border-r border-slate-700">#</th>
              <th className="py-1.5 px-3 text-left border-r border-slate-700">Medicine / Formulation</th>
              <th className="py-1.5 px-2.5 text-center w-32 border-r border-slate-700">Frequency</th>
              <th className="py-1.5 px-2.5 text-center w-28 border-r border-slate-700">Duration</th>
              <th className="py-1.5 px-3 text-left">Instructions</th>
            </tr>
          </thead>
          <tbody>
            {pageMeds.length > 0 ? (
              pageMeds.map((med, idx) => (
                <tr key={med.id || idx} className="border-b border-slate-200 odd:bg-white even:bg-slate-50/70 hover:bg-teal-50/20">
                  <td className="py-2 px-2.5 text-center border-r border-slate-200 font-bold text-slate-700 font-mono text-xs">
                    {startIndex + idx + 1}
                  </td>
                  <td className="py-2 px-3 text-left border-r border-slate-200">
                    <div className="font-bold text-slate-950 text-sm flex items-center gap-2 flex-wrap">
                      <span>{med.name}</span>
                      {med.dosageForm && (
                        <span className="text-xs text-slate-700 font-semibold border border-slate-200 bg-slate-100 px-1.5 py-0.5 rounded">
                          {med.dosageForm}
                        </span>
                      )}
                    </div>
                    {med.genericName && (
                      <div className="text-xs text-slate-500 font-normal mt-0.5">
                        Formula: {med.genericName}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-center border-r border-slate-200">
                    <span className="font-mono font-bold text-teal-950 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded text-xs inline-block shadow-2xs" dir="auto">
                      {med.frequency || med.dosage}
                    </span>
                  </td>
                  <td className="py-2 px-2.5 text-center border-r border-slate-200 font-bold text-xs text-slate-900" dir="auto">
                    {med.duration}
                  </td>
                  <td className="py-2 px-3 text-left text-slate-800 font-medium text-xs" dir="auto">
                    {med.instruction}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 italic text-sm">
                  No medicines prescribed for this visit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdviceAndFollowup = () => {
    if (!advice && !followupDate) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-t border-slate-200 pt-3 text-sm">
        {advice && (
          <div className={`${followupDate ? "sm:col-span-8" : "sm:col-span-12"} border-l-4 border-teal-600 bg-slate-50 p-2.5 rounded-r-md`}>
            <span className="font-bold text-slate-900 uppercase text-xs tracking-wider block mb-1">
              Advice & Special Instructions:
            </span>
            <p className="text-slate-800 font-medium leading-relaxed text-xs sm:text-sm">{advice}</p>
          </div>
        )}

        {followupDate && (
          <div className={`${advice ? "sm:col-span-4" : "sm:col-span-12"} bg-teal-50/70 border border-teal-200 p-2.5 rounded-md text-right flex flex-col justify-center`}>
            <span className="font-bold text-teal-950 uppercase text-xs tracking-wider block mb-0.5">
              Next Review / Follow-Up:
            </span>
            <p className="font-black text-teal-950 text-sm font-mono">{followupDate}</p>
          </div>
        )}
      </div>
    );
  };

  const renderDoctorSignatureFooter = (pageNumber = 1, totalPages = 1, isLast = true) => (
    <div className="pt-4 border-t border-slate-200 mt-4 flex items-end justify-between text-xs">
      <div className="space-y-0.5">
        <p className="text-slate-600 text-xs font-mono">
          Printed: {new Date().toLocaleDateString("en-GB")}{" "}
          {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          {totalPages > 1 && ` • Page ${pageNumber} of ${totalPages}`}
        </p>
        <p className="text-[11px] text-slate-500">
          Electronic Medical Record • Valid without physical stamp if digitally authorized
        </p>
      </div>

      <div className="text-center space-y-0.5 min-w-48">
        <div className="w-48 border-b border-slate-400 mb-1.5 mx-auto"></div>
        {doctorStamp ? (
          <p className="text-sm text-slate-950 font-bold whitespace-pre-line leading-tight">{doctorStamp}</p>
        ) : (
          <>
            <p className="font-bold text-slate-950 text-sm">{doctorName}</p>
            <p className="text-slate-600 text-xs">Consultant Physician / Authorized Signature</p>
          </>
        )}
      </div>
    </div>
  );

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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 bg-white border rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Pill className="h-6 w-6 text-teal-600" />
            OPD Prescription
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activePatient ? (
              <>
                Prescription encounter for token <strong className="text-slate-900 font-bold">#{String(tokenNo).padStart(2, "0")}</strong> - {patientName}
              </>
            ) : (
              "Prescription encounter (Select a patient from OPD queue or search to begin)"
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleOpenVitalsDialog}
            size="sm"
            variant="outline"
            className="h-9 text-sm border-teal-300 text-teal-900 hover:bg-teal-50 font-semibold px-3"
          >
            <Activity className="h-4 w-4 mr-1.5 text-teal-600" />
            Vitals
          </Button>

          <Button
            onClick={handleOpenHistoryDialog}
            size="sm"
            variant="outline"
            className="h-9 text-sm border-blue-300 text-blue-900 hover:bg-blue-50 font-semibold px-3 relative"
          >
            <FileText className="h-4 w-4 mr-1.5 text-blue-600" />
            History
            {patientHistory && (
              <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-blue-600" title="History recorded" />
            )}
          </Button>

          <Button
            onClick={handleOpenSymptomsDialog}
            size="sm"
            variant="outline"
            className="h-9 text-sm border-amber-300 text-amber-950 hover:bg-amber-50 font-semibold px-3 relative"
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-amber-600" />
            Symptoms
            {patientSymptoms && patientSymptoms.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-2 py-0.5 text-xs bg-amber-100 text-amber-900 border-amber-300 font-bold">
                {patientSymptoms.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleOpenExamDialog}
            size="sm"
            variant="outline"
            className="h-9 text-sm border-blue-300 text-blue-950 hover:bg-blue-50 font-semibold px-3 relative"
          >
            <Stethoscope className="h-4 w-4 mr-1.5 text-blue-600" />
            Examination
            {patientExams && patientExams.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-2 py-0.5 text-xs bg-blue-100 text-blue-900 border-blue-300 font-bold">
                {patientExams.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleOpenDiagnosisDialog}
            size="sm"
            variant="outline"
            className="h-9 text-sm border-teal-300 text-teal-950 hover:bg-teal-50 font-semibold px-3 relative"
          >
            <Brain className="h-4 w-4 mr-1.5 text-teal-600" />
            Diagnosis
            {patientDiagnoses && patientDiagnoses.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-2 py-0.5 text-xs bg-teal-100 text-teal-900 border-teal-300 font-bold">
                {patientDiagnoses.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleOpenInvestigationDialog}
            size="sm"
            variant="outline"
            className="h-9 text-sm border-amber-300 text-amber-950 hover:bg-amber-50 font-semibold px-3 relative"
          >
            <TestTube className="h-4 w-4 mr-1.5 text-amber-600" />
            Investigations
            {patientInvestigations && patientInvestigations.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-2 py-0.5 text-xs bg-amber-100 text-amber-900 border-amber-300 font-bold">
                {patientInvestigations.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handleOpenMedicationDialog}
            size="sm"
            variant="outline"
            className="h-9 text-sm border-emerald-400 text-emerald-950 hover:bg-emerald-50 font-bold px-3.5 relative shadow-2xs"
          >
            <Pill className="h-4 w-4 mr-1.5 text-emerald-600" />
            Medication
            {medicines && medicines.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-2 py-0.5 text-xs bg-emerald-100 text-emerald-900 border-emerald-300 font-bold">
                {medicines.length}
              </Badge>
            )}
          </Button>

          <Button
            onClick={handlePrint}
            size="sm"
            className="h-9 text-sm bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 ml-1 shadow-2xs"
          >
            <Printer className="h-4 w-4 mr-1.5" />
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
            <CardHeader className="p-4 border-b bg-slate-50/70 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-teal-500/10 text-teal-700">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Previous Prescriptions History
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Copy previous medications & advice into todays prescription
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2.5 text-slate-600 hover:text-teal-700 font-medium"
                onClick={() => fetchPreviousPrescriptions(targetPatientId)}
                disabled={loadingPrevPrescriptions}
                title="Refresh Prescriptions"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPrevPrescriptions ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPrevPrescriptions ? (
                <div className="p-6 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
                  Loading prescriptions history...
                </div>
              ) : previousPrescriptions.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  <FileText className="h-7 w-7 text-slate-300 mx-auto mb-1.5 stroke-[1.5]" />
                  No previous prescriptions found for this patient.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  <Table className="text-sm">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="h-8 text-xs font-bold text-slate-700">Prescription #</TableHead>
                        <TableHead className="h-8 text-xs font-bold text-slate-700">Date</TableHead>
                        <TableHead className="h-8 text-xs font-bold text-slate-700">Doctor</TableHead>
                        <TableHead className="h-8 text-xs font-bold text-slate-700 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousPrescriptions.map((presc) => (
                        <TableRow key={presc.id} className="hover:bg-slate-50/80">
                          <TableCell className="py-2.5 font-mono font-bold text-slate-900 text-xs">
                            {presc.prescriptionNo}
                          </TableCell>
                          <TableCell className="py-2.5 text-slate-700 text-xs">
                            {formatDate(presc.presc_date || presc.created_at)}
                          </TableCell>
                          <TableCell className="py-2.5 text-slate-800 text-xs truncate max-w-25 font-medium">
                            {presc.doctorName || presc.doctor?.Name || "Consultant"}
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyPrescription(presc)}
                              className="h-7 text-xs px-2.5 bg-teal-50 border-teal-200 text-teal-900 hover:bg-teal-100 font-bold gap-1"
                              title="Copy to Today's Prescription"
                            >
                              <Copy className="h-3 w-3" />
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
            <CardHeader className="p-4 border-b bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-blue-500/10 text-blue-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Prescription Advice & Follow-Up Date
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Doctors precautions, diet advice, and review schedule
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Advice Input Field */}
              <div className="space-y-1.5">
                <Label htmlFor="advice-input" className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>Special Advice & Precautions:</span>
                </Label>
                <Textarea
                  id="advice-input"
                  rows={3}
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="Enter diet, precautions, and instructions for the patient..."
                  className="text-sm font-medium resize-none"
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
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 text-slate-700 font-medium rounded-md border border-slate-200 transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up Date Field */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <Label htmlFor="followup-input" className="text-sm font-bold text-slate-800">
                  Next Review / Follow-Up Appointment:
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <Input
                    id="followup-input"
                    type="date"
                    value={rawFollowupDate}
                    onChange={handleManualFollowupDateChange}
                    className="h-9 text-sm font-medium"
                  />
                  <span className="text-sm font-bold text-teal-900 truncate bg-teal-50/90 px-3 py-2 rounded-md border border-teal-200">
                    {followupDate}
                  </span>
                </div>

                {/* Quick Follow-up Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { days: 3, label: "After 3 Days" },
                    { days: 5, label: "After 5 Days" },
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
                      className="h-7 text-xs px-2.5 font-semibold bg-blue-50/50 text-blue-950 border-blue-200 hover:bg-blue-100"
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
            <CardHeader className="p-4 border-b bg-slate-50/70 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-700">
                  <FlaskConical className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Previous Laboratory Results
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select a case to inspect test names & print full results
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2.5 text-slate-600 hover:text-amber-700 font-medium"
                onClick={() => fetchPreviousLabCases(targetPatientId, targetPatientMrn)}
                disabled={loadingPrevLabCases}
                title="Refresh Lab Results"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingPrevLabCases ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPrevLabCases ? (
                <div className="p-6 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />
                  Loading laboratory results...
                </div>
              ) : previousLabCases.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  <FlaskConical className="h-7 w-7 text-slate-300 mx-auto mb-1.5 stroke-[1.5]" />
                  No previous laboratory cases found for this patient.
                </div>
              ) : (
                <div>
                  {/* Master Cases Table */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border-b border-slate-100">
                    <Table className="text-sm">
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="h-8 text-xs font-bold text-slate-700">Case No</TableHead>
                          <TableHead className="h-8 text-xs font-bold text-slate-700">Case Date</TableHead>
                          <TableHead className="h-8 text-xs font-bold text-slate-700">Referred By</TableHead>
                          <TableHead className="h-8 text-xs font-bold text-slate-700 text-right">Action</TableHead>
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
                              <TableCell className="py-2.5 text-xs">
                                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                                  {isSelected ? (
                                    <ChevronDown className="h-4 w-4 text-amber-600" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                  )}
                                  <span>{c.caseNo}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 text-slate-700 text-xs font-medium">
                                {formatDate(c.caseDate || c.created_at)}
                              </TableCell>
                              <TableCell className="py-2.5 text-slate-800 text-xs truncate max-w-27 font-medium">
                                {c.orReffBy || c.doctor_name || "Self"}
                              </TableCell>
                              <TableCell className="py-2.5 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintLabReport(c);
                                  }}
                                  className="h-7 text-xs px-2.5 border-amber-300 text-amber-950 bg-amber-50 hover:bg-amber-100 font-bold gap-1"
                                  title="Print / View Lab Report"
                                >
                                  <Printer className="h-3 w-3" />
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
                    <div className="p-3.5 bg-amber-50/50">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                          <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
                          Tests in Case #{selectedCase.caseNo} ({selectedCase.tests?.length || 0})
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrintLabReport(selectedCase)}
                          className="h-6 text-xs px-2 text-amber-900 hover:text-amber-950 font-bold hover:bg-amber-100"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Full Report
                        </Button>
                      </div>

                      {selectedCase.tests && selectedCase.tests.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedCase.tests.map((test, tIdx) => (
                            <div
                              key={test.id || tIdx}
                              className="flex items-center justify-between p-2 rounded-md bg-white border border-amber-200/80 text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-400 font-bold text-xs w-4">
                                  {tIdx + 1}.
                                </span>
                                <span className="font-bold text-slate-900">
                                  {test.testName || "Laboratory Test"}
                                </span>
                                {test.testCode && (
                                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                                    {test.testCode}
                                  </span>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  test.isApproved
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 text-xs px-2 py-0.5 font-semibold"
                                    : test.isPerformed
                                    ? "bg-blue-50 text-blue-800 border-blue-300 text-xs px-2 py-0.5 font-semibold"
                                    : "bg-slate-100 text-slate-700 border-slate-300 text-xs px-2 py-0.5 font-medium"
                                }
                              >
                                {test.isApproved ? "Approved" : test.isPerformed ? "Performed" : "Pending"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic p-1">No test records registered for this case.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side (7 Columns): Current A4 Prescription Report Live Preview */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-100/80 p-4 sm:p-6 rounded-xl overflow-x-auto shadow-inner">
          <div ref={contentRef} className="w-full flex flex-col items-center space-y-8 print:space-y-0">
            {prescriptionPages.map((page) => (
              <div key={page.pageNumber} className="w-full flex flex-col items-center">
                {/* On-screen visual sheet header badge (hidden in print) */}
                {prescriptionPages.length > 1 && (
                  <div className="w-[210mm] flex items-center justify-between pb-2 px-2 text-xs font-semibold text-slate-600 print:hidden">
                    <span className="flex items-center gap-1.5 font-bold">
                      <FileText className="h-4 w-4 text-teal-600" />
                      Prescription Sheet {page.pageNumber} of {page.totalPages}{" "}
                      <span className="text-slate-500 font-normal">
                        {page.isFirst ? "(Initial Assessment & Rx)" : "(Medications Continuation)"}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded border border-slate-300">
                      {page.meds.length} medication(s) on this page
                    </span>
                  </div>
                )}

                {/* Individual A4 Page Container */}
                <div
                  className="prescription-sheet w-[210mm] min-h-[297mm] bg-white border border-slate-300 shadow-md p-8 flex flex-col justify-between text-slate-800 text-sm print:w-[210mm] print:min-h-[297mm] print:shadow-none print:p-6 print:m-0 print:border-none shrink-0"
                  style={{ width: "210mm", minHeight: "297mm", fontFamily: outputSettings?.textFont || "Inter, Arial, sans-serif" }}
                >
                  {/* Top & Body Section */}
                  <div className="space-y-3">
                    {/* 1. Header (Repeats on every page) */}
                    {renderPrescriptionHeader(page.pageNumber, page.totalPages)}

                    {/* 2. Patient Demographics Bar (Repeats on every page) */}
                    {renderPatientDemographics(page.pageNumber, page.totalPages)}

                    {/* 3. Vitals Strip (Page 1 Only) */}
                    {page.isFirst && renderVitalsStrip()}

                    {/* 4. Unified Clinical Assessment (Page 1 Only) */}
                    {page.isFirst && renderClinicalAssessment()}

                    {/* 5. ℞ Prescribed Medications Table (Shifted batch for this page) */}
                    {renderMedicationsTable(page.meds, page.startIndex, !page.isFirst)}

                    {/* 6. Advice & Follow-Up (Final Page Only) */}
                    {page.isLast && renderAdviceAndFollowup()}
                  </div>

                  {/* 7. Doctor Signature & Verification Footer */}
                  <div className="shrink-0 pt-2 print:pt-4">
                    {renderDoctorSignatureFooter(page.pageNumber, page.totalPages, page.isLast)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Vitals Dialog Modal (ui-ux-pro-max) */}
      <Dialog open={isVitalsOpen} onOpenChange={(open) => { setIsVitalsOpen(open); if (!open) setDialogError(null); }}>
        <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* 1. Dialog Header with Clear Spacing (No 'X' collision) */}
          <DialogHeader className="p-4 sm:p-5 border-b bg-slate-50/90 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <Activity className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      {existingVitalId ? "Update Patient Vital Signs" : "Record Patient Vital Signs"}
                    </DialogTitle>
                    <Badge
                      variant="outline"
                      className={
                        existingVitalId
                          ? "bg-amber-50 text-amber-900 border-amber-300 font-mono text-[11px] px-2.5 py-0.5 font-bold"
                          : "bg-teal-50 text-teal-900 border-teal-300 font-mono text-[11px] px-2.5 py-0.5 font-bold"
                      }
                    >
                      {existingVitalId ? "UPDATE MODE" : "NEW RECORD"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cardiovascular hemodynamics, respiratory triage, and anthropometric metrics
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {dialogError && (
            <div className="px-5 pt-3">
              <Alert className="bg-red-50 text-red-900 border-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">{dialogError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* 2. Scrollable Form Body with Categorized Panels */}
          <form onSubmit={handleSubmitVital(onSaveVitals)} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Panel 1: Cardiovascular & Hemodynamics */}
            <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-600" />
                  Cardiovascular & Hemodynamics
                </span>
                <div className="flex items-center gap-1.5">
                  {bpStatus && (
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 font-bold ${bpStatus.color}`}>
                      BP: {bpStatus.label}
                    </Badge>
                  )}
                  {pulseStatus && (
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 font-bold ${pulseStatus.color}`}>
                      Pulse: {pulseStatus.label}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Systolic BP */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Systolic BP</Label>
                  <div className="relative">
                    <Input
                      placeholder="120"
                      {...registerVital("systolic")}
                      className="h-10 text-sm font-medium bg-white pr-14 focus-visible:ring-rose-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      mmHg
                    </span>
                  </div>
                  {vitalErrors.systolic && <p className="text-xs text-destructive mt-0.5">{vitalErrors.systolic.message}</p>}
                </div>

                {/* Diastolic BP */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Diastolic BP</Label>
                  <div className="relative">
                    <Input
                      placeholder="80"
                      {...registerVital("diastolic")}
                      className="h-10 text-sm font-medium bg-white pr-14 focus-visible:ring-rose-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      mmHg
                    </span>
                  </div>
                  {vitalErrors.diastolic && <p className="text-xs text-destructive mt-0.5">{vitalErrors.diastolic.message}</p>}
                </div>

                {/* Pulse Rate */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Pulse Rate</Label>
                  <div className="relative">
                    <Input
                      placeholder="76"
                      {...registerVital("pulse_rate")}
                      className="h-10 text-sm font-medium bg-white pr-12 focus-visible:ring-rose-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      bpm
                    </span>
                  </div>
                  {vitalErrors.pulse_rate && <p className="text-xs text-destructive mt-0.5">{vitalErrors.pulse_rate.message}</p>}
                </div>
              </div>
            </div>

            {/* Panel 2: Respiratory, Oxygenation & Temperature */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/20 p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-blue-600" />
                  Respiratory & Temperature
                </span>
                <div className="flex items-center gap-1.5">
                  {tempStatus && (
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 font-bold ${tempStatus.color}`}>
                      Temp: {tempStatus.label}
                    </Badge>
                  )}
                  {spo2Status && (
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 font-bold ${spo2Status.color}`}>
                      SpO2: {spo2Status.label}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Temperature */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Temperature</Label>
                  <div className="relative">
                    <Input
                      placeholder="98.6"
                      {...registerVital("temperature")}
                      className="h-10 text-sm font-medium bg-white pr-10 focus-visible:ring-blue-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      °F
                    </span>
                  </div>
                  {vitalErrors.temperature && <p className="text-xs text-destructive mt-0.5">{vitalErrors.temperature.message}</p>}
                </div>

                {/* Respiratory Rate */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Respiratory Rate</Label>
                  <div className="relative">
                    <Input
                      placeholder="18"
                      {...registerVital("respiratory_rate")}
                      className="h-10 text-sm font-medium bg-white pr-14 focus-visible:ring-blue-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      /min
                    </span>
                  </div>
                  {vitalErrors.respiratory_rate && <p className="text-xs text-destructive mt-0.5">{vitalErrors.respiratory_rate.message}</p>}
                </div>

                {/* SpO2 */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">SpO2 (Oxygen)</Label>
                  <div className="relative">
                    <Input
                      placeholder="98"
                      {...registerVital("spo2")}
                      className="h-10 text-sm font-medium bg-white pr-8 focus-visible:ring-blue-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      %
                    </span>
                  </div>
                  {vitalErrors.spo2 && <p className="text-xs text-destructive mt-0.5">{vitalErrors.spo2.message}</p>}
                </div>
              </div>
            </div>

            {/* Panel 3: Anthropometry, BMI & Blood Glucose */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-4 w-4 text-emerald-600" />
                  Anthropometry & Blood Glucose
                </span>
                {bmiData ? (
                  <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold ${bmiData.color}`}>
                    BMI: {bmiData.bmi} kg/m² ({bmiData.category})
                  </Badge>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">BMI calculated automatically</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
                {/* Weight */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Weight</Label>
                  <div className="relative">
                    <Input
                      placeholder="68.5"
                      {...registerVital("weight")}
                      className="h-10 text-sm font-medium bg-white pr-10 focus-visible:ring-emerald-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      kg
                    </span>
                  </div>
                  {vitalErrors.weight && <p className="text-xs text-destructive mt-0.5">{vitalErrors.weight.message}</p>}
                </div>

                {/* Height */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Height</Label>
                  <div className="relative">
                    <Input
                      placeholder="172.5"
                      {...registerVital("height")}
                      className="h-10 text-sm font-medium bg-white pr-10 focus-visible:ring-emerald-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      cm
                    </span>
                  </div>
                  {vitalErrors.height && <p className="text-xs text-destructive mt-0.5">{vitalErrors.height.message}</p>}
                </div>

                {/* Calculated BMI Display */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Body Mass Index</Label>
                  <div className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-900 font-bold">{bmiData ? `${bmiData.bmi} kg/m²` : "—"}</span>
                    <span className="text-[10px] text-slate-500 font-sans font-medium">
                      {bmiData ? bmiData.category : "Auto (Wt/Ht)"}
                    </span>
                  </div>
                </div>

                {/* BSR */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">BSR (Blood Sugar)</Label>
                  <div className="relative">
                    <Input
                      placeholder="110"
                      {...registerVital("bsr")}
                      className="h-10 text-sm font-medium bg-white pr-14 focus-visible:ring-emerald-500 border-slate-200"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono pointer-events-none">
                      mg/dL
                    </span>
                  </div>
                  {vitalErrors.bsr && <p className="text-xs text-destructive mt-0.5">{vitalErrors.bsr.message}</p>}
                </div>
              </div>
            </div>

            {/* Panel 4: Notes & Context with Quick Suggestion Chips */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  Clinical Remarks & Observations
                </Label>
                <span className="text-[11px] text-slate-400">Optional notes</span>
              </div>

              <Textarea
                placeholder="e.g. Patient was resting 10 mins prior to measurement; sitting posture, right arm..."
                {...registerVital("notes")}
                className="text-sm min-h-[64px] border-slate-200 focus-visible:ring-teal-500"
              />

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Quick chips:</span>
                {[
                  "Resting (5 mins)",
                  "Sitting, right arm",
                  "Fasting measurement",
                  "Post-prandial / after meal",
                  "Repeat reading verified",
                  "Patient asymptomatic",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => appendVitalNote(chip)}
                    className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-slate-400" />
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Dialog Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
              {existingVitalId ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteVitals}
                  className="h-9 text-xs sm:text-sm px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Remove Vitals
                </Button>
              ) : (
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  Real-time hemodynamic & BMI calculations active
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVitalsOpen(false)}
                  size="sm"
                  className="h-9 text-xs sm:text-sm px-4 border-slate-200 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingVital}
                  size="sm"
                  className={
                    existingVitalId
                      ? "h-9 text-xs sm:text-sm px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-sm"
                      : "h-9 text-xs sm:text-sm px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer shadow-sm"
                  }
                >
                  {isSubmittingVital ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      {existingVitalId ? "Update Vitals Record" : "Save Vitals Record"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Medical History Modal (ui-ux-pro-max) */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* 1. Elevated Dialog Header with Unobstructed 'X' Spacing */}
          <DialogHeader className="p-4 sm:p-5 border-b bg-slate-50/90 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      Patient Medical & Health History
                    </DialogTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300 font-mono text-[11px] px-2.5 py-0.5 font-bold">
                      LONGITUDINAL EMR
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Continuous medical profile for <strong className="text-slate-900 font-bold">{patientName}</strong> • MRN: <strong className="text-slate-950 font-mono font-bold">{patientMrn}</strong>
                  </p>
                </div>
              </div>

              {patientHistory?.updated_by_name && (
                <div className="text-right hidden sm:block">
                  <Badge variant="outline" className="bg-slate-100 text-slate-800 text-xs px-2.5 py-0.5 font-medium border-slate-300">
                    Last updated by: {patientHistory.updated_by_name}
                  </Badge>
                  {patientHistory.updated_at && (
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      {formatDate(patientHistory.updated_at)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogHeader>

          {dialogError && (
            <div className="px-5 pt-3">
              <Alert className="bg-red-50 text-red-900 border-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">{dialogError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* 2. Scrollable Form Body with 2-Column Clinical Grid */}
          <form onSubmit={handleSubmitHistory(onSubmitHistory)} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* ===== COLUMN 1: Medical, Surgical & Medications ===== */}
              <div className="space-y-4">
                {/* 1. Past Medical History */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-rose-600" />
                      Past Medical History
                    </Label>
                    <span className="text-[11px] text-slate-400">Chronic illnesses & comorbidities</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Known hypertensive for 5 years, Type-2 Diabetes on oral medications, previous ischemic heart disease..."
                    rows={2}
                    {...registerHistory("past_medical_history")}
                    className="text-sm bg-slate-50/50 focus:bg-white resize-none font-medium min-h-[66px] border-slate-200 focus-visible:ring-blue-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {["HTN (Hypertension)", "Type-2 Diabetes Mellitus", "Asthma", "Ischemic Heart Disease (IHD)", "CKD", "Hepatitis B/C", "Hypothyroidism"].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAppendHistoryChip("past_medical_history", preset)}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 text-slate-700 font-medium rounded-md border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Past Surgical History */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      Past Surgical History
                    </Label>
                    <span className="text-[11px] text-slate-400">Operations & procedures</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Laparoscopic Appendectomy (2020), Open Cholecystectomy (2023)..."
                    rows={2}
                    {...registerHistory("past_surgical_history")}
                    className="text-sm bg-slate-50/50 focus:bg-white resize-none font-medium min-h-[66px] border-slate-200 focus-visible:ring-blue-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {["Appendectomy", "Cholecystectomy", "C-Section", "Inguinal Hernia Repair", "CABG", "Orthopedic Surgery"].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAppendHistoryChip("past_surgical_history", preset)}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 text-slate-700 font-medium rounded-md border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Medication History */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="h-4 w-4 text-teal-600" />
                      Current / Regular Medications
                    </Label>
                    <span className="text-[11px] text-slate-400">Ongoing maintenance drugs</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Tab. Metformin 500mg BD, Tab. Amlodipine 5mg OD, Tab. Aspirin 75mg OD..."
                    rows={2}
                    {...registerHistory("medication_history")}
                    className="text-sm bg-slate-50/50 focus:bg-white resize-none font-medium min-h-[66px] border-slate-200 focus-visible:ring-teal-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {["Tab. Metformin 500mg", "Tab. Amlodipine 5mg", "Tab. Aspirin 75mg", "Cap. Omeprazole 20mg", "Inj. Insulin 70/30", "Tab. Atorvastatin 20mg"].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAppendHistoryChip("medication_history", preset)}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 font-medium rounded-md border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== COLUMN 2: Allergies (Hero), Family & Social ===== */}
              <div className="space-y-4">
                {/* 4. Allergy History (Hero Safety Card) */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3.5 sm:p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert className="h-4 w-4 text-rose-600" />
                        Allergies & Adverse Reactions
                      </Label>
                      <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] px-1.5 py-0 font-bold">
                        SAFETY ALERT
                      </Badge>
                    </div>
                    <span className="text-[11px] text-rose-700">Drug, food & env</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Severe Penicillin anaphylaxis, Sulfa drugs trigger skin rash, NSAID induced bronchospasm..."
                    rows={2}
                    {...registerHistory("allergy_history")}
                    className="text-sm bg-white resize-none font-medium min-h-[66px] border-rose-200 focus-visible:ring-rose-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {/* NKDA green pill */}
                    <button
                      type="button"
                      onClick={() => handleAppendHistoryChip("allergy_history", "No Known Drug Allergies (NKDA)")}
                      className="text-[11px] px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-md border border-emerald-300 transition-colors cursor-pointer"
                    >
                      ✓ No Known Drug Allergies (NKDA)
                    </button>
                    {["Penicillin Allergy", "Sulfa Drugs Allergy", "NSAIDs / Aspirin", "Contrast Dye", "Dust & Pollen Allergy"].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAppendHistoryChip("allergy_history", preset)}
                        className="text-[11px] px-2 py-0.5 bg-white hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 text-rose-900 font-medium rounded-md border border-rose-200 transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Family History */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-purple-600" />
                      Family Medical History
                    </Label>
                    <span className="text-[11px] text-slate-400">Hereditary & genetic disorders</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Father had CAD & HTN at age 55, Mother diagnosed with Type-2 Diabetes..."
                    rows={2}
                    {...registerHistory("family_history")}
                    className="text-sm bg-slate-50/50 focus:bg-white resize-none font-medium min-h-[66px] border-slate-200 focus-visible:ring-purple-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {["CAD in father", "Diabetes in mother", "Hypertension in family", "Asthma", "Cancer history", "Stroke / CVA"].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAppendHistoryChip("family_history", preset)}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 text-slate-700 font-medium rounded-md border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Social & Lifestyle History */}
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      Social & Lifestyle History
                    </Label>
                    <span className="text-[11px] text-slate-400">Habits, occupation & lifestyle</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Non-smoker, sedentary desk job, no history of alcohol or substance abuse..."
                    rows={2}
                    {...registerHistory("social_history")}
                    className="text-sm bg-slate-50/50 focus:bg-white resize-none font-medium min-h-[66px] border-slate-200 focus-visible:ring-emerald-500"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {["Non-smoker", "Cigarette Smoker", "Ex-smoker", "Sedentary lifestyle", "Physically active", "Occupational hazards"].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAppendHistoryChip("social_history", preset)}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 font-medium rounded-md border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Fixed Dialog Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Centralized record • Automatically attached to all OPD visits for this patient</span>
                <span className="sm:hidden">Continuous EMR record</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsHistoryOpen(false)}
                  size="sm"
                  className="h-9 text-xs sm:text-sm px-4 border-slate-200 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingHistory}
                  size="sm"
                  className="h-9 text-xs sm:text-sm px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  {isSubmittingHistory ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      {patientHistory ? "Update Medical History" : "Save Medical History"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Patient Symptoms Modal (ui-ux-pro-max) */}
      <Dialog open={isSymptomsOpen} onOpenChange={setIsSymptomsOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* 1. Elevated Dialog Header with Unobstructed 'X' Spacing */}
          <DialogHeader className="p-4 sm:p-5 border-b bg-slate-50/90 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      Presenting Symptoms & Chief Complaints
                    </DialogTitle>
                    <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 font-mono text-[11px] px-2.5 py-0.5 font-bold">
                      {selectedSymptomsDraft.length} ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clinical symptoms & complaints for <strong className="text-slate-900 font-bold">{patientName}</strong> • MRN: <strong className="text-slate-950 font-mono font-bold">{patientMrn}</strong>
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {dialogError && (
            <div className="px-5 pt-3">
              <Alert className="bg-red-50 text-red-900 border-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">{dialogError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* 2. Scrollable Body with 2-Column Responsive Layout */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* ===== LEFT COLUMN (7 Cols): Master Catalog, Search & Quick Presets ===== */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Master Search & Catalog Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-amber-600" />
                      Search & Select Master Symptoms
                    </Label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {filteredMasterSymptoms.length} available
                    </span>
                  </div>

                  {/* Search Input with Clear Button */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Type to filter symptoms (e.g. Fever, Cough, Headache, Pain)..."
                      value={symptomSearchQuery}
                      onChange={(e) => setSymptomSearchQuery(e.target.value)}
                      className="pl-9 pr-8 text-sm h-10 bg-slate-50/50 focus:bg-white border-slate-200 focus-visible:ring-amber-500"
                    />
                    {symptomSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setSymptomSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filterable Symptoms Catalog Grid */}
                  <div className="max-h-52 overflow-y-auto p-2 rounded-lg border border-slate-200/80 bg-slate-50/40">
                    {loadingMasterSymptoms ? (
                      <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />
                        Loading master symptoms...
                      </div>
                    ) : filteredMasterSymptoms.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                        <p className="font-semibold">No matching symptom in master catalog.</p>
                        <p className="text-slate-400 text-[11px]">Use the custom input below to add it instantly.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {filteredMasterSymptoms.map((s) => {
                          const isSelected = selectedSymptomsDraft.includes(s.name);
                          return (
                            <button
                              key={s.id || s.code || s.name}
                              type="button"
                              onClick={() => handleToggleSymptom(s.name)}
                              className={`flex items-center justify-between p-2 rounded-md text-left text-xs transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-amber-50 text-amber-950 border-amber-300 font-bold shadow-2xs ring-1 ring-amber-300/60"
                                  : "bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/90 hover:border-slate-300"
                              }`}
                            >
                              <span className="truncate mr-1">{s.name}</span>
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

                {/* 2. Add Custom Symptom Inline Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-amber-600" />
                      Add Custom / Unlisted Symptom
                    </Label>
                    <span className="text-[11px] text-slate-400">Saves to Master + Prescription</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. Bilateral knee stiffness with morning swelling..."
                      value={customSymptomInput}
                      onChange={(e) => setCustomSymptomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSymptom();
                        }
                      }}
                      className="h-9 text-sm bg-slate-50/50 focus:bg-white border-slate-200 focus-visible:ring-amber-500"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomSymptom}
                      disabled={!customSymptomInput.trim()}
                      className="h-9 text-xs sm:text-sm px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 shadow-2xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Symptom
                    </Button>
                  </div>
                </div>

                {/* 3. Quick Preset Symptoms */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                      Common Clinical Presets
                    </span>
                    <span className="text-[11px] text-slate-400">Click to toggle on/off</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-100 border-amber-400 text-amber-950 font-bold shadow-2xs"
                              : "bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN (5 Cols): Active Complaints & Live Preview ===== */}
              <div className="lg:col-span-5 space-y-4">
                {/* Active Selected Complaints Basket */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/25 p-3.5 sm:p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-amber-600" />
                        Active Chief Complaints
                      </Label>
                      <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] px-1.5 py-0 font-bold font-mono">
                        {selectedSymptomsDraft.length}
                      </Badge>
                    </div>
                    {selectedSymptomsDraft.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSymptomsDraft([])}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Active Symptoms Badges Basket */}
                  <div className="min-h-[140px] max-h-60 overflow-y-auto p-2.5 rounded-lg border border-amber-200/80 bg-white">
                    {selectedSymptomsDraft.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400 space-y-1">
                        <Tag className="h-6 w-6 text-slate-300 mb-1" />
                        <p className="text-xs font-semibold text-slate-500">No presenting symptoms selected</p>
                        <p className="text-[11px] text-slate-400">
                          Select from the master catalog or click quick presets on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSymptomsDraft.map((symptom, idx) => (
                          <Badge
                            key={idx}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs transition-all flex items-center"
                          >
                            <span>{symptom}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSymptomDraft(symptom)}
                              className="rounded-full hover:bg-amber-700/60 p-0.5 transition-colors cursor-pointer"
                              title="Remove symptom"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescription Slip Live Render Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
                      Prescription Slip Live Preview:
                    </span>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                        PRESENTING SYMPTOMS / COMPLAINTS
                      </div>
                      <div className="text-slate-800 font-medium font-sans">
                        {selectedSymptomsDraft.length > 0 ? (
                          selectedSymptomsDraft.join(", ")
                        ) : (
                          <span className="text-slate-400 italic">None selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Fixed Dialog Footer Actions */}
          <div className="p-4 border-t bg-slate-50/90 shrink-0 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">
                {selectedSymptomsDraft.length} presenting {selectedSymptomsDraft.length === 1 ? "complaint" : "complaints"} will be attached to prescription
              </span>
              <span className="sm:hidden">{selectedSymptomsDraft.length} selected</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSymptomsOpen(false)}
                size="sm"
                className="h-9 text-xs sm:text-sm px-4 border-slate-200 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveSymptoms}
                disabled={isSavingSymptoms}
                size="sm"
                className="h-9 text-xs sm:text-sm px-5 bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer shadow-sm"
              >
                {isSavingSymptoms ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Save Symptoms
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Physical Examination Modal (ui-ux-pro-max) */}
      <Dialog open={isExamOpen} onOpenChange={setIsExamOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* 1. Elevated Dialog Header with Unobstructed 'X' Spacing */}
          <DialogHeader className="p-4 sm:p-5 border-b bg-slate-50/90 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      Physical Examination Findings
                    </DialogTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-300 font-mono text-[11px] px-2.5 py-0.5 font-bold">
                      {selectedExamsDraft.length} ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clinical physical examination observations for <strong className="text-slate-900 font-bold">{patientName}</strong> • MRN: <strong className="text-slate-950 font-mono font-bold">{patientMrn}</strong>
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {dialogError && (
            <div className="px-5 pt-3">
              <Alert className="bg-red-50 text-red-900 border-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">{dialogError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* 2. Scrollable Body with 2-Column Responsive Layout */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* ===== LEFT COLUMN (7 Cols): Master Catalog, Search & Quick Presets ===== */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Master Search & Catalog Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-blue-600" />
                      Search & Select Examination Catalog
                    </Label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {filteredMasterExams.length} available
                    </span>
                  </div>

                  {/* Search Input with Clear Button */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Type to filter examination findings (e.g. Chest clear, CVS normal, Abdomen soft)..."
                      value={examSearchQuery}
                      onChange={(e) => setExamSearchQuery(e.target.value)}
                      className="pl-9 pr-8 text-sm h-10 bg-slate-50/50 focus:bg-white border-slate-200 focus-visible:ring-blue-500"
                    />
                    {examSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setExamSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filterable Exam Findings Catalog Grid */}
                  <div className="max-h-52 overflow-y-auto p-2 rounded-lg border border-slate-200/80 bg-slate-50/40">
                    {loadingMasterExams ? (
                      <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                        Loading master examination list...
                      </div>
                    ) : filteredMasterExams.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                        <p className="font-semibold">No matching finding in master catalog.</p>
                        <p className="text-slate-400 text-[11px]">Use the custom input below to add it instantly.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {filteredMasterExams.map((e) => {
                          const isSelected = selectedExamsDraft.includes(e.name);
                          return (
                            <button
                              key={e.id || e.code || e.name}
                              type="button"
                              onClick={() => handleToggleExam(e.name)}
                              className={`flex items-center justify-between p-2 rounded-md text-left text-xs transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-blue-50 text-blue-950 border-blue-300 font-bold shadow-2xs ring-1 ring-blue-300/60"
                                  : "bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/90 hover:border-slate-300"
                              }`}
                            >
                              <span className="truncate mr-1">{e.name}</span>
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

                {/* 2. Add Custom Exam Finding Inline Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-blue-600" />
                      Add Custom / Unlisted Examination Finding
                    </Label>
                    <span className="text-[11px] text-slate-400">Saves to Master + Prescription</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. Mild tenderness in right hypochondrium, Murphy's sign negative..."
                      value={customExamInput}
                      onChange={(e) => setCustomExamInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomExam();
                        }
                      }}
                      className="h-9 text-sm bg-slate-50/50 focus:bg-white border-slate-200 focus-visible:ring-blue-500"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomExam}
                      disabled={!customExamInput.trim()}
                      className="h-9 text-xs sm:text-sm px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 shadow-2xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Finding
                    </Button>
                  </div>
                </div>

                {/* 3. Quick Common Preset Chips */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                      Common Examination Presets
                    </span>
                    <span className="text-[11px] text-slate-400">Click to toggle on/off</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-100 border-blue-400 text-blue-950 font-bold shadow-2xs"
                              : "bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN (5 Cols): Active Findings & Live Preview ===== */}
              <div className="lg:col-span-5 space-y-4">
                {/* Active Selected Examination Basket */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/25 p-3.5 sm:p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-blue-600" />
                        Active Examination Findings
                      </Label>
                      <Badge variant="outline" className="bg-blue-100 text-blue-900 border-blue-300 text-[10px] px-1.5 py-0 font-bold font-mono">
                        {selectedExamsDraft.length}
                      </Badge>
                    </div>
                    {selectedExamsDraft.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedExamsDraft([])}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Active Findings Badges Basket */}
                  <div className="min-h-[140px] max-h-60 overflow-y-auto p-2.5 rounded-lg border border-blue-200/80 bg-white">
                    {selectedExamsDraft.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400 space-y-1">
                        <Stethoscope className="h-6 w-6 text-slate-300 mb-1" />
                        <p className="text-xs font-semibold text-slate-500">No examination findings recorded</p>
                        <p className="text-[11px] text-slate-400">
                          Select from the master catalog or click quick presets on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedExamsDraft.map((exam, idx) => (
                          <Badge
                            key={idx}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs transition-all flex items-center"
                          >
                            <span>{exam}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExamDraft(exam)}
                              className="rounded-full hover:bg-blue-800/60 p-0.5 transition-colors cursor-pointer"
                              title="Remove finding"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescription Slip Live Render Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-blue-950 uppercase tracking-wider block">
                      Prescription Slip Live Preview:
                    </span>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                        PHYSICAL EXAMINATION FINDINGS
                      </div>
                      <div className="text-slate-800 font-medium font-sans">
                        {selectedExamsDraft.length > 0 ? (
                          selectedExamsDraft.join(" • ")
                        ) : (
                          <span className="text-slate-400 italic">None recorded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Fixed Dialog Footer Actions */}
          <div className="p-4 border-t bg-slate-50/90 shrink-0 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">
                {selectedExamsDraft.length} physical examination {selectedExamsDraft.length === 1 ? "finding" : "findings"} will be attached to prescription
              </span>
              <span className="sm:hidden">{selectedExamsDraft.length} selected</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExamOpen(false)}
                size="sm"
                className="h-9 text-xs sm:text-sm px-4 border-slate-200 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveExams}
                disabled={isSavingExams}
                size="sm"
                className="h-9 text-xs sm:text-sm px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-sm"
              >
                {isSavingExams ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Save Findings
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Diagnosis Modal (ui-ux-pro-max) */}
      <Dialog open={isDiagnosisOpen} onOpenChange={setIsDiagnosisOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* 1. Elevated Dialog Header with Unobstructed 'X' Spacing */}
          <DialogHeader className="p-4 sm:p-5 border-b bg-slate-50/90 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <Brain className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      Diagnosis & Clinical Impression
                    </DialogTitle>
                    <Badge variant="outline" className="bg-teal-50 text-teal-900 border-teal-300 font-mono text-[11px] px-2.5 py-0.5 font-bold">
                      {selectedDiagnosesDraft.length} ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provisional & confirmed clinical diagnoses for <strong className="text-slate-900 font-bold">{patientName}</strong> • MRN: <strong className="text-slate-950 font-mono font-bold">{patientMrn}</strong>
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {dialogError && (
            <div className="px-5 pt-3">
              <Alert className="bg-red-50 text-red-900 border-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">{dialogError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* 2. Scrollable Body with 2-Column Responsive Layout */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* ===== LEFT COLUMN (7 Cols): Master Catalog, Search & Quick Presets ===== */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Master Search & Catalog Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-teal-600" />
                      Search & Select Diagnosis Catalog
                    </Label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {filteredMasterDiagnoses.length} available
                    </span>
                  </div>

                  {/* Search Input with Clear Button */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Type to filter diagnoses (e.g. Hypertension, Diabetes, URTI, Typhoid)..."
                      value={diagnosisSearchQuery}
                      onChange={(e) => setDiagnosisSearchQuery(e.target.value)}
                      className="pl-9 pr-8 text-sm h-10 bg-slate-50/50 focus:bg-white border-slate-200 focus-visible:ring-teal-500"
                    />
                    {diagnosisSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDiagnosisSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filterable Diagnosis Catalog Grid */}
                  <div className="max-h-52 overflow-y-auto p-2 rounded-lg border border-slate-200/80 bg-slate-50/40">
                    {loadingMasterDiagnoses ? (
                      <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
                        Loading master diagnoses...
                      </div>
                    ) : filteredMasterDiagnoses.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                        <p className="font-semibold">No matching diagnosis in master catalog.</p>
                        <p className="text-slate-400 text-[11px]">Use the custom input below to add it instantly.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {filteredMasterDiagnoses.map((d) => {
                          const isSelected = selectedDiagnosesDraft.includes(d.name);
                          return (
                            <button
                              key={d.id || d.code || d.name}
                              type="button"
                              onClick={() => handleToggleDiagnosis(d.name)}
                              className={`flex items-center justify-between p-2 rounded-md text-left text-xs transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-teal-50 text-teal-950 border-teal-300 font-bold shadow-2xs ring-1 ring-teal-300/60"
                                  : "bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/90 hover:border-slate-300"
                              }`}
                            >
                              <span className="truncate mr-1">{d.name}</span>
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

                {/* 2. Add Custom Diagnosis Inline Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-teal-600" />
                      Add Custom / Unlisted Diagnosis
                    </Label>
                    <span className="text-[11px] text-slate-400">Saves to Master + Prescription</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. Chronic Kidney Disease Stage 3b with Anemia..."
                      value={customDiagnosisInput}
                      onChange={(e) => setCustomDiagnosisInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomDiagnosis();
                        }
                      }}
                      className="h-9 text-sm bg-slate-50/50 focus:bg-white border-slate-200 focus-visible:ring-teal-500"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomDiagnosis}
                      disabled={!customDiagnosisInput.trim()}
                      className="h-9 text-xs sm:text-sm px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold shrink-0 shadow-2xs cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Diagnosis
                    </Button>
                  </div>
                </div>

                {/* 3. Quick Common Preset Chips */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-teal-600" />
                      Common Clinical Presets
                    </span>
                    <span className="text-[11px] text-slate-400">Click to toggle on/off</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-teal-100 border-teal-400 text-teal-950 font-bold shadow-2xs"
                              : "bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN (5 Cols): Active Diagnoses & Live Preview ===== */}
              <div className="lg:col-span-5 space-y-4">
                {/* Active Selected Diagnoses Basket */}
                <div className="rounded-xl border border-teal-200 bg-teal-50/25 p-3.5 sm:p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-teal-600" />
                        Active Clinical Diagnoses
                      </Label>
                      <Badge variant="outline" className="bg-teal-100 text-teal-900 border-teal-300 text-[10px] px-1.5 py-0 font-bold font-mono">
                        {selectedDiagnosesDraft.length}
                      </Badge>
                    </div>
                    {selectedDiagnosesDraft.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedDiagnosesDraft([])}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Active Diagnoses Badges Basket */}
                  <div className="min-h-[140px] max-h-60 overflow-y-auto p-2.5 rounded-lg border border-teal-200/80 bg-white">
                    {selectedDiagnosesDraft.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400 space-y-1">
                        <Brain className="h-6 w-6 text-slate-300 mb-1" />
                        <p className="text-xs font-semibold text-slate-500">No diagnoses selected</p>
                        <p className="text-[11px] text-slate-400">
                          Select from the master catalog or click quick presets on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDiagnosesDraft.map((diag, idx) => (
                          <Badge
                            key={idx}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs transition-all flex items-center"
                          >
                            <span>{diag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDiagnosisDraft(diag)}
                              className="rounded-full hover:bg-teal-800/60 p-0.5 transition-colors cursor-pointer"
                              title="Remove diagnosis"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescription Slip Live Render Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-teal-950 uppercase tracking-wider block">
                      Prescription Slip Live Preview:
                    </span>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                        DIAGNOSIS / CLINICAL IMPRESSION
                      </div>
                      <div className="text-slate-800 font-medium font-sans">
                        {selectedDiagnosesDraft.length > 0 ? (
                          selectedDiagnosesDraft.join(" • ")
                        ) : (
                          <span className="text-slate-400 italic">None recorded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Fixed Dialog Footer Actions */}
          <div className="p-4 border-t bg-slate-50/90 shrink-0 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">
                {selectedDiagnosesDraft.length} clinical {selectedDiagnosesDraft.length === 1 ? "diagnosis" : "diagnoses"} will be attached to prescription
              </span>
              <span className="sm:hidden">{selectedDiagnosesDraft.length} selected</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDiagnosisOpen(false)}
                size="sm"
                className="h-9 text-xs sm:text-sm px-4 border-slate-200 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveDiagnoses}
                disabled={isSavingDiagnoses}
                size="sm"
                className="h-9 text-xs sm:text-sm px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer shadow-sm"
              >
                {isSavingDiagnoses ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Save Diagnosis
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Investigations Modal (Indoor Services - ui-ux-pro-max) */}
      <Dialog open={isInvestigationOpen} onOpenChange={setIsInvestigationOpen}>
        <DialogContent className="max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* 1. Elevated Dialog Header with Unobstructed 'X' Spacing */}
          <DialogHeader className="p-4 sm:p-5 border-b bg-slate-50/90 shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-700 border border-indigo-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <TestTube className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                      Order Diagnostic Investigations & Lab Tests
                    </DialogTitle>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-900 border-indigo-300 font-mono text-[11px] px-2.5 py-0.5 font-bold">
                      {selectedInvestigationsDraft.length} ORDERED
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order laboratory, radiology and diagnostic services for <strong className="text-slate-900 font-bold">{patientName}</strong> • MRN: <strong className="text-slate-950 font-mono font-bold">{patientMrn}</strong>
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {dialogError && (
            <div className="px-5 pt-3">
              <Alert className="bg-red-50 text-red-900 border-red-200 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <AlertDescription className="text-xs sm:text-sm font-medium">{dialogError}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* 2. Scrollable Body with 2-Column Responsive Layout */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* ===== LEFT COLUMN (7 Cols): Search, Dept Filter, Services Catalog & Presets ===== */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Master Search & Catalog Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Search className="h-4 w-4 text-indigo-600" />
                      Search Hospital Services Catalog
                    </Label>
                    {masterDepartments.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dept:</span>
                        <select
                          value={selectedDeptFilter}
                          onChange={(e) => setSelectedDeptFilter(e.target.value)}
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-slate-50 text-slate-800 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                        >
                          <option value="all">All Departments ({masterServices.length})</option>
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

                  {/* Search Input with Clear Button */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Type test name or code (e.g. CBC, X-Ray, USG, LFT, ECG)..."
                      value={investigationSearchQuery}
                      onChange={(e) => setInvestigationSearchQuery(e.target.value)}
                      className="pl-9 pr-8 text-sm h-10 bg-slate-50/50 focus:bg-white border-slate-200 focus-visible:ring-indigo-500"
                    />
                    {investigationSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setInvestigationSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filterable Services Catalog Grid */}
                  <div className="max-h-56 overflow-y-auto p-2 rounded-lg border border-slate-200/80 bg-slate-50/40">
                    {loadingMasterServices ? (
                      <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                        Loading hospital services catalog...
                      </div>
                    ) : filteredMasterServices.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                        <p className="font-semibold">No matching services found in catalog.</p>
                        <p className="text-slate-400 text-[11px]">Check department filter or try alternative test name.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
                              className={`flex items-start justify-between p-2 rounded-md text-left text-xs transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-indigo-50 text-indigo-950 border-indigo-300 font-bold shadow-2xs ring-1 ring-indigo-300/60"
                                  : "bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200/90 hover:border-slate-300"
                              }`}
                            >
                              <div className="space-y-0.5 overflow-hidden pr-2">
                                <p className="font-semibold text-slate-900 truncate text-xs">{svc.ServiceName}</p>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
                                  {svc.Code && <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600">#{svc.Code}</span>}
                                  {dept?.DepartmentName && (
                                    <span className="truncate max-w-[90px] text-slate-600">{dept.DepartmentName}</span>
                                  )}
                                  {svc.DefaultCharges > 0 && (
                                    <span className="text-emerald-700 font-bold ml-auto">
                                      Rs. {Number(svc.DefaultCharges).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected ? (
                                <Check className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
                              ) : (
                                <Plus className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Quick Common Diagnostic Presets */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <TestTube className="h-3.5 w-3.5 text-indigo-600" />
                      Common Diagnostic Presets
                    </span>
                    <span className="text-[11px] text-slate-400">Click to toggle on/off</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
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
                          className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-100 border-indigo-400 text-indigo-950 font-bold shadow-2xs"
                              : "bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 hover:border-indigo-200"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN (5 Cols): Active Orders & Live Preview ===== */}
              <div className="lg:col-span-5 space-y-4">
                {/* Active Selected Investigations Basket */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/25 p-3.5 sm:p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-indigo-600" />
                        Active Diagnostic Orders
                      </Label>
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-900 border-indigo-300 text-[10px] px-1.5 py-0 font-bold font-mono">
                        {selectedInvestigationsDraft.length}
                      </Badge>
                    </div>
                    {selectedInvestigationsDraft.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedInvestigationsDraft([])}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Active Orders Badges Basket */}
                  <div className="min-h-[140px] max-h-60 overflow-y-auto p-2.5 rounded-lg border border-indigo-200/80 bg-white">
                    {selectedInvestigationsDraft.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-400 space-y-1">
                        <TestTube className="h-6 w-6 text-slate-300 mb-1" />
                        <p className="text-xs font-semibold text-slate-500">No diagnostic tests ordered</p>
                        <p className="text-[11px] text-slate-400">
                          Select from hospital catalog or click common presets on the left.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedInvestigationsDraft.map((inv, idx) => {
                          const name = inv.serviceName || inv.name;
                          return (
                            <Badge
                              key={idx}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs transition-all flex items-center"
                            >
                              <span>{name}</span>
                              {inv.departmentName && (
                                <span className="text-[9px] bg-indigo-900/50 px-1.5 py-0.2 rounded text-indigo-100 font-normal">
                                  {inv.departmentName}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveInvestigationDraft(inv.serviceId || name)}
                                className="rounded-full hover:bg-indigo-800/60 p-0.5 transition-colors cursor-pointer"
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

                  {/* Prescription Slip Live Render Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider block">
                      Prescription Slip Live Preview:
                    </span>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs font-mono text-slate-800 space-y-1 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider">
                        ORDERED INVESTIGATIONS / DIAGNOSTICS
                      </div>
                      <div className="text-slate-800 font-medium font-sans">
                        {selectedInvestigationsDraft.length > 0 ? (
                          selectedInvestigationsDraft.map((i) => i.serviceName || i.name).join(" • ")
                        ) : (
                          <span className="text-slate-400 italic">None ordered</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Fixed Dialog Footer Actions */}
          <div className="p-4 border-t bg-slate-50/90 shrink-0 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <TestTube className="h-4 w-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">
                {selectedInvestigationsDraft.length} diagnostic {selectedInvestigationsDraft.length === 1 ? "investigation" : "investigations"} will be attached to prescription
              </span>
              <span className="sm:hidden">{selectedInvestigationsDraft.length} ordered</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInvestigationOpen(false)}
                size="sm"
                className="h-9 text-xs sm:text-sm px-4 border-slate-200 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveInvestigations}
                disabled={isSavingInvestigations}
                size="sm"
                className="h-9 text-xs sm:text-sm px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-sm"
              >
                {isSavingInvestigations ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1.5" />
                    Save Investigations
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Medications Modal (Pharmacy Formulary - ui-ux-pro-max) */}
      <Dialog open={isMedicationOpen} onOpenChange={setIsMedicationOpen}>
        <DialogContent className="max-w-5xl lg:max-w-6xl h-[90vh] max-h-[96vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Dialog Header */}
          <DialogHeader className="py-3 px-5 border-b bg-slate-50/90 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200 shadow-2xs">
                  <Pill className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 leading-tight">
                    Prescribe Medications (Rx)
                    <span className="text-sm text-slate-600 font-normal ml-1">
                      for <strong className="font-semibold text-slate-900">{patientName}</strong> ({patientMrn || "No MRN"})
                    </span>
                  </DialogTitle>
                </div>
              </div>

              {selectedMedicinesDraft.length > 0 && (
                <div className="pr-10 sm:pr-12 shrink-0 self-start sm:self-auto">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-900 border-emerald-300 font-mono text-sm px-3 py-1 font-semibold"
                  >
                    {selectedMedicinesDraft.length} prescribed
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Modal Body: Quick-Entry Row + Selected Items Data Table */}
          <div className="p-3.5 sm:p-5 flex flex-col gap-3.5 flex-1 overflow-hidden min-h-0 bg-slate-50/30">
            {/* 1. Horizontal Quick-Entry Row (side-by-side inputs) */}
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* Medicine / Product */}
                <div className="md:col-span-4 relative">
                  <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Pill className="h-4 w-4 text-emerald-600" />
                    Medicine / Product <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      ref={medInputRef}
                      type="text"
                      placeholder="Search medicine brand, formula..."
                      value={newMed.medicineName}
                      onChange={(e) => {
                        setNewMed((prev) => ({
                          ...prev,
                          medicineName: e.target.value,
                          medicineId: null,
                          genericName: "",
                          dosageForm: "",
                        }));
                        setOpenMedSuggestions(true);
                        setHighlightedMedIndex(0);
                      }}
                      onFocus={() => {
                        setOpenMedSuggestions(true);
                        if (filteredMedSuggestions.length > 0 && highlightedMedIndex === -1) {
                          setHighlightedMedIndex(0);
                        }
                      }}
                      onBlur={() => setTimeout(() => setOpenMedSuggestions(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          if (!openMedSuggestions) {
                            setOpenMedSuggestions(true);
                            setHighlightedMedIndex(0);
                          } else {
                            setHighlightedMedIndex((prev) =>
                              prev < filteredMedSuggestions.length - 1 ? prev + 1 : 0
                            );
                          }
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          if (openMedSuggestions) {
                            setHighlightedMedIndex((prev) =>
                              prev > 0 ? prev - 1 : filteredMedSuggestions.length - 1
                            );
                          }
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                          if (
                            openMedSuggestions &&
                            highlightedMedIndex >= 0 &&
                            filteredMedSuggestions[highlightedMedIndex]
                          ) {
                            handleSelectMedicine(filteredMedSuggestions[highlightedMedIndex]);
                          } else if (openMedSuggestions && filteredMedSuggestions.length > 0) {
                            handleSelectMedicine(filteredMedSuggestions[0]);
                          } else {
                            freqInputRef.current?.focus();
                          }
                        } else if (e.key === "Escape") {
                          setOpenMedSuggestions(false);
                        }
                      }}
                      className="h-10 text-sm bg-white border-slate-300 pr-20 font-medium focus-visible:ring-emerald-500"
                    />
                    {newMed.dosageForm && (
                      <Badge
                        variant="outline"
                        className="absolute right-2.5 top-2.5 text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold pointer-events-none"
                      >
                        {newMed.dosageForm}
                      </Badge>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {openMedSuggestions && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {filteredMedSuggestions.length > 0 ? (
                        filteredMedSuggestions.map((med, idx) => {
                          const isHighlighted = highlightedMedIndex === idx;
                          return (
                            <div
                              key={med.id}
                              ref={(el) => {
                                if (isHighlighted && el) {
                                 el.scrollIntoView({ block: "nearest" });
                                }
                              }}
                              onMouseEnter={() => setHighlightedMedIndex(idx)}
                              onMouseDown={() => handleSelectMedicine(med)}
                              className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between text-sm ${
                                isHighlighted
                                  ? "bg-emerald-100/90 text-emerald-950 font-medium border-l-4 border-l-emerald-600 pl-2"
                                  : "hover:bg-emerald-50/70"
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className={`font-bold ${isHighlighted ? "text-emerald-950" : "text-slate-900"}`}>
                                    {med.brand_name}
                                  </span>
                                  {med.dosage_form_name && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700">
                                      {med.dosage_form_name}
                                    </Badge>
                                  )}
                                </div>
                                {med.generic_name && (
                                  <p className={`text-xs truncate mt-0.5 ${isHighlighted ? "text-emerald-800" : "text-slate-500"}`}>
                                    {med.generic_name}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant={isHighlighted ? "default" : "ghost"}
                                className={`h-7 w-7 p-0 ${isHighlighted ? "bg-emerald-600 text-white hover:bg-emerald-700" : "text-emerald-600"}`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-3 text-center text-sm text-slate-400">
                          No matching catalog medicines. Custom name will be used.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Frequency */}
                <div className="md:col-span-2 relative">
                  <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Clock className="h-4 w-4 text-teal-600" />
                    Frequency
                  </Label>
                  <Input
                    ref={freqInputRef}
                    type="text"
                    dir="auto"
                    placeholder="e.g. 1-0-1, OD, صبح، شام"
                    value={newMed.frequency}
                    onChange={(e) => {
                      setNewMed((prev) => ({ ...prev, frequency: e.target.value }));
                      setOpenFreqSuggestions(true);
                      setHighlightedFreqIndex(0);
                    }}
                    onFocus={() => {
                      setOpenFreqSuggestions(true);
                      if (filteredFreqSuggestions.length > 0 && highlightedFreqIndex === -1) {
                        setHighlightedFreqIndex(0);
                      }
                    }}
                    onBlur={() => setTimeout(() => setOpenFreqSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (!openFreqSuggestions) {
                          setOpenFreqSuggestions(true);
                          setHighlightedFreqIndex(0);
                        } else {
                          setHighlightedFreqIndex((prev) =>
                            prev < filteredFreqSuggestions.length - 1 ? prev + 1 : 0
                          );
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (openFreqSuggestions) {
                          setHighlightedFreqIndex((prev) =>
                            prev > 0 ? prev - 1 : filteredFreqSuggestions.length - 1
                          );
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        if (
                          openFreqSuggestions &&
                          highlightedFreqIndex >= 0 &&
                          filteredFreqSuggestions[highlightedFreqIndex]
                        ) {
                          handleSelectFrequency(filteredFreqSuggestions[highlightedFreqIndex]);
                        } else if (openFreqSuggestions && filteredFreqSuggestions.length > 0) {
                          handleSelectFrequency(filteredFreqSuggestions[0]);
                        } else {
                          durInputRef.current?.focus();
                        }
                      } else if (e.key === "Escape") {
                        setOpenFreqSuggestions(false);
                      }
                    }}
                    className="h-10 text-sm bg-white border-slate-300 font-medium focus-visible:ring-teal-500"
                  />

                  {/* Frequency Autocomplete Dropdown */}
                  {openFreqSuggestions && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {filteredFreqSuggestions.map((f, idx) => {
                        const isHighlighted = highlightedFreqIndex === idx;
                        return (
                          <div
                            key={f.id || f.frequency || idx}
                            dir="auto"
                            ref={(el) => {
                              if (isHighlighted && el) {
                                el.scrollIntoView({ block: "nearest" });
                              }
                            }}
                            onMouseEnter={() => setHighlightedFreqIndex(idx)}
                            onMouseDown={() => handleSelectFrequency(f)}
                            className={`p-2.5 text-sm cursor-pointer font-medium transition-colors ${
                              isHighlighted
                                ? "bg-teal-100/90 text-teal-950 font-bold border-l-4 border-l-teal-600 pl-2"
                                : "hover:bg-teal-50 text-slate-800"
                            }`}
                          >
                            {f.frequency}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="md:col-span-2 relative">
                  <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    Duration
                  </Label>
                  <Input
                    ref={durInputRef}
                    type="text"
                    dir="auto"
                    placeholder="e.g. 5 Days, ۵ دن"
                    value={newMed.duration}
                    onChange={(e) => {
                      setNewMed((prev) => ({ ...prev, duration: e.target.value }));
                      setOpenDurSuggestions(true);
                      setHighlightedDurIndex(0);
                    }}
                    onFocus={() => {
                      setOpenDurSuggestions(true);
                      if (filteredDurSuggestions.length > 0 && highlightedDurIndex === -1) {
                        setHighlightedDurIndex(0);
                      }
                    }}
                    onBlur={() => setTimeout(() => setOpenDurSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (!openDurSuggestions) {
                          setOpenDurSuggestions(true);
                          setHighlightedDurIndex(0);
                        } else {
                          setHighlightedDurIndex((prev) =>
                            prev < filteredDurSuggestions.length - 1 ? prev + 1 : 0
                          );
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (openDurSuggestions) {
                          setHighlightedDurIndex((prev) =>
                            prev > 0 ? prev - 1 : filteredDurSuggestions.length - 1
                          );
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        if (
                          openDurSuggestions &&
                          highlightedDurIndex >= 0 &&
                          filteredDurSuggestions[highlightedDurIndex]
                        ) {
                          handleSelectDuration(filteredDurSuggestions[highlightedDurIndex]);
                        } else if (openDurSuggestions && filteredDurSuggestions.length > 0) {
                          handleSelectDuration(filteredDurSuggestions[0]);
                        } else {
                          instInputRef.current?.focus();
                        }
                      } else if (e.key === "Escape") {
                        setOpenDurSuggestions(false);
                      }
                    }}
                    className="h-10 text-sm bg-white border-slate-300 font-medium focus-visible:ring-teal-500"
                  />

                  {/* Duration Autocomplete Dropdown */}
                  {openDurSuggestions && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {filteredDurSuggestions.map((d, idx) => {
                        const isHighlighted = highlightedDurIndex === idx;
                        return (
                          <div
                            key={d.id || d.duration || idx}
                            dir="auto"
                            ref={(el) => {
                              if (isHighlighted && el) {
                                el.scrollIntoView({ block: "nearest" });
                              }
                            }}
                            onMouseEnter={() => setHighlightedDurIndex(idx)}
                            onMouseDown={() => handleSelectDuration(d)}
                            className={`p-2.5 text-sm cursor-pointer font-medium transition-colors ${
                              isHighlighted
                                ? "bg-teal-100/90 text-teal-950 font-bold border-l-4 border-l-teal-600 pl-2"
                                : "hover:bg-teal-50 text-slate-800"
                            }`}
                          >
                            {d.duration}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="md:col-span-3 relative">
                  <Label className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-4 w-4 text-teal-600" />
                    Instructions
                  </Label>
                  <Input
                    ref={instInputRef}
                    type="text"
                    dir="auto"
                    placeholder="e.g. After meals, کھانے کے بعد"
                    value={newMed.instruction}
                    onChange={(e) => {
                      setNewMed((prev) => ({ ...prev, instruction: e.target.value }));
                      setOpenInstSuggestions(true);
                      setHighlightedInstIndex(0);
                    }}
                    onFocus={() => {
                      setOpenInstSuggestions(true);
                      if (filteredInstSuggestions.length > 0 && highlightedInstIndex === -1) {
                        setHighlightedInstIndex(0);
                      }
                    }}
                    onBlur={() => setTimeout(() => setOpenInstSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        if (!openInstSuggestions) {
                          setOpenInstSuggestions(true);
                          setHighlightedInstIndex(0);
                        } else {
                          setHighlightedInstIndex((prev) =>
                            prev < filteredInstSuggestions.length - 1 ? prev + 1 : 0
                          );
                        }
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        if (openInstSuggestions) {
                          setHighlightedInstIndex((prev) =>
                            prev > 0 ? prev - 1 : filteredInstSuggestions.length - 1
                          );
                        }
                      } else if (e.key === "Enter") {
                        e.preventDefault();
                        let chosenInstruction = newMed.instruction;
                        if (
                          openInstSuggestions &&
                          highlightedInstIndex >= 0 &&
                          filteredInstSuggestions[highlightedInstIndex]
                        ) {
                          chosenInstruction = filteredInstSuggestions[highlightedInstIndex].instruction;
                        } else if (openInstSuggestions && filteredInstSuggestions.length > 0) {
                          chosenInstruction = filteredInstSuggestions[0].instruction;
                        }
                        setOpenInstSuggestions(false);
                        setHighlightedInstIndex(-1);
                        handleAddMedicineToDraft(null, { ...newMed, instruction: chosenInstruction });
                      } else if (e.key === "Escape") {
                        setOpenInstSuggestions(false);
                      }
                    }}
                    className="h-10 text-sm bg-white border-slate-300 font-medium focus-visible:ring-teal-500"
                  />

                  {/* Instructions Autocomplete Dropdown */}
                  {openInstSuggestions && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {filteredInstSuggestions.map((inst, idx) => {
                        const isHighlighted = highlightedInstIndex === idx;
                        return (
                          <div
                            key={inst.id || inst.instruction || idx}
                            dir="auto"
                            ref={(el) => {
                              if (isHighlighted && el) {
                                el.scrollIntoView({ block: "nearest" });
                              }
                            }}
                            onMouseEnter={() => setHighlightedInstIndex(idx)}
                            onMouseDown={() => handleSelectInstruction(inst)}
                            className={`p-2.5 text-sm cursor-pointer font-medium transition-colors ${
                              isHighlighted
                                ? "bg-teal-100/90 text-teal-950 font-bold border-l-4 border-l-teal-600 pl-2"
                                : "hover:bg-teal-50 text-slate-800"
                            }`}
                          >
                            {inst.instruction}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Button */}
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    onClick={handleAddMedicineToDraft}
                    disabled={!newMed.medicineName.trim()}
                    className="h-10 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-2xs"
                  >
                    <Plus className="h-4 w-4 mr-1 md:mr-0 lg:mr-1" />
                    <span className="md:hidden lg:inline">Add</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 2. Selected Items Data Table (5 Columns) - Maximized Height */}
            <div className="flex-1 overflow-hidden flex flex-col border border-slate-200 rounded-xl bg-white shadow-2xs min-h-0">
              <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-slate-900">
                    Selected Prescription Items
                  </span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 font-mono text-sm px-2.5 py-0.5 font-semibold">
                    {selectedMedicinesDraft.length} items
                  </Badge>
                </div>

                {selectedMedicinesDraft.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMedicinesDraft([])}
                    className="h-7 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                <Table className="text-sm">
                  <TableHeader className="bg-slate-100/90 sticky top-0 z-10 shadow-2xs">
                    <TableRow className="hover:bg-transparent border-b border-slate-200">
                      <TableHead className="w-20 text-center font-bold text-slate-800 text-sm py-3">Serial No</TableHead>
                      <TableHead className="font-bold text-slate-800 text-sm min-w-[220px] py-3">Medicine</TableHead>
                      <TableHead className="w-44 font-bold text-slate-800 text-sm py-3">Frequency</TableHead>
                      <TableHead className="w-36 font-bold text-slate-800 text-sm py-3">Duration</TableHead>
                      <TableHead className="font-bold text-slate-800 text-sm min-w-[240px] py-3">Instructions</TableHead>
                      <TableHead className="w-20 text-center font-bold text-slate-800 text-sm py-3">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMedicinesDraft.length > 0 ? (
                      selectedMedicinesDraft.map((item, idx) => (
                        <TableRow key={item.id || idx} className="hover:bg-teal-50/20 border-b border-slate-100">
                          <TableCell className="text-center font-bold font-mono text-slate-700 text-sm py-3">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-950 text-sm">{item.name}</span>
                              {item.dosageForm && (
                                <Badge variant="outline" className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border-emerald-300 font-medium">
                                  {item.dosageForm}
                                </Badge>
                              )}
                            </div>
                            {item.genericName && (
                              <p className="text-xs text-slate-500 font-normal mt-0.5">
                                Formula: {item.genericName}
                              </p>
                            )}
                          </TableCell>
                          <TableCell dir="auto" className="font-medium text-slate-800 py-3 text-sm">
                            <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-900 font-mono text-xs font-bold border border-slate-200 inline-block">
                              {item.frequency || item.dosage || "—"}
                            </span>
                          </TableCell>
                          <TableCell dir="auto" className="font-medium text-slate-900 py-3 text-sm">
                            {item.duration || "—"}
                          </TableCell>
                          <TableCell dir="auto" className="text-slate-800 py-3 text-sm font-medium">
                            {item.instruction || "—"}
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMedicineDraft(idx)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Remove medicine"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                            <Pill className="h-12 w-12 text-slate-300 mb-2.5" />
                            <p className="font-bold text-base text-slate-800">No medicines added to this prescription</p>
                            <p className="text-sm text-slate-500 mt-1 max-w-md">
                              Type or select a medicine above, set frequency, duration, and instructions, then click <strong>+ Add</strong>.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Dialog Footer - ui-ux-pro-max: Ergonomic bottom clearance & clinical balance */}
          <DialogFooter className="px-6 pt-3.5 pb-5 sm:pb-6 border-t border-slate-200 bg-slate-50/95 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 text-sm text-slate-700 font-medium self-start sm:self-auto">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-200/80 shadow-2xs">
                <Pill className="h-4 w-4 text-emerald-600" />
                <span>
                  Total: <strong className="text-slate-950 font-bold">{selectedMedicinesDraft.length}</strong> medication{selectedMedicinesDraft.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-xs text-muted-foreground hidden md:inline">
                • Changes will immediately reflect in prescription and print preview
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMedicationOpen(false)}
                className="h-10 px-5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingMedications}
                onClick={handleSaveMedications}
                className="h-10 px-6 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all flex items-center gap-2"
              >
                {isSavingMedications ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Apply to Prescription ({selectedMedicinesDraft.length})
              </Button>
            </div>
          </DialogFooter>
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
