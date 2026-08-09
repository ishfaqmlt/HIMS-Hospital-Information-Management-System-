"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const getColumns = ({ onEdit }) => [
  {
    accessorKey: "mrn",
    header: "MRN",
  },
  {
    accessorKey: "pName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Patient Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "gName",
    header: "Guardian Name",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "dob",
    header: "DOB",
    cell: ({ row }) => {
      const dob = row.getValue("dob");
      if (!dob) return "-";
      return formatDate(dob);
    },
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "cnic",
    header: "CNIC",
  },
  {
    accessorKey: "email",
    header: "Email",
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
      const patient = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(patient)}
          >
            Edit
          </Button>
        </div>
      );
    },
  },
];
