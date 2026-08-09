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
    accessorKey: "VisitNo",
    header: "Visit No",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.VisitNo}</span>
    ),
  },
  {
    accessorKey: "patientId",
    header: "Patient",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.patient?.pName}</p>
        <p className="text-xs text-muted-foreground">{row.original.patient?.mrn}</p>
      </div>
    ),
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor?.Name,
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name,
  },
  {
    accessorKey: "VisitDate",
    header: "Visit Date",
    cell: ({ row }) => formatDate(row.original.VisitDate),
  },
  {
    accessorKey: "VisitType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.VisitType}</Badge>
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
    accessorKey: "ConsultationFee",
    header: "Fee",
    cell: ({ row }) => (
      <span className="font-medium">{Number(row.original.ConsultationFee).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "ChiefComplaint",
    header: "Chief Complaint",
    cell: ({ row }) => (
      <span className="text-sm truncate max-w-[200px] block">
        {row.original.ChiefComplaint || "-"}
      </span>
    ),
  },
  {
    accessorKey: "isPrescriptionGiven",
    header: "Prescription",
    cell: ({ row }) => (
      <Badge variant={row.original.isPrescriptionGiven ? "default" : "secondary"}>
        {row.original.isPrescriptionGiven ? "Given" : "No"}
      </Badge>
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
