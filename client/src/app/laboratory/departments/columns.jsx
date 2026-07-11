"use client"

import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { ArrowUpDown } from "lucide-react"

export const getColumns = ({ onEdit }) => [
  // {
  //   accessorKey: "id",
  //   header: () => (
  //     <div className=" font-semibold">
  //       ID
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="">
  //       {row.getValue("id")}
  //     </div>
  //   ),
  // },
  {
    accessorKey: "department_name",
     header: ({ column }) => {
      return (
        <div className="flex font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const department_name = row.getValue("department_name")
        return (
          <div className="flex ml-4 ">
            {department_name}
          </div>
        )
      },
  },
  {
    accessorKey: "isActive",
    header: () => (
      <div className="flex justify-center font-semibold">
        Status
      </div>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      return (
        <span
          className={` flex justify-center px-2 py-1 rounded-full text-sm  ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      )
    }
  },
    {
    id: "actions",
    header: () => (
      <div className="text-end">Actions</div>
    ),
    cell: ({ row }) => {
      const rowData = row.original

      return (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(rowData.id)}
            className="flex items-center gap-1"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      )
    },
  },
]