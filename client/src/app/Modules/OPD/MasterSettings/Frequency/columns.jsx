"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "frequency",
    header: "Frequency Name",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-900 text-xs" dir="auto">
        {row.original.frequency}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = Boolean(row.original.isActive);
      return (
        <Badge
          variant="outline"
          className={
            active
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px] px-2 py-0.5"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px] px-2 py-0.5"
          }
        >
          {active ? "Active" : "Inactive"}
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
            className="h-7 w-7 p-0 text-slate-600 hover:text-teal-700 hover:bg-teal-50 cursor-pointer"
            onClick={() => onEdit(item)}
            title="Edit Frequency"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              onClick={() => onDelete(item)}
              title="Delete Frequency"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
