"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusColors = {
  Waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

export const getColumns = ({ onSelect }) => [
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
      <span className="font-mono text-sm">{row.original.VisitNo || row.original.InvoiceNo}</span>
    ),
  },
  {
    accessorKey: "patientId",
    header: "Patient",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.patient_name || row.original.patient?.pName}</p>
        <p className="text-xs text-muted-foreground">{row.original.patient_mrn || row.original.patient?.mrn}</p>
      </div>
    ),
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor_name || row.doctor?.Name,
    header: "Doctor",
    cell: ({ row }) => row.original.doctor_name || row.original.doctor?.Name,
  },
  {
    accessorKey: "VisitDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.VisitDate || row.original.InvoiceDate),
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.Status || "Waiting";
      return (
        <Badge variant="outline" className={statusColors[status] || "bg-gray-100 text-gray-800"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "ConsultationFee",
    header: "Amount",
    cell: ({ row }) => {
      const fee = row.original.ConsultationFee || row.original.TotalAmount || 0;
      return <span className="font-medium">Rs. {Number(fee).toLocaleString()}</span>;
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <Button
          size="sm"
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7 px-3 flex items-center gap-1"
          onClick={() => onSelect && onSelect(item)}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Select
        </Button>
      );
    },
  },
];
