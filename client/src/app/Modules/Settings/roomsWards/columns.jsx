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
    accessorKey: "RoomWardType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("RoomWardType");
      return (
        <Badge variant={type === "Private Room" ? "default" : "secondary"}>
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "RoomWardName",
    header: "Room/Ward Name",
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
