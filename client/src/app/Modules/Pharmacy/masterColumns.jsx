"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";

// Columns for Pharmacy Units
export const getUnitColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "name",
    header: "Unit Name",
    cell: ({ row }) => (
      <span className="font-bold text-slate-900 text-xs">
        {row.original.name}
      </span>
    ),
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
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px] px-2 py-0.5"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px] px-2 py-0.5"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => onEdit(item)}
            title="Edit Unit"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onDelete(item)}
            title="Delete Unit"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];

// Columns for Pharmacy Dosage Forms
export const getDosageFormColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "name",
    header: "Formulation Name",
    cell: ({ row }) => (
      <span className="font-bold text-slate-900 text-xs">
        {row.original.name}
      </span>
    ),
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
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px] px-2 py-0.5"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px] px-2 py-0.5"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => onEdit(item)}
            title="Edit Dosage Form"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onDelete(item)}
            title="Delete Dosage Form"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];

// Columns for Pharmacy Categories
export const getCategoryColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "code",
    header: "Category Code",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
        {row.original.code || "—"}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => (
      <span className="font-bold text-slate-900 text-xs">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-xs text-slate-600 truncate max-w-xs block">
        {row.original.description || "—"}
      </span>
    ),
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
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px] px-2 py-0.5"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px] px-2 py-0.5"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => onEdit(item)}
            title="Edit Category"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onDelete(item)}
            title="Delete Category"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];

// Columns for Pharmacy Generics
export const getGenericColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "generic_name",
    header: "Generic Molecule Name",
    cell: ({ row }) => (
      <span className="font-bold text-slate-900 text-xs">
        {row.original.generic_name}
      </span>
    ),
  },
  {
    accessorKey: "therapeutic_class",
    header: "Therapeutic Class",
    cell: ({ row }) => (
      <span className="text-xs text-slate-700 font-medium">
        {row.original.therapeutic_class || "—"}
      </span>
    ),
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
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px] px-2 py-0.5"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px] px-2 py-0.5"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => onEdit(item)}
            title="Edit Generic Molecule"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onDelete(item)}
            title="Delete Generic Molecule"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];

// Columns for Pharmacy Manufacturers
export const getManufacturerColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "name",
    header: "Manufacturer Name",
    cell: ({ row }) => (
      <span className="font-bold text-slate-900 text-xs">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "contact_number",
    header: "Contact #",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-700">
        {row.original.contact_number || "—"}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-xs text-slate-600">
        {row.original.email || "—"}
      </span>
    ),
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <span className="text-xs text-slate-700 font-medium">
        {row.original.country || "Pakistan"}
      </span>
    ),
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
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px] px-2 py-0.5"
              : "bg-slate-100 text-slate-600 border-slate-300 font-medium text-[11px] px-2 py-0.5"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => onEdit(item)}
            title="Edit Manufacturer"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
            onClick={() => onDelete(item)}
            title="Delete Manufacturer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
