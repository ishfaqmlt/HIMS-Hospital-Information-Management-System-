"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  { accessorKey: "Name", header: "Name" },
  { accessorKey: "Phone", header: "Phone" },
  { accessorKey: "Email", header: "Email" },
  {
    accessorKey: "EmployeementStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("EmployeementStatus");
      const variant = status === "Active" ? "default" : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const doctor = row.original;
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(doctor)}>
            <Pencil className="h-4 w-4" />
          </Button>
         
        </div>
      );
    },
  },
];
