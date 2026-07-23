"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "department.DepartmentName",
    header: "Department",
    cell: ({ row }) => row.original.department?.DepartmentName || "-",
  },
  {
    id: "serviceName",
    accessorFn: (row) => row.service?.ServiceName || "",
    header: "Service",
    cell: ({ row }) => row.original.service?.ServiceName || "-",
  },
  {
    id: "doctorName",
    accessorFn: (row) => row.doctor?.Name || "",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name || "-",
  },
  {
    accessorKey: "DoctorShare",
    header: "Doctor Share %",
    cell: ({ row }) => `${row.getValue("DoctorShare")}%`,
  },
  {
    accessorKey: "hospitalShare",
    header: "Hospital Share %",
    cell: ({ row }) => `${row.getValue("hospitalShare")}%`,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(item.Id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];
