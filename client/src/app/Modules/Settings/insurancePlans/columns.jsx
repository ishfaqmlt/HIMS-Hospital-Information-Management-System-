"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const getColumns = ({ onEdit }) => [
  {
    accessorKey: "company.name",
    header: "Company",
  },
  {
    accessorKey: "planName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Plan Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "coverageDetails",
    header: "Coverage Details",
    cell: ({ row }) => {
      const details = row.getValue("coverageDetails");
      return details ? (details.length > 40 ? details.substring(0, 40) + "..." : details) : "-";
    },
  },
  {
    accessorKey: "CoveragePercent",
    header: "Coverage %",
    cell: ({ row }) => `${row.getValue("CoveragePercent")}%`,
  },
  {
    accessorKey: "AnnualLimit",
    header: "Annual Limit",
    cell: ({ row }) => {
      const limit = row.getValue("AnnualLimit");
      return limit != null ? `Rs. ${Number(limit).toLocaleString()}` : "-";
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
          Edit
        </Button>
      );
    },
  },
];
