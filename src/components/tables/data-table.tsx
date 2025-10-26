"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusIcon, FunnelIcon } from "@heroicons/react/16/solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
};

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [isToggled, setIsToggled] = useState(false);
  const [sortOption, setSortOption] = useState("Newest");
  const [statusFilter, setStatusFilter] = useState("All");

  const pathname = usePathname();

  // Define visibility rules based on pathname
  const visibilityConfig = {
    "/dashboard": {
      showSearch: true,
      showFilter: true,
      showToggle: true,
      showAdd: true,
    },
    "/users": {
      showSearch: true,
      showFilter: true,
      showToggle: true,
      showAdd: true,
    },
    "/settings": {
      showSearch: false,
      showFilter: false,
      showToggle: true,
      showAdd: false,
    },
    default: {
      showSearch: false,
      showFilter: false,
      showToggle: false,
      showAdd: false,
    },
  };

  // Determine visibility based on the current pathname
  const currentConfig =
    visibilityConfig[pathname as keyof typeof visibilityConfig] ||
    visibilityConfig.default;

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    if (sort === "Newest") {
      table.getColumn("createdAt")?.toggleSorting(false); // Ascending for newest
    } else if (sort === "Oldest") {
      table.getColumn("createdAt")?.toggleSorting(true); // Descending for oldest
    }
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    // Add logic to filter by status if needed
  };

  return (
    <div className="space-y-4">
      {/* Filter and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search Input and Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentConfig.showSearch && (
            <input
              placeholder="Search here..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="hidden sm:block max-w-full sm:max-w-sm w-full rounded-md px-3 py-2 text-sm text-gray-900 
                placeholder-[#A64DFF] border-2 border-transparent 
                [border-image:linear-gradient(to_bottom,#8000FF,#DE00FF)1] 
                bg-white focus:outline-none focus:ring-0"
            />
          )}

          {currentConfig.showFilter && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 text-[#8000FF] border-[#8000FF]"
                >
                  <FunnelIcon className="w-4 h-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white shadow-lg">
                <DropdownMenuLabel>Sort by:</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleSortChange("Newest")}
                  className={`cursor-pointer hover:bg-gradient-to-b hover:from-[#8000FF] hover:to-[#DE00FF] hover:text-white ${sortOption === "Newest" ? "bg-gradient-to-b from-[#8000FF] to-[#DE00FF] text-white" : ""
                    }`}
                >
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSortChange("Oldest")}
                  className={`cursor-pointer hover:bg-gradient-to-b hover:from-[#8000FF] hover:to-[#DE00FF] hover:text-white ${sortOption === "Oldest" ? "bg-gradient-to-b from-[#8000FF] to-[#DE00FF] text-white" : ""
                    } cursor-pointer`}
                >
                  Oldest
                </DropdownMenuItem>
                <DropdownMenuLabel>Status:</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("Active")}
                  className={`cursor-pointer hover:bg-gradient-to-b hover:from-[#8000FF] hover:to-[#DE00FF] hover:text-white ${statusFilter === "Active" ? "bg-gradient-to-b from-[#8000FF] to-[#DE00FF] text-white" : ""
                    } cursor-pointer`}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("Inactive")}
                  className={`cursor-pointer hover:bg-gradient-to-b hover:from-[#8000FF] hover:to-[#DE00FF] hover:text-white ${statusFilter === "Inactive" ? "bg-gradient-to-b from-[#8000FF] to-[#DE00FF] text-white" : ""
                    } cursor-pointer`}
                >
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Toggle & Add Buttons */}
        {(currentConfig.showToggle || currentConfig.showAdd) && (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${isToggled ? "text-green-600" : "text-red-600"
                }`}
            >
              {isToggled ? "Active" : "Inactive"}
            </span>

            {currentConfig.showToggle && (
              <div className="flex items-center gap-2">
                <label className="flex items-center cursor-pointer hidden sm:flex relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isToggled}
                    onChange={() => setIsToggled(!isToggled)}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full border-2 border-gray-300 transition-colors ${isToggled ? "bg-[#A64DFF]" : "bg-gray-200"
                      }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${isToggled ? "translate-x-4" : "translate-x-0"
                      }`}
                  ></div>
                </label>
              </div>
            )}


            {currentConfig.showAdd && (
              <Button
                size="sm"
                className="bg-gradient-to-b from-[#8000FF] to-[#DE00FF] text-white"
              >
                <PlusIcon className="w-4 h-4" /> Add
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Table Display */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className="cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}