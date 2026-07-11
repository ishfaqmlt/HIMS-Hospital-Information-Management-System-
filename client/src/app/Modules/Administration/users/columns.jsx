"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown, UserCog, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getRoleBadgeColor = (roleName) => {
  const colors = {
    super_admin: "bg-red-100 text-red-700",
    admin: "bg-orange-100 text-orange-700",
    doctor: "bg-blue-100 text-blue-700",
    nurse: "bg-pink-100 text-pink-700",
    receptionist: "bg-green-100 text-green-700",
    pharmacist: "bg-purple-100 text-purple-700",
    lab_technician: "bg-amber-100 text-amber-700",
    accountant: "bg-teal-100 text-teal-700",
  };
  return colors[roleName] || "bg-gray-100 text-gray-700";
};

export const getColumns = ({ onAssignRole, onDelete }) => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="flex justify-start font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-start font-medium">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="flex justify-start font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-start">{row.getValue("email")}</div>
    ),
  },
  {
    id: "role",
    header: () => <div className="flex justify-start font-semibold">Role</div>,
    cell: ({ row }) => {
      const user = row.original;
      const roleName = user.roles?.[0]?.name || "No Role";
      return (
        <div className="flex justify-start">
          <Badge variant="secondary" className={getRoleBadgeColor(roleName)}>
            {roleName}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <div className="flex justify-start font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return <div className="flex justify-start">{`${day}-${month}-${year}`}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-end font-semibold">Actions</div>,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAssignRole(user)}
            title="Assign Role"
          >
            <UserCog className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(user.id)}
            title="Delete User"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];
