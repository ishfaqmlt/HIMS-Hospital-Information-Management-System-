"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Settings2 } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

export const getColumns = ({ onEdit, onParameters }) => [
  {
    id: "sl",
    header: "SL",
    cell: ({ row }) => <span className="text-xs">{row.index + 1}</span>,
  },
  {
    accessorKey: "testCode",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Test Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.getValue("testCode")}</span>
    ),
  },
  {
    accessorKey: "testName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Test Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs font-medium">{row.getValue("testName")}</span>
    ),
  },
  {
    accessorFn: (row) => row.required_sample?.required_sample_name || "",
    id: "required_sample_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Required Sample
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-xs">{row.original.required_sample?.required_sample_name || "-"}</span>
    ),
  },
  {
    accessorKey: "testSort",
    header: () => <div className="text-center text-xs font-semibold">Sort</div>,
    cell: ({ row }) => (
      <div className="text-center text-xs">{row.getValue("testSort")}</div>
    ),
  },
  {
    accessorKey: "expectedTime",
    header: () => <div className="text-center text-xs font-semibold">Time (min)</div>,
    cell: ({ row }) => (
      <div className="text-center text-xs">{row.getValue("expectedTime") || "-"}</div>
    ),
  },
  {
    accessorKey: "isActive",
    header: () => <div className="text-center text-xs font-semibold">Status</div>,
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <span
          className={`inline-flex justify-center px-2 py-0.5 rounded text-[10px] font-semibold ${
            isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
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
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
            onClick={() => onParameters(rowData)}
          >
            <Settings2 className="h-3 w-3 mr-1" />
            Parameters
          </Button>
        </div>
      );
    },
  },
];
