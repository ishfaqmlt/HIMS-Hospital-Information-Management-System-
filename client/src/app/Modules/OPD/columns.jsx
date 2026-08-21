"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusColors = {
  Waiting: "bg-yellow-100 text-yellow-800 border-yellow-300",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

export const getColumns = ({ onEdit, onDelete, onView }) => [
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
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(item)}>
              <Eye className="h-4 w-4 mr-2" /> View Details
            </DropdownMenuItem>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(item.id || item.billing_id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
