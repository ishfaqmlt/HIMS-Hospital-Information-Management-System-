"use client"

import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { ArrowUpDown } from "lucide-react"

export const getColumns = ({ onEdit ,onParameter}) => [
  
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
  //   size: 0, // Set column width to 100px
  // },
  {
    accessorFn: (row) => row.department?.department_name,
    id: "department_name",
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
        const departmentName = row.original.department?.department_name
        return (
          <div className="flex ml-2 ">
            {departmentName}
          </div>
        )
      },
    size: 150, // Department name column width
  },
   {
    accessorKey: "testName",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Test Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const testName = row.getValue("testName")
        return (
          <div className="flex justify-center">
            {testName}
          </div>
        )
      },
  },
  {
    accessorFn: (row) => row.required_sample?.required_sample_name,
    id: "required_sample_name",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Required Sample
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const requiredSample = row.original.required_sample?.required_sample_name
        return (
          <div className="flex justify-center">
            {requiredSample}
          </div>
        )
      },
  },
  {
    accessorFn: (row) => row.sample_perform?.sample_perform,
    id: "sample_perform",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sample Perform
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const samplePerform = row.original.sample_perform?.sample_perform
        return (
          <div className="flex justify-center">
            {samplePerform}
          </div>
        )
      },
  },
  {
    accessorFn: (row) => row.reported_at?.reported_at,
    id: "reported_at",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reported At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const reportedAt = row.original.reported_at?.reported_at
        return (
          <div className="flex justify-center">
            {reportedAt}
          </div>
        )
      },
  },
 
  {
    accessorKey: "price",
    header: () => (
      <div className="flex justify-center font-semibold">
        Price
      </div>
    ),
    cell: ({ row }) => {
      const price = row.getValue("price")
      return (
        <div className="flex justify-center">
          {price.toFixed(0)}
        </div>
      )
    }
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => onParameter(rowData)}
            className="flex items-center gap-1 ml-2"
          >
            <Pencil className="h-4 w-4" />
            Parameters
          </Button>
        </div>
      )
    },
  },
]