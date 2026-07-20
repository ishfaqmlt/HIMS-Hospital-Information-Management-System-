"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const getColumns = ({ onEdit }) => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isCredit",
    header: "Credit",
    cell: ({ row }) => {
      const isCredit = row.getValue("isCredit");
      return (
        <Badge variant={isCredit ? "default" : "secondary"}>
          {isCredit ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "validityHours",
    header: "Validity (Hrs)",
  },
  {
    accessorKey: "discount",
    header: "Discount %",
    cell: ({ row }) => {
      const discount = row.getValue("discount");
      return discount != null ? `${discount}%` : "-";
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
      const company = row.original;
      return (
        <Button variant="outline" size="sm" onClick={() => onEdit(company)}>
          Edit
        </Button>
      );
    },
  },
];
