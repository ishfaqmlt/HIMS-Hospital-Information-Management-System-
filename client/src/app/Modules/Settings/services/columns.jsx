"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  { accessorKey: "Code", header: "Code" },
  {
    accessorKey: "department.DepartmentName",
    header: "Department",
    cell: ({ row }) => row.original.department?.DepartmentName || "-",
  },
  { accessorKey: "ServiceName", header: "Service Name" },
  {
    accessorKey: "DefaultCharges",
    header: "Charges",
    cell: ({ row }) => `Rs. ${Number(row.getValue("DefaultCharges")).toLocaleString()}`,
  },
  {
    accessorKey: "printToken",
    header: "Print Token",
    cell: ({ row }) => {
      const val = row.getValue("printToken");
      return <Badge variant={val ? "default" : "secondary"}>{val ? "Yes" : "No"}</Badge>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return <Badge variant={isActive ? "default" : "destructive"}>{isActive ? "Active" : "Inactive"}</Badge>;
    },
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
