"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "department.DepartmentName",
    header: "Department",
    cell: ({ row }) => row.original.department?.DepartmentName || "-",
  },
  {
    accessorKey: "doctor.Name",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name || "-",
  },
  {
    accessorKey: "service.ServiceName",
    header: "Service",
    cell: ({ row }) => row.original.service?.ServiceName || "-",
  },
  {
    accessorKey: "Charges",
    header: "Charges",
    cell: ({ row }) => `Rs. ${Number(row.getValue("Charges")).toLocaleString()}`,
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
        </div>
      );
    },
  },
];
