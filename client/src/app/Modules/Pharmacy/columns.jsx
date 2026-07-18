"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, AlertTriangle } from "lucide-react";

export const getColumns = ({ onEdit, onDelete, onView }) => [
  {
    accessorKey: "ItemCode",
    header: "Item Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ItemCode}</span>
    ),
  },
  {
    accessorKey: "ItemName",
    header: "Item Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.ItemName}</span>
    ),
  },
  {
    accessorKey: "Category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.Category || "-"}</Badge>
    ),
  },
  {
    accessorKey: "Manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.Manufacturer || "-"}</span>
    ),
  },
  {
    accessorKey: "StockQuantity",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.StockQuantity;
      const reorder = row.original.ReorderLevel;
      const isLow = stock <= reorder;
      return (
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isLow ? "text-red-600" : "text-green-600"}`}>
            {stock}
          </span>
          {isLow && <AlertTriangle className="h-4 w-4 text-red-500" />}
        </div>
      );
    },
  },
  {
    accessorKey: "PurchasePrice",
    header: "Purchase",
    cell: ({ row }) => (
      <span className="font-medium">{Number(row.original.PurchasePrice).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "SellingPrice",
    header: "Selling",
    cell: ({ row }) => (
      <span className="font-medium">{Number(row.original.SellingPrice).toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "BatchNo",
    header: "Batch",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.BatchNo || "-"}</span>
    ),
  },
  {
    accessorKey: "ExpiryDate",
    header: "Expiry",
    cell: ({ row }) => {
      const date = row.original.ExpiryDate;
      if (!date) return <span className="text-sm">-</span>;
      const expiry = new Date(date);
      const now = new Date();
      const isExpired = expiry < now;
      const isNearExpiry = expiry < new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      return (
        <span className={`text-sm ${isExpired ? "text-red-600 font-bold" : isNearExpiry ? "text-orange-600" : ""}`}>
          {expiry.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}
        </span>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(item)}>
              <Eye className="mr-2 h-4 w-4" />View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="mr-2 h-4 w-4" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(item.Id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
