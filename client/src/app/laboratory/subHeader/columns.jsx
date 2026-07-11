"use client"

import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { ArrowUpDown } from "lucide-react"

export const getColumns = ({ onEdit }) => [
  
  {
    accessorKey: "sub_header_name",
     header: ({ column }) => {
      return (
        <div className="flex font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sub Header Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const sub_header_name = row.getValue("sub_header_name")
        return (
          <div className="flex ml-4 ">
            {sub_header_name}
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
        </div>
      )
    },
  },
]