"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  {
    id: "sl",
    header: "Serial No.",
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
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.getValue("header_name")}</span>
    ),
  },
  {
    accessorKey: "sortBy",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sort Order
        </Button>
      );
    },
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.getValue("sortBy") ?? 0}</span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="w-full text-right">Actions</div>,
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
        </div>
      );
    },
  },
];
