"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export const getColumns = ({ onEdit }) => [
  {
    id: "floorName",
    accessorFn: (row) => row.floor?.FloorName || "",
    header: "Floor",
    cell: ({ row }) => row.original.floor?.FloorName || "-",
  },
  {
    id: "roomWardName",
    accessorFn: (row) => row.room_ward?.RoomWardName || "",
    header: "Room/Ward",
    cell: ({ row }) => row.original.room_ward?.RoomWardName || "-",
  },
  {
    accessorKey: "BedNo",
    header: "Bed No",
  },
  {
    accessorKey: "Rent",
    header: "Rent",
    cell: ({ row }) => `Rs. ${Number(row.getValue("Rent")).toLocaleString()}`,
  },
  {
    accessorKey: "AcCharges",
    header: "AC Charges",
    cell: ({ row }) => `Rs. ${Number(row.getValue("AcCharges")).toLocaleString()}`,
  },
  {
    accessorKey: "isOccupied",
    header: "Occupied",
    cell: ({ row }) => {
      const occupied = row.getValue("isOccupied");
      return (
        <Badge variant={occupied ? "destructive" : "default"}>
          {occupied ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isFunctional",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isFunctional");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
