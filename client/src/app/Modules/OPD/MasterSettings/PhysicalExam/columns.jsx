"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";

export const getColumns = ({ onEdit }) => [
  {
    accessorKey: "name",
    header: "Exam Name",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900 text-xs">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = Boolean(row.original.is_active);
      return (
        <Badge
          variant="outline"
          className={
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px] px-2 py-0.5"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px] px-2 py-0.5"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => onEdit(item)}
            title="Edit Physical Exam"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
