"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import { FilterHeader } from "@/components/filters/FilterHeader";
import type { ColumnFiltersState } from "@tanstack/react-table";

interface ManoObraFiltersModalProps {
  initialFilters: ColumnFiltersState;
  onApply: (filters: ColumnFiltersState) => void;
  onClose: () => void; 
}

export function ManoObraFiltersModal({ initialFilters, onApply, onClose }: ManoObraFiltersModalProps) {
  
  // Helper para encontrar valores iniciales
  const findInitialValue = useCallback(<T,>(id: string, defaultValue: T): T => {
    const filter = initialFilters.find(f => f.id === id);
    const value = filter?.value as T;
    
    if (!filter || value === undefined || value === null) {
      return defaultValue;
    }
    
    return value;
  }, [initialFilters]);
  
  // Estado para el rango de precios
  const [priceRange, setPriceRange] = useState<{min: string; max: string}>(() => {
    const range = findInitialValue('precio', []);
    const [minVal, maxVal] = Array.isArray(range) ? range : [undefined, undefined];
    return {
      min: minVal !== undefined ? String(minVal) : '',
      max: maxVal !== undefined ? String(maxVal) : ''
    };
  });

  // Contador de filtros activos
  const activeFilters = useMemo(() => {
    let count = 0;
    if (priceRange.min || priceRange.max) count++;
    return count;
  }, [priceRange]);

  // Función de limpiar filtros
  const clearAllFilters = useCallback(() => {
    setPriceRange({ min: '', max: '' });
  }, []);

  // Aplicar filtros
  const handleApply = useCallback(() => {
    const newFilters: ColumnFiltersState = [];
    
    // Filtro por rango de precios con validación
    if (priceRange.min || priceRange.max) {
      const minNum = priceRange.min ? Number(priceRange.min) : undefined;
      const maxNum = priceRange.max ? Number(priceRange.max) : undefined;
      
      // Validar que min <= max si ambos están presentes
      if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
        // Intercambiar valores si están al revés
        newFilters.push({ id: 'precio', value: [maxNum, minNum] });
      } else {
        newFilters.push({ id: 'precio', value: [minNum, maxNum] });
      }
    }
    
    onApply(newFilters);
    onClose();
  }, [priceRange, onApply, onClose]);

  // Handlers específicos para el rango de precio
  const handleMinPriceChange = useCallback((value: string) => {
    setPriceRange(prev => ({ ...prev, min: value }));
  }, []);

  const handleMaxPriceChange = useCallback((value: string) => {
    setPriceRange(prev => ({ ...prev, max: value }));
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <FilterHeader
          title="Filtros Avanzados"
          activeFilters={activeFilters}
          onClearAll={clearAllFilters}
        />
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <PriceRangeFilter 
          min={priceRange.min} 
          max={priceRange.max} 
          onMinChange={handleMinPriceChange} 
          onMaxChange={handleMaxPriceChange}
          minLabel="Precio mínimo"
          maxLabel="Precio máximo"
        />
      </div>
      
      <div className="p-4 border-t mt-auto bg-background">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="flex-1"
            disabled={activeFilters === 0}
          >
            Limpiar
          </Button>
          <Button 
            onClick={handleApply} 
            className="flex-1"
          >
            Aplicar {activeFilters > 0 && `(${activeFilters})`}
          </Button>
        </div>
      </div>
    </div>
  );
}
