"use client"

import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { ArrowUpDown } from "lucide-react"

export const getColumns = ({ onEdit }) => [
        
  {
    accessorFn: (row) => row.master_test?.testName,
    id: "testName",
     header: ({ column }) => {
      return (
        <div className="flex font-semibold">
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
        const testName = row.original.master_test?.testName
        return (
          <div className="flex ml-2 ">
            {testName}
          </div>
        )
      },
    size: 150, // Department name column width
  },
  {
    accessorFn: (row) => row.sub_header?.sub_header_name,
    id: "sub_header_name",
     header: ({ column }) => {
      return (
        <div className="flex font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sub Header
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const subHeaderName = row.original.sub_header?.sub_header_name
        return (
          <div className="flex ml-2 ">
            {subHeaderName}
          </div>
        )
      },
    size: 150, // Department name column width
  },
   {
    accessorKey: "parameterName",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Parameter Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const parameterName = row.getValue("parameterName")
        return (
          <div className="flex justify-center">
            {parameterName}
          </div>
        )
      },
  },
   {
    accessorKey: "defaultValue",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Default Value
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const defaultValue = row.getValue("defaultValue")
        return (
          <div className="flex justify-center">
            {defaultValue}
          </div>
        )
      },
  },
   {
    accessorKey: "units",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Units
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const units = row.getValue("units")
        return (
          <div className="flex justify-center">
            {units}
          </div>
        )
      },
  },
   {
    accessorKey: "resultDataType",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Result Data Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const resultDataType = row.getValue("resultDataType")
        return (
          <div className="flex justify-center">
            {resultDataType}
          </div>
        )
      },
  },
 
 
   {
    accessorKey: "sortNo",
     header: ({ column }) => {
      return (
        <div className="flex justify-center font-semibold">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sort No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      )
    },
      cell: ({ row }) => {
        const sortNo = row.getValue("sortNo")
        return (
          <div className="flex justify-center">
            {sortNo}
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