"use client"

import { Button } from "@/components/ui/button"
import { Delete, Pencil } from "lucide-react"
import { ArrowUpDown } from "lucide-react"

export const getColumns = ({ onEdit, onDelete }) => [
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
    accessorKey: "name",
     header: ({ column }) => {
      return (
        <div className="flex font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const name = row.getValue("name")
        return (
          <div className="flex ml-4 ">
            {name}
          </div>
        )
      },
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(rowData.id)}
            className="flex items-center gap-1"
          >
            <Delete className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )
    },
  },
]