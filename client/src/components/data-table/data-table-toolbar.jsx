"use client"

import { Input } from "@/components/ui/input"

export function DataTableToolbar({ table, filterColumn }) {
  return (
    <div className="flex items-center justify-between">

      {filterColumn && (
        <Input
          placeholder="Search..."
          value={
            (table
              .getColumn(filterColumn)
              ?.getFilterValue()) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn(filterColumn)
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}

    </div>
  )
}