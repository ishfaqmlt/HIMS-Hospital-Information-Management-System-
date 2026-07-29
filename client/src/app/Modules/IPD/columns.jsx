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
  Admitted: "bg-blue-100 text-blue-800 border-blue-300",
  Discharged: "bg-green-100 text-green-800 border-green-300",
  Transferred: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

export const getColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "AdmissionNo",
    header: "Admission No",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.AdmissionNo}</span>
    ),
  },
  {
    id: "patientName",
    accessorFn: (row) => row.patientVisit?.patient?.pName || "",
    header: "Patient",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.patientVisit?.patient?.pName || "-"}</p>
        <p className="text-xs text-muted-foreground">{row.original.patientVisit?.patient?.mrn || "-"}</p>
      </div>
    ),
  },
  {
    id: "mrn",
    accessorFn: (row) => row.patientVisit?.patient?.mrn || "",
    header: "MRN",
    cell: ({ row }) => row.original.patientVisit?.patient?.mrn || "-",
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor?.Name,
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name || "-",
  },
  {
    accessorKey: "AdmissionDate",
    header: "Admission Date",
    cell: ({ row }) => {
      const date = new Date(row.original.AdmissionDate);
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    },
  },
  {
    id: "floorName",
    accessorFn: (row) => row.floor?.FloorName || "",
    header: "Floor",
    cell: ({ row }) => row.original.floor?.FloorName || "-",
  },
  {
    id: "roomWardName",
    accessorFn: (row) => row.roomWard?.RoomWardName || "",
    header: "Room/Ward",
    cell: ({ row }) => row.original.roomWard?.RoomWardName || "-",
  },
  {
    id: "bedNo",
    accessorFn: (row) => row.bed?.BedNo || "",
    header: "Bed",
    cell: ({ row }) => row.original.bed?.BedNo || "-",
  },
  {
    accessorKey: "AdmissionType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.AdmissionType}</Badge>
    ),
  },
  {
    accessorKey: "Status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className={statusColors[row.original.Status]}>
        {row.original.Status}
      </Badge>
    ),
  },
  {
    accessorKey: "PayableAmount",
    header: "Payable",
    cell: ({ row }) => (
      <span className="font-medium">{Number(row.original.PayableAmount).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "TotalPaid",
    header: "Paid",
    cell: ({ row }) => (
      <span className="font-medium text-green-600">{Number(row.original.TotalPaid).toLocaleString()}</span>
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
