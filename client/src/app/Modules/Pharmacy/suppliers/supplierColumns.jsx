"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";

export const getSupplierColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "name",
    header: "Supplier / Distributor",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900 text-xs">{item.name}</p>
          {item.contact_person && (
            <p className="text-[11px] text-muted-foreground">
              Contact: <span className="text-slate-700 font-medium">{item.contact_person}</span>
            </p>
          )}
          {item.city && (
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              {item.city}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "mobile",
    header: "Contact Info",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5 text-xs">
          {item.mobile ? (
            <p className="flex items-center gap-1 text-slate-700 font-mono">
              <Phone className="h-3 w-3 text-emerald-600" />
              {item.mobile}
            </p>
          ) : item.phone ? (
            <p className="flex items-center gap-1 text-slate-600 font-mono">
              <Phone className="h-3 w-3 text-slate-400" />
              {item.phone}
            </p>
          ) : (
            <span className="text-slate-400 text-[11px]">-</span>
          )}
          {item.email && (
            <p className="flex items-center gap-1 text-slate-500 text-[11px] truncate max-w-[160px]">
              <Mail className="h-3 w-3 text-teal-600" />
              {item.email}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "drug_license_no",
    header: "Tax / License",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5 text-[11px]">
          {item.drug_license_no && (
            <p className="text-slate-700 font-mono">
              Lic: <strong className="text-slate-900">{item.drug_license_no}</strong>
            </p>
          )}
          {item.ntn_number && (
            <p className="text-slate-500 font-mono">NTN: {item.ntn_number}</p>
          )}
          {!item.drug_license_no && !item.ntn_number && (
            <span className="text-slate-400">-</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "current_balance",
    header: "Current Payable",
    cell: ({ row }) => {
      const balance = Number(row.original.current_balance || 0);
      return (
        <div className="font-mono text-xs">
          <span className={balance > 0 ? "font-bold text-rose-600" : "font-medium text-slate-700"}>
            Rs. {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = Boolean(row.original.is_active);
      return (
        <Badge
          variant="outline"
          className={
            isActive
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-medium text-[11px]"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px]"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(row.original)}
          className="h-7 w-7 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
          title="Edit Supplier"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row.original)}
          className="h-7 w-7 p-0 text-slate-600 hover:text-destructive hover:bg-destructive/10"
          title="Delete Supplier"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    ),
  },
];
