"use client";

import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const getColumns = () => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={row.getToggleExpandedHandler()}
      >
        {row.getIsExpanded() ? (
          <ChevronDown className="h-4 w-4 text-sky-700" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    ),
  },
  {
    accessorKey: "caseNo",
    id: "caseNo",
    header: "Lab No / Case No",
    cell: ({ row }) => (
      <span className="font-semibold text-sky-800">{row.original.caseNo}</span>
    ),
  },
  {
    accessorKey: "patient_mrn",
    id: "patient_mrn",
    header: "MRN",
    cell: ({ row }) => row.original.patient?.mrn || row.original.patient_mrn || "-",
  },
  {
    accessorKey: "patient_name",
    id: "patient_name",
    header: "Patient Name",
    cell: ({ row }) => row.original.patient?.pName || row.original.patient_name || "-",
  },
  {
    accessorKey: "patient_gender",
    id: "patient_gender",
    header: "Gender",
    cell: ({ row }) => row.original.patient?.gender || row.original.patient_gender || "-",
  },
  {
    accessorKey: "caseDate",
    id: "caseDate",
    header: "Case Date",
    cell: ({ row }) =>
      row.original.caseDate ? row.original.caseDate.split("T")[0] : "-",
  },
  {
    accessorKey: "patient_mobile",
    id: "patient_mobile",
    header: "Mobile No",
    cell: ({ row }) =>
      row.original.patient?.mobile || row.original.patient_mobile || "-",
  },
  {
    accessorKey: "orReffBy",
    id: "orReffBy",
    header: "Referred By",
    cell: ({ row }) =>
      row.original.orReffBy ||
      row.original.doctor?.Name ||
      row.original.doctor_name ||
      "-",
  },
  {
    accessorKey: "status",
    id: "status",
    header: "Case Status",
    cell: ({ row }) => {
      const status = row.original.status || "Registered";
      return (
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0.5 font-normal ${
            status === "Approved"
              ? "border-blue-500 text-blue-700 bg-blue-50"
              : status === "Reported"
              ? "border-green-500 text-green-700 bg-green-50"
              : status === "InProcess"
              ? "border-amber-500 text-amber-700 bg-amber-50"
              : status === "Sampled"
              ? "border-purple-500 text-purple-700 bg-purple-50"
              : status === "Cancelled"
              ? "border-red-500 text-red-700 bg-red-50"
              : "border-gray-400 text-gray-700 bg-gray-50"
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
];
