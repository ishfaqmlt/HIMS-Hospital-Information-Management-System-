"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  {
    id: "sl",
    header: "SL",
    cell: ({ row }) => <span className="text-xs">{row.index + 1}</span>,
  },
  {
    accessorKey: "header_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Header Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.getValue("header_name")}</span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const rowData = row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => onEdit(rowData.id)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-destructive"
            onClick={() => onDelete(rowData.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      );
    },
  },
];
