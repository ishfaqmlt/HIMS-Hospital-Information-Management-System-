"use client"

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

export const getColumns = ({ onEdit }) => [
  {
    accessorKey: "branchCode",
    header: ({ column }) => (
      <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("branchCode")}</div>
    ),
  },
  {
    accessorKey: "branchName",
    header: ({ column }) => (
      <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("branchName")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: () => (
      <div className="flex justify-center font-semibold">Phone</div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("phone")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => (
      <div className="flex justify-center font-semibold">Email</div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "city",
    header: () => (
      <div className="flex justify-center font-semibold">City</div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">{row.getValue("city")}</div>
    ),
  },
  {
    accessorKey: "isMainBranch",
    header: () => (
      <div className="flex justify-center font-semibold">Main Branch</div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("isMainBranch");
      return (
        <span
          className={`flex justify-center px-2 py-1 rounded-full text-sm ${
            value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Yes" : "No"}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: () => (
      <div className="flex justify-center font-semibold">Status</div>
    ),
    cell: ({ row }) => {
      const value = row.getValue("isActive");
      return (
        <span
          className={`flex justify-center px-2 py-1 rounded-full text-sm ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-end">Actions</div>,
    cell: ({ row }) => {
      const rowData = row.original;

      return (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(rowData)}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      );
    },
  },
];
