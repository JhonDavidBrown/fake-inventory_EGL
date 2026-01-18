"use client";

// ============================================================================
// TABLA DE MANO DE OBRA ADAPTADA PARA USAR NUEVOS HOOKS
// ============================================================================

import React, { useRef, useCallback, useMemo } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Filter, RefreshCw } from "lucide-react";

import { ManoObraCreate } from "../modales/ManoObraCreate";
import { ManoObraDeleteSelected } from "../modales/ManoObraDeleteSelected";
import { ManoObraFiltersModal } from "../modales/ManoObraFiltersModal";
import { ManoObraStats } from "../components/ManoObraStats";

import type { ManoObra } from "../types";

interface ManoObraTableProps {
  columns: ColumnDef<ManoObra>[];
  data: ManoObra[];
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  onDelete?: (ids: string[]) => Promise<void>;
}

export function ManoObraTable({
  columns,
  data,
  loading = false,
  onRefresh,
}: ManoObraTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const clearPriceInputsRef = useRef<{ clear: () => void }>({
    clear: () => {},
  });
  const [showFiltersModal, setShowFiltersModal] = React.useState(false);
  const [showStats, setShowStats] = React.useState(true);

  const tableConfig = useMemo(
    () => ({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onGlobalFilterChange: setGlobalFilter,
      onRowSelectionChange: setRowSelection,
      globalFilterFn: "includesString" as const,
      enableRowSelection: true,
      state: {
        sorting,
        columnFilters,
        globalFilter,
        rowSelection,
        pagination,
      },
      onPaginationChange: setPagination,
      autoResetPageIndex: false,
    }),
    [data, columns, sorting, columnFilters, globalFilter, rowSelection, pagination]
  );

  const table = useReactTable(tableConfig);

  const selectedRows = useMemo(
    () => table.getSelectedRowModel().rows.map((r) => r.original),
    [table]
  );

  const filteredRows = useMemo(() => {
    const tableRows = table.getFilteredRowModel().rows;
    const filtered = tableRows.map((r) => r.original);
    return filtered;
  }, [table, data, columnFilters, globalFilter]);

  // Función de limpiar filtros
  const clearAllFilters = useCallback(() => {
    setGlobalFilter("");
    setColumnFilters([]);
    table.resetColumnFilters();
    clearPriceInputsRef.current?.clear();
  }, [table]);

  const handleFiltersChange = useCallback(
    (filters: any) => {
      setColumnFilters(filters);
    },
    []
  );

  const handleStatsToggle = useCallback(
    () => setShowStats((prev) => !prev),
    []
  );

  const handleFiltersToggle = useCallback(() => {
    setShowFiltersModal((prev) => {
      const newValue = !prev;
      if (!newValue) {
        setTimeout(() => {
          clearAllFilters();
        }, 150);
      }
      return newValue;
    });
  }, [clearAllFilters]);

  
  const handleRowSelectionClear = useCallback(() => setRowSelection({}), []);

  return (
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-fit mano-obra-page">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Gestión de Mano de Obra</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Administra tus registros de mano de obra
            </p>
          </div>
        </div>
        {showStats && (
          <div className="transition-all duration-300 ease-in-out">
            <ManoObraStats
              data={data}
              filteredData={filteredRows}
            />
          </div>
        )}
      </div>

      <ManoObraFiltersModal
        open={showFiltersModal}
        onOpenChange={setShowFiltersModal}
        table={table}
        onFiltersChange={handleFiltersChange}
        clearPriceInputsRef={clearPriceInputsRef}
      />

      {/* Controles y Tabla */}
      <div className="space-y-4">
        {/* Controles */}
        <div className="flex flex-col gap-4">
          {/* Barra de búsqueda y filtros - Primera fila */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Input
              placeholder="Filtrar por referencia, nombre..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-9 flex-1 min-w-0"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFiltersModal(true)}
                className="h-9 w-9 relative"
                title="Abrir filtros"
              >
                <Filter className="h-4 w-4" />
                {columnFilters.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                    {columnFilters.length}
                  </span>
                )}
              </Button>

              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  disabled={loading}
                  className="whitespace-nowrap"
                >
                  <RefreshCw className={`mr-1 sm:mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Actualizar</span>
                </Button>
              )}

              {(columnFilters.length > 0 || globalFilter) && showFiltersModal && (

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-amber-600 hover:text-amber-700 hover:border-amber-300 dark:text-amber-400 dark:hover:text-amber-300 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Limpiar Filtros</span>
                  <span className="sm:hidden">Limpiar</span>
                </Button>
              )}
            </div>
          </div>

          {/* Botones de acción - Segunda fila */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleStatsToggle}
              className="flex-1 sm:flex-none whitespace-nowrap"
              size="sm"
            >
              <span className="hidden sm:inline">{showStats ? "Ocultar" : "Mostrar"} Estadísticas</span>
              <span className="sm:hidden">Estadísticas</span>
            </Button>

            <div className="flex gap-2 flex-1 sm:flex-none">
              <div className="flex-1 sm:flex-none">
                <ManoObraDeleteSelected
                  selected={selectedRows}
                  fetchData={onRefresh || (() => Promise.resolve())}
                  clearSelection={handleRowSelectionClear}
                />
              </div>

              <div className="flex-1 sm:flex-none">
                <ManoObraCreate onCreated={onRefresh || (() => Promise.resolve())} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full overflow-x-auto border rounded-lg mano-obra-table-container">
          <div className="min-w-[650px] md:min-w-full inline-block align-middle mano-obra-table-inner">
            <Table>
              <TableHeader className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width:
                            header.getSize() !== 150
                              ? `${header.getSize()}px`
                              : undefined,
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="divide-y">
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
        </div>

        {/* Paginación */}
        <div className="flex flex-col gap-4 px-2 py-4">
          {/* Información de filas */}
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
              <>
                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
              </>
            ) : (
              <>
                Mostrando{" "}
                {table.getRowModel().rows.length > 0
                  ? table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                    1
                  : 0}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                de {table.getFilteredRowModel().rows.length} registros
              </>
            )}
          </div>
          
          {/* Controles de paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
            {/* Selector de filas por página */}
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-medium whitespace-nowrap">Filas por página</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[80px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top" className="min-w-[80px]">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Navegación de páginas */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="hidden sm:flex"
              >
                Primera
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <div className="text-xs sm:text-sm font-medium px-2 whitespace-nowrap">
                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
                className="hidden sm:flex"
              >
                Última
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export for backward compatibility if needed
export { ManoObraTable as DataTable };
