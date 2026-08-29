"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, MapPin, AlertCircle, ShieldAlert, FileText } from "lucide-react";

export const getMedicineColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "item_code",
    header: "Code / Barcode",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5 text-xs">
          <p className="font-mono font-bold text-slate-800">{item.item_code}</p>
          {item.barcode && (
            <p className="text-[10px] text-muted-foreground font-mono">
              BC: {item.barcode}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "brand_name",
    header: "Drug Brand & Formula",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-slate-900 text-xs">{item.brand_name}</p>
            {item.requires_prescription && (
              <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-300 font-semibold px-1 py-0">
                Rx
              </Badge>
            )}
            {item.is_narcotic && (
              <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-800 border-amber-300 font-bold px-1 py-0">
                Narcotic
              </Badge>
            )}
          </div>
          {item.generic_name && (
            <p className="text-[11px] text-emerald-700 font-medium">
              {item.generic_name}
            </p>
          )}
          {item.strength && (
            <p className="text-[10px] text-slate-500">
              Strength: <span className="text-slate-700 font-medium">{item.strength}</span>
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category_name",
    header: "Form / Category",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5 text-xs">
          {item.dosage_form_name && (
            <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-800 border-teal-200">
              {item.dosage_form_name}
            </Badge>
          )}
          {item.category_name && (
            <p className="text-[11px] text-slate-600 truncate max-w-[140px]">
              {item.category_name}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "manufacturer_name",
    header: "Manufacturer",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-xs text-slate-700 truncate max-w-[150px]">
          {item.manufacturer_name || <span className="text-slate-400">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "sale_price",
    header: "Pricing & Packaging",
    cell: ({ row }) => {
      const item = row.original;
      const salePrice = Number(item.sale_price || 0);
      const purchasePrice = Number(item.purchase_price || 0);
      const unit = item.sale_unit_name || "Unit";

      return (
        <div className="space-y-0.5 text-xs">
          <p className="font-mono font-bold text-emerald-700">
            Rs. {salePrice.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">/ {unit}</span>
          </p>
          {purchasePrice > 0 && (
            <p className="text-[10px] text-slate-500 font-mono">
              Cost: Rs. {purchasePrice.toFixed(2)}
            </p>
          )}
          {item.unit_conversion > 1 && (
            <p className="text-[10px] text-slate-400 font-mono">
              Pack: {item.unit_conversion} {unit}s/{item.purchase_unit_name || "Box"}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "rack_location",
    header: "Location / Reorder",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5 text-xs">
          {item.rack_location ? (
            <p className="flex items-center gap-1 font-mono text-slate-700 text-[11px]">
              <MapPin className="h-3 w-3 text-slate-400" />
              {item.rack_location}
            </p>
          ) : (
            <span className="text-slate-400 text-[11px]">-</span>
          )}
          <p className="text-[10px] text-muted-foreground">
            Min: <span className="font-bold text-slate-700">{item.min_reorder_level || 10}</span>
          </p>
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
          title="Edit Medicine"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(row.original)}
          className="h-7 w-7 p-0 text-slate-600 hover:text-destructive hover:bg-destructive/10"
          title="Delete Medicine"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    ),
  },
];
