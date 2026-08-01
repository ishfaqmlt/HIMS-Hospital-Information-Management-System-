"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export const getColumns = ({ onEdit, onBill }) => [
  {
    id: "visitNo",
    accessorKey: "visitNo",
    header: "Visit No",
  },
  {
    id: "mrn",
    accessorFn: (row) => row.patient?.mrn || "",
    header: "MRN",
    cell: ({ row }) => row.original.patient?.mrn || "-",
  },
  {
    id: "pName",
    accessorFn: (row) => row.patient?.pName || "",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Patient Name
        </Button>
    ),
    cell: ({ row }) => row.original.patient?.pName || "-",
  },
  {
    id: "mobile",
    accessorFn: (row) => row.patient?.mobile || "",
    header: "Mobile",
    cell: ({ row }) => row.original.patient?.mobile || "-",
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor?.Name || "",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name || "-",
  },
  {
    id: "patientType",
    accessorFn: (row) => row.patient_type?.patientType || "",
    header: "Patient Type",
    cell: ({ row }) => row.original.patient_type?.patientType || "-",
  },
  {
    id: "insuranceCompany",
    accessorFn: (row) => row.insurance_company?.name || "",
    header: "Insurance Company",
    cell: ({ row }) => row.original.insurance_company?.name || "-",
  },
  {
    id: "visitDate",
    accessorKey: "visitDate",
    header: "Visit Date",
    cell: ({ row }) => {
      const date = row.getValue("visitDate");
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      const variantMap = {
        Waiting: "outline",
        "In Progress": "default",
        Completed: "secondary",
        Cancelled: "destructive",
      };
      return (
        <Badge variant={variantMap[status] || "default"}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const visit = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(visit)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBill(visit)}
          >
            <FileText className="h-4 w-4 mr-1" /> Bill
          </Button>
        </div>
      );
    },
  },
];
