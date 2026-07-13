"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "doctor.Name",
    header: "Doctor",
    cell: ({ row }) => row.original.doctor?.Name || "-",
  },
  { accessorKey: "DayOfWeek", header: "Day" },
  { accessorKey: "StartTime", header: "Start Time" },
  { accessorKey: "EndTime", header: "End Time" },
  { accessorKey: "SlotTime", header: "Slot (min)" },
  {
    accessorKey: "BookingType",
    header: "Booking Type",
    cell: ({ row }) => {
      const val = row.getValue("BookingType");
      return <Badge variant={val === "advance" ? "default" : "secondary"}>{val}</Badge>;
    },
  },
  { accessorKey: "SilentSlots", header: "Silent Slots" },
  { accessorKey: "MaxBookings", header: "Max Bookings" },
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
          <Button variant="destructive" size="sm" onClick={() => onDelete(item.Id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
