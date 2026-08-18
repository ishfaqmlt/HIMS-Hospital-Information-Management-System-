"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileText, Pencil, RotateCcw, Lock, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const checkIsPosted = (val) => {
  if (val === null || val === undefined) return false;
  if (val === 0 || val === "0" || val === false || val === "false") return false;
  return Boolean(val);
};

export const getColumns = ({ onPrint, onPrintA4, onEdit, onReturn, onPost }) => [
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
    cell: ({ row }) => formatDate(row.getValue("InvoiceDate")),
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
      const item = row.original;
      const status = row.getValue("PaymentStatus");
      const isPosted = checkIsPosted(item.isPosted);

      const color =
        status === "Paid"
          ? "bg-green-100 text-green-700"
          : status === "Partial"
          ? "bg-yellow-100 text-yellow-700"
          : status === "Partially Returned"
          ? "bg-amber-100 text-amber-800 border border-amber-300 font-semibold"
          : status === "Returned"
          ? "bg-purple-100 text-purple-700 font-semibold"
          : status === "Cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

      return (
        <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${color}`}>
            {status}
          </span>
          {isPosted && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-0.5" title="Invoice Posted">
              <Lock className="h-2.5 w-2.5" /> Posted
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      const isPosted = checkIsPosted(item.isPosted);
      const isFullyReturned = item.PaymentStatus === "Returned" || item.isFullyReturned;
      const isPartiallyReturned = item.PaymentStatus === "Partially Returned" || item.isPartiallyReturned;

      const canEdit = !isPosted && item.BillType !== "Return" && item.PaymentStatus !== "Cancelled" && !isFullyReturned && !isPartiallyReturned;
      const canReturn = item.BillType !== "Return" && item.PaymentStatus !== "Cancelled" && !isFullyReturned;
      const canPost = !isPosted && item.PaymentStatus !== "Cancelled";

      return (
        <div className="flex gap-1">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(item)} title="Edit Invoice">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {canPost && onPost && (
            <Button variant="outline" size="sm" className="text-emerald-700 hover:text-emerald-900 border-emerald-300 hover:bg-emerald-50" onClick={() => onPost(item)} title="Post Invoice (Lock Record)">
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onPrint(item)} title="Print Thermal">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPrintA4(item)} title="Print A4">
            <FileText className="h-4 w-4" />
          </Button>
          {canReturn && (
            <Button variant="outline" size="sm" onClick={() => onReturn(item)} title={isPartiallyReturned ? "Return Remaining Services" : "Return Invoice"}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
