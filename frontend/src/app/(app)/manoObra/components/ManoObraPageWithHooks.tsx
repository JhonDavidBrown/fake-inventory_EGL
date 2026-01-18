"use client";

// ============================================================================
// COMPONENTE PRINCIPAL DE MANO DE OBRA CON NUEVA ARQUITECTURA
// ============================================================================

import { useState, useMemo, useCallback } from "react";
import type {
  ColumnFiltersState,
  SortingState,
  RowSelectionState,
  PaginationState,
} from "@tanstack/react-table";

import { useMediaQuery } from "@/hooks/use-media-query";
import { CompanyBanner } from "@/components/CompanyBanner";
import {
  LiquidButton,
  type LiquidButtonProps,
} from "@/components/animate-ui/components/buttons/liquid";

import {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
} from "@/components/animate-ui/components/buttons/ripple";

import type { ManoObra } from "../types";

// Hooks y componentes específicos del módulo
import { useManoObra } from "../hooks/useManoObra";
import { getColumns } from "../table/columns";

// Componentes de UI y modales
import { ManoObraTableSimple } from "../table/ManoObraTableSimple";
import { ManoObraStats } from "./ManoObraStats";
import { ManoObraFiltersModal } from "./ManoObraFiltersModal";
import { ManoObraCreate } from "../modales/ManoObraCreate";
import ManoObraEdit from "../modales/ManoObraEdit";
import { ManoObraDelete } from "../modales/ManoObraDelete";
import { ManoObraDeleteSelected } from "../modales/ManoObraDeleteSelected";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCw } from "lucide-react";

interface ManoObraPageWithHooksProps {
  initialData: ManoObra[];
}

