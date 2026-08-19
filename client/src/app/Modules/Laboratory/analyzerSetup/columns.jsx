import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Wifi, Cable } from "lucide-react";

export const getColumns = ({ onEdit, onDelete }) => [
  {
    id: "srNo",
    header: "#",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium text-slate-600">
        {row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Analyzer Name",
    cell: ({ row }) => (
      <span className="font-bold text-xs text-slate-900">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    id: "manufacturerModel",
    header: "Manufacturer / Model",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <span className="text-xs text-slate-600">
          {item.manufacturer || "-"} {item.model ? `(${item.model})` : ""}
        </span>
      );
    },
  },
  {
    accessorKey: "communicationType",
    header: "Medium",
    cell: ({ row }) => {
      const type = row.getValue("communicationType");
      return type === "TCP" ? (
        <Badge
          variant="outline"
          className="bg-sky-50 text-sky-800 border-sky-300 font-mono text-[10px] gap-1"
        >
          <Wifi className="h-3 w-3 text-sky-600" /> TCP/IP
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-800 border-amber-300 font-mono text-[10px] gap-1"
        >
          <Cable className="h-3 w-3 text-amber-600" /> Serial (COM)
        </Badge>
      );
    },
  },
  {
    accessorKey: "protocol",
    header: "Protocol",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] font-bold font-mono">
        {row.getValue("protocol")}
      </Badge>
    ),
  },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => {
      const dir = row.getValue("direction");
      return (
        <span
          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${
            dir === "BIDIRECTIONAL"
              ? "bg-purple-50 text-purple-800 border-purple-300"
              : "bg-slate-100 text-slate-700 border-slate-300"
          }`}
        >
          {dir}
        </span>
      );
    },
  },
  {
    id: "endpoint",
    header: "Connection Endpoint",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <span className="text-xs font-mono text-slate-700">
          {item.communicationType === "TCP"
            ? `${item.host || "0.0.0.0"}:${item.port || 5100}`
            : `${item.comPort || "COM1"} (${item.baudRate || 9600}, ${item.parity || "None"}, ${item.dataBits || 8}, ${item.stopBits || 1})`}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("isActive");
      return active ? (
        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
          Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
          <span className="h-2 w-2 rounded-full bg-slate-300" /> Inactive
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-teal-700 hover:bg-teal-100"
            onClick={() => onEdit(item)}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-100"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
