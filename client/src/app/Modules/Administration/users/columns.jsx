"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown, UserCog, Power } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getRoleBadgeColor = (roleName) => {
  const colors = {
    super_admin: "bg-red-100 text-red-700 border-red-300",
    admin: "bg-orange-100 text-orange-700 border-orange-300",
    doctor: "bg-blue-100 text-blue-700 border-blue-300",
    nurse: "bg-pink-100 text-pink-700 border-pink-300",
    receptionist: "bg-green-100 text-green-700 border-green-300",
    pharmacist: "bg-purple-100 text-purple-700 border-purple-300",
    lab_technician: "bg-amber-100 text-amber-700 border-amber-300",
    accountant: "bg-teal-100 text-teal-700 border-teal-300",
  };
  return colors[roleName] || "bg-gray-100 text-gray-700 border-gray-300";
};

export const getColumns = ({ onAssignRole, onToggleStatus }) => [
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
          <Badge variant="outline" className={getRoleBadgeColor(roleName)}>
            {roleName}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "status",
    header: () => <div className="flex justify-start font-semibold">Status</div>,
    cell: ({ row }) => {
      const isActive = row.original.is_active !== false;
      return (
        <div className="flex justify-start items-center gap-2">
          {isActive ? (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">
              Inactive
            </Badge>
          )}
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
      const isActive = user.is_active !== false;
      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleStatus(user)}
            title={isActive ? "Deactivate User" : "Activate User"}
            className={isActive ? "text-emerald-600 hover:text-emerald-700" : "text-rose-500 hover:text-rose-600"}
          >
            <Power className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAssignRole(user)}
            title="Assign Role"
          >
            <UserCog className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
