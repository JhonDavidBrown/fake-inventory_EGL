"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw } from "lucide-react";

interface ManoObraTableSimpleProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  error: Error | null;
  state: {
    sorting: SortingState;
    columnFilters: ColumnFiltersState;
    globalFilter: string;
    rowSelection: RowSelectionState;
    pagination: PaginationState;
  };
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onGlobalFilterChange: (filter: string) => void;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  onPaginationChange: OnChangeFn<PaginationState>;
}

export function ManoObraTableSimple<TData, TValue>({
  columns,
  data,
  loading,
  error,
  state,
  onSortingChange,
  onColumnFiltersChange,
  onGlobalFilterChange,
  onRowSelectionChange,
  onPaginationChange,
}: ManoObraTableSimpleProps<TData, TValue>) {

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: state.sorting,
      columnFilters: state.columnFilters,
      globalFilter: state.globalFilter,
      rowSelection: state.rowSelection,
      pagination: state.pagination,
    },
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    globalFilterFn: "includesString",
    autoResetPageIndex: false,
    // ✅ IMPORTANTE: Usar referencia como ID único para selección
    getRowId: (row: any) => {
      console.log(`🔑 [ManoObraTable] getRowId llamado:`, {
        referencia: row.referencia,
        tipo: typeof row.referencia,
        asString: row.referencia?.toString()
      });
      return row.referencia?.toString() || String(Math.random());
    },
  });

  // Mostrar error si existe
  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-center">
        <div className="text-red-600">
          <p className="font-medium">Error al cargar los datos</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Cargando...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col gap-4 px-2">
        {/* ✅ MÓVIL: Estructura en dos filas */}
        <div className="flex sm:hidden flex-col gap-4">
          {/* Información de filas seleccionadas - MÓVIL */}
          <div className="text-sm text-muted-foreground text-center">
            {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
          </div>
          
          {/* Información de página - MÓVIL */}
          <div className="text-sm font-medium text-center">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          
          {/* Controles en la misma fila - MÓVIL */}
          <div className="flex items-center justify-between w-full">
            {/* Filas por página */}
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium whitespace-nowrap">Filas por página</p>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[78px]">
                  <SelectValue>
                    {table.getState().pagination.pageSize}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ✅ DESKTOP: Todo en una sola fila */}
        <div className="hidden sm:flex items-center justify-between w-full">
          {/* Información de filas seleccionadas - DESKTOP */}
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
          </div>

          {/* Controles de paginación agrupados a la derecha - DESKTOP */}
          <div className="flex items-center gap-6">
            {/* Filas por página */}
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium whitespace-nowrap">Filas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[78px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Información de página */}
            <div className="text-sm font-medium">   
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </div>

            {/* Botones de navegación */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la última página</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
