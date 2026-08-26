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
    accessorKey: "service_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("service_type") || "general_charge";
      const colors = {
        investigation: "bg-amber-100 text-amber-900 border-amber-300",
        consultation: "bg-blue-100 text-blue-900 border-blue-300",
        procedure: "bg-purple-100 text-purple-900 border-purple-300",
        nursing: "bg-teal-100 text-teal-900 border-teal-300",
        general_charge: "bg-slate-100 text-slate-700 border-slate-200",
      };
      const labels = {
        investigation: "Investigation",
        consultation: "Consultation",
        procedure: "Procedure",
        nursing: "Nursing",
        general_charge: "General",
      };
      return (
        <Badge variant="outline" className={`font-medium text-xs ${colors[type] || ""}`}>
          {labels[type] || type}
        </Badge>
      );
    },
  },
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