export function ManoObraPageWithHooks({
  initialData,
}: ManoObraPageWithHooksProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- ESTADO Y HOOKS ---
  const {
    data: manoObra,
    loading,
    error,
    refetch,
  } = useManoObra({ initialData });

  // Estado para la tabla y filtros
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  // Estado para la UI (modales y estadísticas)
  const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Estado para la mano de obra seleccionada en los modales
  const [selectedManoObra, setSelectedManoObra] = useState<ManoObra | null>(
    null
  );

  // --- MANEJADORES DE EVENTOS ---
  const handleEdit = useCallback((manoObra: ManoObra) => {
    setSelectedManoObra(manoObra);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((manoObra: ManoObra) => {
    setSelectedManoObra(manoObra);
    setDeleteModalOpen(true);
  }, []);

  // Wrapper para refetch que devuelve Promise
  const handleRefetch = useCallback(async () => {
    await Promise.resolve(refetch());
  }, [refetch]);

  // --- DEFINICIÓN DE COLUMNAS ---
  const columns = useMemo(
    () =>
      getColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  );

  // Datos de las filas seleccionadas
  const selectedRowsData = useMemo(() => {
    return Object.keys(rowSelection)
      .map((id) => manoObra.find((m) => m.referencia.toString() === id))
      .filter(Boolean) as ManoObra[];
  }, [rowSelection, manoObra]);

  // Datos filtrados para las estadísticas
  const filteredData = useMemo(() => {
    if (!globalFilter && columnFilters.length === 0) {
      return manoObra;
    }

    let filtered = manoObra;

    // Filtro global
    if (globalFilter) {
      filtered = filtered.filter(
        (item) =>
          item.referencia
            .toString()
            .toLowerCase()
            .includes(globalFilter.toLowerCase()) ||
          item.nombre.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    // Filtros de columna
    columnFilters.forEach((filter) => {
      if (filter.id === "precio" && Array.isArray(filter.value)) {
        const [min, max] = filter.value as [number?, number?];
        filtered = filtered.filter((item) => {
          if (min !== undefined && item.precio < min) return false;
          if (max !== undefined && item.precio > max) return false;
          return true;
        });
      }
    });

    return filtered;
  }, [manoObra, globalFilter, columnFilters]);

  // --- RENDERIZADO ---
  const FiltersModalTrigger = (
    <LiquidButton fillHeight="2px" variant="default" size="lg">
      <Filter className="mr-2 h-4 w-4" />
      Filtros Avanzados
    </LiquidButton>
  );

  return (
    <div className="space-y-4">
      {/* Company Banner */}
      <CompanyBanner showAlways={true} />

      {/* SECCIÓN DE TÍTULO Y ESTADÍSTICAS */}
      <div className="space-y-4 px-2 sm:px-0">
        <h1 className="text-2xl font-bold">Gestión de Mano de Obra</h1>
        <p className="text-muted-foreground text-sm">
          Administra tus registros de mano de obra
        </p>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showStats ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ManoObraStats data={manoObra} filteredData={filteredData} />
        </div>
      </div>

      {/* SECCIÓN DE CONTROLES Y FILTROS */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            placeholder="Filtrar por referencia, nombre..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 w-full sm:w-auto sm:min-w-[250px] lg:min-w-[300px]"
          />

          {/* Filtros Modal - Responsive */}
          {isDesktop ? (
            <Dialog
              open={isFiltersModalOpen}
              onOpenChange={setFiltersModalOpen}
            >
              <DialogTrigger asChild>{FiltersModalTrigger}</DialogTrigger>
              <DialogContent className="sm:max-w-md p-0 gap-0">
                <DialogHeader className="px-6 pt-6">
                  <DialogTitle>Filtros de Mano de Obra</DialogTitle>
                </DialogHeader>
                <ManoObraFiltersModal
                  initialFilters={columnFilters}
                  onApply={setColumnFilters}
                  onClose={() => setFiltersModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer
              open={isFiltersModalOpen}
              onOpenChange={setFiltersModalOpen}
            >
              <DrawerTrigger asChild>{FiltersModalTrigger}</DrawerTrigger>
              <DrawerContent className="max-h-[80vh] flex flex-col">
                <DrawerHeader className="px-6 pt-6">
                  <DrawerTitle>Filtros de Mano de Obra</DrawerTitle>
                </DrawerHeader>
                <ManoObraFiltersModal
                  initialFilters={columnFilters}
                  onApply={setColumnFilters}
                  onClose={() => setFiltersModalOpen(false)}
                />
              </DrawerContent>
            </Drawer>
          )}

          {(columnFilters.length > 0 || globalFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setColumnFilters([]);
                setGlobalFilter("");
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
        <div className="w-full flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
          <RippleButton
            variant="secondary"
            size="lg"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? "Ocultar Stats" : "Mostrar Stats"}
            <RippleButtonRipples />
          </RippleButton>
          <RippleButton
            variant="outline"
            size="lg"
            onClick={handleRefetch}
            disabled={loading}
            className="whitespace-nowrap"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
            <RippleButtonRipples />
          </RippleButton>
          <ManoObraDeleteSelected
            selected={selectedRowsData}
            fetchData={handleRefetch}
            clearSelection={() => setRowSelection({})}
          />
          <ManoObraCreate onCreated={handleRefetch} />
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <ManoObraTableSimple
        columns={columns}
        data={filteredData}
        loading={loading}
        error={error as Error | null}
        state={{ columnFilters, globalFilter, sorting, rowSelection, pagination }}
        onGlobalFilterChange={setGlobalFilter}
        onColumnFiltersChange={setColumnFilters}
        onSortingChange={setSorting}
        onRowSelectionChange={setRowSelection}
        onPaginationChange={setPagination}
      />

      {/* MODALES */}
      {selectedManoObra && (
        <ManoObraEdit
          open={isEditModalOpen}
          setOpen={setEditModalOpen}
          manoObra={selectedManoObra}
          onUpdated={async () => {
            await refetch();
            setEditModalOpen(false);
            setSelectedManoObra(null);
          }}
        />
      )}

      {selectedManoObra && (
        <ManoObraDelete
          manoObra={selectedManoObra}
          open={isDeleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onDeleted={async () => {
            await refetch();
            setSelectedManoObra(null);
          }}
        />
      )}
    </div>
  );
}
