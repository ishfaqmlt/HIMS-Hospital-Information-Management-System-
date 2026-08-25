"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Pill } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusColors = {
  Waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

const calculateAge = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? `${age} Yrs` : "Child";
};

export const getColumns = ({ onSelect, onPrescribe }) => [
  {
    accessorKey: "tokenNo",
    header: "Token",
    cell: ({ row }) => {
      const token = row.original.tokenNo;
      return token ? (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 font-bold px-2 py-0.5">
          #{String(token).padStart(2, "0")}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    },
  },
  {
    accessorKey: "VisitNo",
    header: "Visit / Invoice No",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-slate-800">
        {row.original.VisitNo || row.original.InvoiceNo}
      </span>
    ),
  },
  {
    accessorKey: "patientId",
    header: "Patient",
    cell: ({ row }) => {
      const pName = row.original.patient_name || row.original.patient?.pName || "Unknown";
      const mrn = row.original.patient_mrn || row.original.patient?.mrn || "";
      const gender = row.original.gender || row.original.patient?.gender || "";
      const dob = row.original.dob || row.original.patient?.dob || "";
      const ageStr = calculateAge(dob);
      const details = [gender, ageStr].filter(Boolean).join(", ");

      return (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{pName}</p>
          <p className="text-[11px] text-muted-foreground">
            {mrn} {details ? `• ${details}` : ""}
          </p>
        </div>
      );
    },
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor_name || row.doctor?.Name,
    header: "Doctor",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-700">
        {row.original.doctor_name || row.original.doctor?.Name}
      </span>
    ),
  },
  {
    accessorKey: "VisitDate",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-slate-600">
        {formatDate(row.original.VisitDate || row.original.InvoiceDate)}
      </span>
    ),
  },
  {
    accessorKey: "Status",
    header: "Visit Status",
    cell: ({ row }) => {
      const status = row.original.Status || "Waiting";
      return (
        <Badge variant="outline" className={`text-[11px] ${statusColors[status] || "bg-gray-100 text-gray-800"}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "prescriptionStatus",
    header: "Prescription",
    cell: ({ row }) => {
      const prescStatus = row.original.prescriptionStatus || (row.original.isPrescriptionGiven ? "Completed" : "No Prescription");
      const prescBadgeColors = {
        "No Prescription": "bg-slate-100 text-slate-600 border-slate-300",
        pending: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
        "In Process": "bg-blue-100 text-blue-800 border-blue-300 font-semibold",
        Completed: "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold",
      };

      return (
        <Badge
          variant="outline"
          className={`text-[11px] px-2 py-0.5 ${prescBadgeColors[prescStatus] || "bg-slate-100 text-slate-600"}`}
        >
          {prescStatus}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7 px-2.5 flex items-center gap-1 font-semibold"
            onClick={() => onPrescribe && onPrescribe(item)}
            title="Prescribe Medicine"
          >
            <Pill className="h-3.5 w-3.5" />
            Prescribe
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 flex items-center gap-1 text-slate-700 hover:bg-slate-50 border-slate-200"
            onClick={() => onSelect && onSelect(item)}
            title="Select Patient for Context"
          >
            <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
            Select
          </Button>
        </div>
      );
    },
  },
];
