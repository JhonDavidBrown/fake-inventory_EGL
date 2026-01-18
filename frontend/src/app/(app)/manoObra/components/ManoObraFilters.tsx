"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Wrench } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { FilterHeader } from "@/components/filters/FilterHeader";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";

// AÑADIDO: Se importan los tipos necesarios de TanStack Table
import type { Table, ColumnFiltersState } from "@tanstack/react-table";
// MODIFICADO: Se elimina la importación de 'BaseFiltersProps' que no existe
import type { PriceInputsRef } from "@/types/filters";
import type { ManoObra } from "../types";

// MODIFICADO: Se define la interfaz de props correctamente usando ManoObra
interface ManoObraFiltersProps {
  table: Table<ManoObra>; // Prop para interactuar con la tabla
  onFiltersChange: (filters: ColumnFiltersState) => void; // Callback para notificar cambios
  clearPriceInputsRef?: React.RefObject<PriceInputsRef>;
}

export function ManoObraFilters({
  table,
  onFiltersChange,
  clearPriceInputsRef,
}: ManoObraFiltersProps) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // Debounce price inputs to reduce API calls
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
    onFiltersChange([]);
  }, [table, onFiltersChange]);

  // Handle price filter changes with debouncing
  const handlePriceFilter = useCallback(
    (minVal: string, maxVal: string) => {
      const priceFilter: ColumnFiltersState = [];
      if (minVal || maxVal) {
        priceFilter.push({
          id: "precio",
          value: [
            minVal ? Number(minVal) : undefined,
            maxVal ? Number(maxVal) : undefined,
          ]
        });
      }
      
      // Se actualiza el filtro en la tabla
      table.getColumn("precio")?.setFilterValue(priceFilter.length ? priceFilter[0].value : undefined);
      
      // Se notifica al componente padre sobre los filtros activos
      onFiltersChange(priceFilter);
    },
    [table, onFiltersChange]
  );

  // Memoized handlers for price inputs
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

  return (
    <Card className="border border-slate-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
      <CardHeader className="pb-4">
        <FilterHeader
          title="Filtros de Mano de Obra"
          activeFilters={activeFilters}
          onClearAll={clearAllFilters}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
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
              Filtrando mano de obra por precio:{" "}
              {min ? `$${min}` : "Sin mínimo"} -{" "}
              {max ? `$${max}` : "Sin máximo"}
            </span>
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
          💡 Los filtros se aplican automáticamente mientras escribes
        </div>
      </CardContent>
    </Card>
  );
}