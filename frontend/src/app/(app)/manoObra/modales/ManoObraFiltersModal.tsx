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
import { Wrench, RotateCcw } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import type { Table, ColumnFiltersState } from "@tanstack/react-table";
import type { PriceInputsRef } from "@/types/filters";
import type { ManoObra } from "../types";

interface ManoObraFiltersModalProps {
  table: Table<ManoObra>;
  onFiltersChange: (filters: ColumnFiltersState) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearPriceInputsRef?: React.RefObject<PriceInputsRef>;
}

export function ManoObraFiltersModal({
  table,
  onFiltersChange,
  open,
  onOpenChange,
  clearPriceInputsRef,
}: ManoObraFiltersModalProps) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // Debounce price inputs
  const debouncedMin = useDebounce(min, 300);
  const debouncedMax = useDebounce(max, 300);

  // Contar filtros activos
  const activeFilters = useMemo(
    () => [min || max ? "precio" : null].filter(Boolean).length,
    [min, max]
  );

  const clearAllFilters = useCallback(() => {
    setMin("");
    setMax("");
    table.getColumn("precio")?.setFilterValue(undefined);
    if (onFiltersChange) {
      onFiltersChange([]);
    }
  }, [table, onFiltersChange]);

  // Handle price filter changes with debouncing
  const handlePriceFilter = useCallback(
    (minVal: string, maxVal: string) => {
      table
        .getColumn("precio")
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Filtros de Mano de Obra
            {activeFilters > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {activeFilters} activo{activeFilters !== 1 ? "s" : ""}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
              <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Precio: {min ? `$${min}` : "Sin mínimo"} - {max ? `$${max}` : "Sin máximo"}
              </span>
            </div>
          )}

          {/* Información adicional */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
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