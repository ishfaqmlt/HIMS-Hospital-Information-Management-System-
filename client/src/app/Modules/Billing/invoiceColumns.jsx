"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileText, Pencil, RotateCcw } from "lucide-react";

export const getColumns = ({ onPrint, onPrintA4, onEdit, onReturn }) => [
  {
    accessorKey: "InvoiceNo",
    header: "Invoice No",
  },
  {
    id: "mrn",
    accessorFn: (row) => row.patientVisit?.patient?.mrn || "",
    header: "MRN",
    cell: ({ row }) => row.original.patientVisit?.patient?.mrn || "-",
  },
  {
    id: "patientName",
    accessorFn: (row) => row.patientVisit?.patient?.pName || "",
    header: "Patient Name",
    cell: ({ row }) => row.original.patientVisit?.patient?.pName || "-",
  },
  {
    id: "mobile",
    accessorFn: (row) => row.patientVisit?.patient?.mobile || "",
    header: "Mobile",
    cell: ({ row }) => row.original.patientVisit?.patient?.mobile || "-",
  },
  {
    accessorKey: "InvoiceDate",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("InvoiceDate"));
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor?.Name || "",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name || "-",
  },
  {
    id: "departmentName",
    accessorFn: (row) => row.department?.DepartmentName || "",
    header: "Department",
    cell: ({ row }) => row.original.department?.DepartmentName || "-",
  },
  {
    accessorKey: "SubTotal",
    header: "SubTotal",
    cell: ({ row }) => Number(row.getValue("SubTotal")).toFixed(2),
  },
  {
    accessorKey: "Discount",
    header: "Discount",
    cell: ({ row }) => Number(row.getValue("Discount")).toFixed(2),
  },
  {
    accessorKey: "TotalAmount",
    header: "Total",
    cell: ({ row }) => Number(row.getValue("TotalAmount")).toFixed(2),
  },
  {
    accessorKey: "PaymentStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("PaymentStatus");
      const color =
        status === "Paid"
          ? "bg-green-100 text-green-700"
          : status === "Partial"
          ? "bg-yellow-100 text-yellow-700"
          : status === "Cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      const canEdit = item.BillType !== "Return" && item.PaymentStatus !== "Cancelled";
      return (
        <div className="flex gap-1">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(item)} title="Edit Invoice">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onPrint(item)} title="Print Thermal">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPrintA4(item)} title="Print A4">
            <FileText className="h-4 w-4" />
          </Button>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onReturn(item)} title="Return Invoice">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
