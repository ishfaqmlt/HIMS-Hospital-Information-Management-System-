"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ArrowUpDown } from "lucide-react"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

export function DataTable({ columns, data, filterColumn, renderSubComponent, getRowCanExpand }) {
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [rowSelection, setRowSelection] = React.useState({})
  const [expanded, setExpanded] = React.useState({})

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
      rowSelection,
      expanded,
    },

    enableRowSelection: true,
    getRowCanExpand: getRowCanExpand || (() => !!renderSubComponent),

    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div className="space-y-4">

      <DataTableToolbar table={table} filterColumn={filterColumn} />

      <div className="rounded-md border">
        <Table>

          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      className={canSort ? "cursor-pointer select-none" : ""}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className="flex items-center gap-1"
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>

                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>

                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}

                      </TableCell>
                    ))}

                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableCell colSpan={row.getVisibleCells().length} className="p-3 pl-8">
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>

                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.

                </TableCell>

              </TableRow>
            )}
          </TableBody>

        </Table>
      </div>

      <DataTablePagination table={table} />

    </div>
  )
}