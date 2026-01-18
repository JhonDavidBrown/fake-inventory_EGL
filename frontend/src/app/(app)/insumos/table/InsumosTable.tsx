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
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface WithReferencia {
  referencia: string | number;
}

interface InsumosTableProps<TData extends WithReferencia, TValue> {
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
  onSortingChange: (sorting: SortingState) => void;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
  onGlobalFilterChange: (filter: string) => void;
  onRowSelectionChange: (selection: RowSelectionState) => void;
  onPaginationChange: (pagination: PaginationState) => void;
}

export function InsumosTable<TData extends WithReferencia, TValue>({
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
}: InsumosTableProps<TData, TValue>) {

  // 🔍 DEBUGGING: Ver la estructura exacta de los datos
  React.useEffect(() => {
    if (data && data.length > 0) {
      console.log("=== DATOS EN LA TABLA ===");
      console.log("Primer elemento completo:", data[0]);
      console.log("Propiedades disponibles:", Object.keys(data[0] as Record<string, unknown>));
      console.log("Tipos de cada propiedad:");
      Object.entries(data[0] as Record<string, unknown>).forEach(([key, value]) => {
        console.log(`  ${key}: ${typeof value} = ${value}`);
      });
      console.log("========================");
    }
  }, [data]);

  // Crear wrappers para los handlers que manejen el tipo Updater<T>
  const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting = typeof updaterOrValue === 'function' 
      ? updaterOrValue(state.sorting)
      : updaterOrValue;
    onSortingChange(newSorting);
  };

  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
    const newFilters = typeof updaterOrValue === 'function' 
      ? updaterOrValue(state.columnFilters)
      : updaterOrValue;
    onColumnFiltersChange(newFilters);
  };

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newSelection = typeof updaterOrValue === 'function' 
      ? updaterOrValue(state.rowSelection)
      : updaterOrValue;
    onRowSelectionChange(newSelection);
  };

  const handlePaginationChange: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === 'function'
      ? updaterOrValue(state.pagination)
      : updaterOrValue;
    onPaginationChange(newPagination);
  };

  const table = useReactTable({
    data,
    columns,
    state,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange: handleRowSelectionChange,
    onPaginationChange: handlePaginationChange,
    manualPagination: false,
    manualFiltering: false,
    manualSorting: false,
    autoResetPageIndex: false,
    globalFilterFn: 'includesString',
    // ✅ IMPORTANTE: Usar referencia como ID único para selección
    getRowId: (row) => {
      console.log(`🔑 [InsumosTable] getRowId llamado:`, {
        referencia: row.referencia,
        tipo: typeof row.referencia,
        asString: row.referencia.toString()
      });
      return row.referencia.toString();
    },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Cargando datos...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-red-500">Error: {error.message}</TableCell></TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No se encontraron resultados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINACIÓN RESPONSIVE */}
      <div className="flex flex-col gap-4 px-2 py-4 sm:gap-2">
        {/* MÓVIL: Layout optimizado */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* ✅ Información de filas seleccionadas e info de página en los extremos */}
          <div className="flex items-center justify-between w-full">
            {/* Información de filas seleccionadas - IZQUIERDA */}
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </div>
            
            {/* Información de página - DERECHA */}
            <div className="text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </div>
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
    </>
  );
}