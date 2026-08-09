"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { calculateAge, formatDate } from "@/lib/utils";

const statusColor = (s) => {
  switch (s) {
    case "Registered": return "text-gray-600 bg-gray-50";
    case "Sampled": return "text-blue-600 bg-blue-50";
    case "InProcess": return "text-yellow-600 bg-yellow-50";
    case "Reported": return "text-green-600 bg-green-50";
    case "Approved": return "text-emerald-600 bg-emerald-50";
    case "Cancelled": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

export const getColumns = ({ onPrintBarcode, onPrintLabCopy }) => [
  {
    id: "sl",
    header: "SL",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "caseNo",
    header: "Case No",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("caseNo")}</span>
    ),
  },
  {
    id: "patientName",
    accessorFn: (row) => row.patient?.pName || "",
    header: "Patient Name",
    cell: ({ row }) => row.original.patient?.pName || "-",
  },
  {
    id: "mrn",
    accessorFn: (row) => row.patient?.mrn || "",
    header: "MRN",
    cell: ({ row }) => row.original.patient?.mrn || "-",
  },
  {
    id: "age",
    accessorFn: (row) => row.patient?.dob || "",
    header: "Age",
    cell: ({ row }) => calculateAge(row.original.patient?.dob),
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor?.Name || "",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name || "-",
  },
  {
    accessorKey: "caseDate",
    header: "Case Date",
    cell: ({ row }) => {
      const d = row.getValue("caseDate");
      if (!d) return "-";
      return formatDate(d);
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const p = row.getValue("priority");
      return (
        <span className={p === "Urgent" ? "text-red-600 font-medium" : ""}>
          {p}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status");
      return (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor(s)}`}>
          {s}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
            onClick={() => onPrintBarcode(c)}
          >
            <Printer className="h-3 w-3 mr-1" />
            Barcode
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-emerald-600 hover:text-emerald-700"
            onClick={() => onPrintLabCopy(c)}
          >
            <FileText className="h-3 w-3 mr-1" />
            Lab Copy
          </Button>
        </div>
      );
    },
  },
];
