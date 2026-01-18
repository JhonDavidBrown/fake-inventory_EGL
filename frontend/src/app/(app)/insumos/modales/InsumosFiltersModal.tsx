"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Package, AlertCircle, RotateCcw } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import { semanticColors } from "@/lib/colors";
import type { Table, ColumnFiltersState } from "@tanstack/react-table";
import type { PriceInputsRef } from "@/types/filters";
import type { Insumo } from "@/types/dashboard";

interface InsumosFiltersModalProps {
  table: Table<Insumo>;
  onFiltersChange: (filters: ColumnFiltersState) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearPriceInputsRef?: React.RefObject<PriceInputsRef>;
}

type TipoInsumo = "Tela" | "Botones" | "Taches" | "Hilos" | "Cierres";
type EstadoInsumo = "disponible" | "bajo stock" | "agotado";

// Constants moved outside component to prevent recreation
const TIPOS_INSUMOS: readonly TipoInsumo[] = [
  "Tela",
  "Botones",
  "Taches",
  "Hilos",
  "Cierres",
];
const ESTADOS_DISPONIBLES: readonly EstadoInsumo[] = [
  "disponible",
  "bajo stock",
  "agotado",
];

export function InsumosFiltersModal({
  table,
  onFiltersChange,
  open,
  onOpenChange,
  clearPriceInputsRef,
}: InsumosFiltersModalProps) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  // Debounce price inputs
  const debouncedMin = useDebounce(min, 300);
  const debouncedMax = useDebounce(max, 300);

  // Contar filtros activos usando estado local
  const activeFilters = useMemo(() => {
    const precioFilter = min || max;
    
    let count = 0;
    if (tipoFilter && tipoFilter !== "" && tipoFilter !== "todos") count++;
    if (estadoFilter && estadoFilter !== "" && estadoFilter !== "todos") count++;
    if (precioFilter) count++;
    
    console.log("🔍 FILTROS LOCALES:", {
      tipoFilter,
      estadoFilter,
      precioFilter,
      count
    });
    
    return count;
  }, [tipoFilter, estadoFilter, min, max]);

  const clearAllFilters = useCallback(() => {
    setMin("");
    setMax("");
    setTipoFilter("");
    setEstadoFilter("");
    table.getColumn("tipo")?.setFilterValue(undefined);
    table.getColumn("estado")?.setFilterValue(undefined);
    table.getColumn("preciounidad")?.setFilterValue(undefined);
    if (onFiltersChange) {
      onFiltersChange([]);
    }
  }, [table, onFiltersChange]);

  // Handle price filter changes with debouncing
  const handlePriceFilter = useCallback(
    (minVal: string, maxVal: string) => {
      table
        .getColumn("preciounidad")
        ?.setFilterValue([
          minVal ? Number(minVal) : undefined,
          maxVal ? Number(maxVal) : undefined,
        ]);
    },
    [table]
  );

  const handleMinChange = useCallback((value: string) => {
    setMin(value);
  }, []);

  const handleMaxChange = useCallback((value: string) => {
    setMax(value);
  }, []);

  // Apply debounced price filters
  useEffect(() => {
    handlePriceFilter(debouncedMin, debouncedMax);
  }, [debouncedMin, debouncedMax, handlePriceFilter]);

  useEffect(() => {
    if (clearPriceInputsRef?.current) {
      clearPriceInputsRef.current.clear = () => {
        setMin("");
        setMax("");
      };
    }
  }, [clearPriceInputsRef]);

  const handleApplyAndClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Filtros de Insumos
            {activeFilters > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {activeFilters} activo{activeFilters !== 1 ? "s" : ""}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Filtro de Tipo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className={`h-4 w-4 ${semanticColors.text.muted}`} />
                <Label
                  htmlFor="tipo-filter"
                  className={`text-sm font-medium ${semanticColors.text.secondary}`}
                >
                  Tipo de Insumo
                </Label>
              </div>
              <Select
                value={tipoFilter}
                onValueChange={(value) => {
                  console.log("🔧 SELECT TIPO CHANGED:", value);
                  setTipoFilter(value);
                  const finalValue = value === "todos" ? undefined : value;
                  table.getColumn("tipo")?.setFilterValue(finalValue);
                }}
              >
                <SelectTrigger className={`w-full ${semanticColors.input}`}>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {TIPOS_INSUMOS.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Estado */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className={`h-4 w-4 ${semanticColors.text.muted}`} />
                <Label
                  htmlFor="estado-filter"
                  className={`text-sm font-medium ${semanticColors.text.secondary}`}
                >
                  Estado
                </Label>
              </div>
              <Select
                value={estadoFilter}
                onValueChange={(value) => {
                  console.log("🔧 SELECT ESTADO CHANGED:", value);
                  setEstadoFilter(value);
                  const finalValue = value === "todos" ? undefined : value;
                  table.getColumn("estado")?.setFilterValue(finalValue);
                }}
              >
                <SelectTrigger className={`w-full ${semanticColors.input}`}>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {ESTADOS_DISPONIBLES.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Rango de Precio</h4>
            <PriceRangeFilter
              min={min}
              max={max}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </div>

          {/* Indicador de rango de precio */}
          {(min || max) && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border ${semanticColors.states.success}`}
            >
              <DollarSign className={`h-4 w-4 ${semanticColors.text.muted}`} />
              <span className={`text-sm ${semanticColors.text.secondary}`}>
                Precio: {min ? `$${min}` : "Sin mínimo"} - {max ? `$${max}` : "Sin máximo"}
              </span>
            </div>
          )}

          {/* Información adicional */}
          <div
            className={`text-xs p-3 rounded-md ${semanticColors.text.muted} bg-slate-50 dark:bg-slate-800/50`}
          >
            💡 Los filtros se aplican automáticamente mientras escribes
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            disabled={activeFilters === 0}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar Filtros
          </Button>
          <Button onClick={handleApplyAndClose}>Aplicar Filtros</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}