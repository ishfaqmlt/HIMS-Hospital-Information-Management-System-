"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Clock } from "lucide-react";

export const getColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "ScanCode",
    header: "Scan Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ScanCode}</span>
    ),
  },
  {
    accessorKey: "ScanName",
    header: "Scan Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ScanName}</span>
    ),
  },
  {
    accessorKey: "Category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.Category || "-"}</Badge>
    ),
  },
  {
    id: "departmentName",
    accessorFn: (row) => row.department?.DepartmentName,
    header: "Department",
    cell: ({ row }) => row.original.department?.DepartmentName || "-",
  },
  {
    accessorKey: "Price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-medium">{Number(row.original.Price).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "DurationMinutes",
    header: "Duration",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span className="text-sm">{row.original.DurationMinutes} min</span>
      </div>
    ),
  },
  {
    accessorKey: "PreparationNotes",
    header: "Preparation",
    cell: ({ row }) => (
      <span className="text-sm truncate max-w-[200px] block">
        {row.original.PreparationNotes || "-"}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(item)}>
              <Eye className="mr-2 h-4 w-4" />View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item.Id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
