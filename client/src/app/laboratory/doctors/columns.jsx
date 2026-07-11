"use client"

import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { ArrowUpDown } from "lucide-react"

export const getColumns = ({ onEdit }) => [
        
  
   {
    accessorKey: "doctorName",
     header: ({ column }) => {
      return (
        <div className="flex justify-start font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Doctor Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const doctorName = row.getValue("doctorName")
        return (
          <div className="flex justify-center">
            {doctorName}
          </div>
        )
      },
  },
   {
    accessorKey: "specialization",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Specialization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const specialization = row.getValue("specialization")
        return (
          <div className="flex justify-center">
            {specialization}
          </div>
        )
      },
  },
   {
    accessorKey: "phone",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Phone No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const phone = row.getValue("phone")
        return (
          <div className="flex justify-center">
            {phone}
          </div>
        )
      },
  },
   {
    accessorKey: "email",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const email = row.getValue("email")
        return (
          <div className="flex justify-center">
            {email}
          </div>
        )
      },
  },
 
 
   {
    accessorKey: "commissionPercentage",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Commission %
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const commissionPercentage = row.getValue("commissionPercentage")
        return (
          <div className="flex justify-center">
            {commissionPercentage}
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
            onClick={() => onEdit(rowData)}
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