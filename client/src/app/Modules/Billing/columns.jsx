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

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Partial: "bg-orange-100 text-orange-800 border-orange-300",
  Paid: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

const typeColors = {
  OPD: "bg-blue-100 text-blue-800 border-blue-300",
  IPD: "bg-indigo-100 text-indigo-800 border-indigo-300",
  Emergency: "bg-red-100 text-red-800 border-red-300",
  Laboratory: "bg-amber-100 text-amber-800 border-amber-300",
  Pharmacy: "bg-green-100 text-green-800 border-green-300",
  Radiology: "bg-purple-100 text-purple-800 border-purple-300",
  Other: "bg-gray-100 text-gray-800 border-gray-300",
};

export const getColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "InvoiceNo",
    header: "Invoice No",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.InvoiceNo}</span>
    ),
  },
  {
    accessorKey: "patientId",
    header: "Patient",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.patient?.pName}</p>
        <p className="text-xs text-muted-foreground">{row.original.patient?.patientId}</p>
      </div>
    ),
  },
  {
    accessorKey: "InvoiceDate",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.InvoiceDate);
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    },
  },
  {
    accessorKey: "InvoiceType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className={typeColors[row.original.InvoiceType]}>
        {row.original.InvoiceType}
      </Badge>
    ),
  },
  {
    accessorKey: "TotalAmount",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium">{Number(row.original.TotalAmount).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "PaidAmount",
    header: "Paid",
    cell: ({ row }) => (
      <span className="font-medium text-green-600">{Number(row.original.PaidAmount).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "Balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className={`font-medium ${row.original.Balance > 0 ? "text-red-600" : "text-green-600"}`}>
        {Number(row.original.Balance).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "PaymentStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={statusColors[row.original.PaymentStatus]}>
        {row.original.PaymentStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "PaymentMethod",
    header: "Method",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.PaymentMethod}</span>
    ),
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
              <Eye className="mr-2 h-4 w-4" />View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item.Id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
