"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ColumnFiltersState, SortingState, RowSelectionState, PaginationState } from "@tanstack/react-table";
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

// ✅ CAMBIAR: Usar el tipo específico del módulo de insumos
import { Insumo } from "../types";

// Hooks y tipos específicos del módulo
import { useInsumos } from "../hooks/useInsumos";
import { getColumns } from "../table/columns";

// Componentes de UI y modales
import { InsumosTable } from "../table/InsumosTable";
import { InsumoStats } from "./InsumoStats";
import { InsumoFilters } from "./InsumosFilters";
import { InsumoCreate } from "../modales/InsumoCreate";
import InsumoEdit from "../modales/InsumoEdit";
import { InsumoAddStock } from "../modales/InsumoAddStock";
import { InsumoDeleteSelected } from "../modales/InsumoDeleteSelected";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, PlusCircle } from "lucide-react";

interface InsumosPageClientProps {
  initialData: Insumo[];
}

export function InsumosPageClient({ initialData }: InsumosPageClientProps) {
  
  
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- ESTADO Y HOOKS ---
  const {
    data: insumos,
    loading,
    error,
    stats,
    refetch,
  } = useInsumos({ initialData });

  // Estado para la tabla y filtros
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  
  // Estado para la UI (modales y estadísticas)
  const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddStockModalOpen, setAddStockModalOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // Estado para el insumo seleccionado en los modales
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);

  // --- MANEJADORES DE EVENTOS ---
  const handleEdit = useCallback((insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setEditModalOpen(true);
  }, []);

  const handleAddStock = useCallback((insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setAddStockModalOpen(true);
  }, []);
  
  const handleGlobalAddStock = useCallback(() => {
    setSelectedInsumo(null);
    setAddStockModalOpen(true);
  }, []);

  const handleNavigateToDetail = useCallback((referencia: string) => {
    router.push(`/insumos/${referencia}`);
  }, [router]);

  // Wrapper para refetch que devuelve Promise
  const handleRefetch = useCallback(async () => {
    await Promise.resolve(refetch());
  }, [refetch]);

  // --- DEFINICIÓN DE COLUMNAS ---
  const columns = useMemo(
    () => getColumns({
      onEdit: handleEdit,
      onAddStock: handleAddStock,
      onNavigateToDetail: handleNavigateToDetail,
    }),
    [handleEdit, handleAddStock, handleNavigateToDetail]
  );
  
  // Corregir la comparación: convertir referencia a string
  const selectedRowsData = useMemo(() => {
    console.log(`🔍 [InsumosPageClient] Calculando selectedRowsData`, {
      rowSelection,
      rowSelectionKeys: Object.keys(rowSelection),
      insumosCount: insumos.length,
      insumosReferencias: insumos.map(i => i.referencia)
    });

    const result = Object.keys(rowSelection)
      .map(id => {
        const found = insumos.find(i => i.referencia.toString() === id);
        console.log(`🔍 [InsumosPageClient] Buscando insumo con id ${id}:`, {
          found: found ? `${found.referencia} - ${found.nombre}` : 'No encontrado'
        });
        return found;
      })
      .filter(Boolean) as Insumo[];

    console.log(`✅ [InsumosPageClient] selectedRowsData calculado:`, {
      count: result.length,
      items: result.map(r => ({ referencia: r.referencia, nombre: r.nombre }))
    });

    return result;
  }, [rowSelection, insumos]);

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
        <h1 className="text-2xl font-bold">Gestión de Insumos</h1>
        <p className="text-muted-foreground text-sm">
          Administra tu inventario de materiales y suministros.
        </p>
        
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showStats ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {stats && <InsumoStats stats={stats} />}
        </div>
      </div>
      
      {/* SECCIÓN DE CONTROLES Y FILTROS */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar por nombre, referencia..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 w-full sm:w-auto sm:min-w-[250px] lg:min-w-[300px]"
          />

          {/* Filtros Modal - Responsive */}
          {isDesktop ? (
            <Dialog open={isFiltersModalOpen} onOpenChange={setFiltersModalOpen}>
              <DialogTrigger asChild>{FiltersModalTrigger}</DialogTrigger>
              <DialogContent className="sm:max-w-md p-0 gap-0">
                <DialogHeader className="px-6 pt-6">
                  <DialogTitle>Filtros de Insumos</DialogTitle>
                </DialogHeader>
                <InsumoFilters
                  initialFilters={columnFilters}
                  onApply={setColumnFilters}
                  onClose={() => setFiltersModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer open={isFiltersModalOpen} onOpenChange={setFiltersModalOpen}>
              <DrawerTrigger asChild>{FiltersModalTrigger}</DrawerTrigger>
              <DrawerContent className="max-h-[80vh] flex flex-col">
                <DrawerHeader className="px-6 pt-6">
                  <DrawerTitle>Filtros de Insumos</DrawerTitle>
                </DrawerHeader>
                <InsumoFilters
                  initialFilters={columnFilters}
                  onApply={setColumnFilters}
                  onClose={() => setFiltersModalOpen(false)}
                />
              </DrawerContent>
            </Drawer>
          )}
          
          {(columnFilters.length > 0 || globalFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setColumnFilters([]); setGlobalFilter(""); }}>
              Limpiar Filtros
            </Button>
          )}
        </div>
        <div className="w-full flex flex-col sm:flex-row sm:flex-wrap xl:flex-nowrap sm:justify-end sm:items-center gap-2">
          <RippleButton
            variant="secondary"
            size="lg"
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? "Ocultar Estadísticas" : "Mostrar Stats"}
            <RippleButtonRipples />
          </RippleButton>
          <InsumoDeleteSelected
            selected={selectedRowsData}
            fetchData={handleRefetch}
            clearSelection={() => setRowSelection({})}
          />
          <RippleButton
            variant="outline"
            size="lg"
            onClick={handleGlobalAddStock}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            <PlusCircle className="mr-2 h-4 w-4"/>
            Registrar Compra
            <RippleButtonRipples />
          </RippleButton>
          <RippleButton
            variant="default"
            size="lg"
            onClick={() => setCreateModalOpen(true)}
            className="w-full sm:w-auto whitespace-nowrap"
          >
            Crear Insumo
            <RippleButtonRipples />
          </RippleButton>
        </div>
      </div>

      {/* TABLA DE DATOS */}
      <InsumosTable
        columns={columns}
        data={insumos}
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
      <InsumoCreate
        open={isCreateModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={async () => {
          // ✅ CAMBIAR: hacer async y await
          await refetch();
          // ❌ NO cerrar aquí - ya lo hace InsumoCreate
          // setCreateModalOpen(false); 
        }}
      />
      
      {selectedInsumo && (
        <InsumoEdit
          open={isEditModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedInsumo(null);
          }}
          insumo={selectedInsumo}
          onUpdated={async () => {
            await refetch();
            setEditModalOpen(false);
            setSelectedInsumo(null);
          }}
        />
      )}

      {/* Add Stock Modal - Responsive */}
      {isDesktop ? (
        <Dialog open={isAddStockModalOpen} onOpenChange={setAddStockModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedInsumo ? `Añadir Stock para: ${selectedInsumo.nombre}` : "Añadir Stock"}
              </DialogTitle>
            </DialogHeader>
            <InsumoAddStock
              insumos={insumos}
              onStockAdded={async () => {
                await refetch();
              }}
              onClose={() => setAddStockModalOpen(false)}
              initialInsumo={selectedInsumo}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isAddStockModalOpen} onOpenChange={setAddStockModalOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {selectedInsumo ? `Añadir Stock para: ${selectedInsumo.nombre}` : "Añadir Stock"}
              </DrawerTitle>
            </DrawerHeader>
            <InsumoAddStock
              insumos={insumos}
              onStockAdded={async () => {
                await refetch();
              }}
              onClose={() => setAddStockModalOpen(false)}
              initialInsumo={selectedInsumo}
            />
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}