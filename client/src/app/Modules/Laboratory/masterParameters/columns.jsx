"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Activity } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

export const getColumns = ({ onEdit, onDelete, onBoundings }) => [
  {
    id: "sl",
    header: "SL",
    cell: ({ row }) => <span className="text-xs">{row.index + 1}</span>,
  },
  {
    accessorFn: (row) => row.sub_header?.sub_header_name,
    id: "sub_header_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sub Header
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs">{row.original.sub_header?.sub_header_name}</span>
    ),
  },
  {
    accessorKey: "parameterName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Parameter Name
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.getValue("parameterName")}</span>
    ),
  },
  {
    accessorKey: "defaultValue",
    header: "Default",
    cell: ({ row }) => (
      <span className="text-xs">{row.getValue("defaultValue")}</span>
    ),
  },
  {
    accessorKey: "units",
    header: "Unit",
    cell: ({ row }) => (
      <span className="text-xs">{row.getValue("units")}</span>
    ),
  },
  {
    accessorKey: "decimal",
    header: "Decimal",
    cell: ({ row }) => (
      <span className="text-xs">{row.getValue("decimal")}</span>
    ),
  },
  {
    accessorKey: "sortNo",
    header: () => <div className="text-right">Sort</div>,
    cell: ({ row }) => (
      <div className="text-xs">{row.getValue("sortNo")}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <span
          className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
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
            onClick={() => onEdit(rowData)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
          {onBoundings && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
              onClick={() => onBoundings(rowData)}
            >
              <Activity className="h-3 w-3 mr-1" />
              Advance Bounding
            </Button>
          )}
        </div>
      );
    },
  },
];
