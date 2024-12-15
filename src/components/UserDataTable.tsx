"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  FilterFn,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

// Global filter function
const globalFilter: FilterFn<any> = (row, columnId, filterValue) => {
  return row
    .getAllCells()
    .some((cell) =>
      String(cell.getValue())
        .toLowerCase()
        .includes(filterValue.toLowerCase())
    );
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]; // Column definitions
  data: TData[]; // Table data
  verifyUser: (uuid: string, verified: boolean) => void;
}

export function UserDataTable<TData, TValue>({
  columns,
  data,
  verifyUser
}: DataTableProps<TData, TValue>) {
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilterValue,
    globalFilterFn: globalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: globalFilterValue,
    },
  });

  return (
    <div className="rounded-md">
      {/* Global Filter Input */}
      <input
        type="text"
        placeholder="Filter Users..."
        value={globalFilterValue}
        onChange={(event) => setGlobalFilterValue(event.target.value)}
        className="p-3 outline-none rounded-lg border w-[30%] mb-5"
      />
      <Table className="border">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1 text-white rounded ${row.original.verified ? "bg-red-500" : "bg-blue-500"} `}
                      onClick={() => verifyUser(row.original.uuid, !row.original.verified)}
                    >
                     { row.original.verified ? "Unverify" : "Verify" }
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
