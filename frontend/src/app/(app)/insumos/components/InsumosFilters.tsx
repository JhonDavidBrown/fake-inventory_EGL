"use client";

import { useState, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";
import { FilterHeader } from "@/components/filters/FilterHeader";
import type { ColumnFiltersState } from "@tanstack/react-table";

// ✅ ARREGLADO: Usar tipos centralizados en lugar de hardcodear
import { TipoInsumo, EstadoInsumo } from "../types";

interface InsumoFiltersProps {
  initialFilters: ColumnFiltersState;
  onApply: (filters: ColumnFiltersState) => void;
  onClose: () => void; 
}

// ✅ ARREGLADO: Arrays derivados de los tipos centralizados
const TIPOS_INSUMOS: TipoInsumo[] = [
  'Tela', 'Botones', 'Taches', 'Hilos', 'Cierres', 
  'Cremalleras', 'Elásticos', 'Etiquetas'
];

const ESTADOS_DISPONIBLES: EstadoInsumo[] = [
  'disponible', 'bajo stock', 'agotado'
];

// ✅ ARREGLADO: Constantes para valores especiales (no strings vacíos)
const ALL_TYPES_VALUE = '__todos_los_tipos__';
const ALL_STATES_VALUE = '__todos_los_estados__';

export function InsumoFilters({ initialFilters, onApply, onClose }: InsumoFiltersProps) {
  
  // ✅ ARREGLADO: Función helper más robusta que maneja valores especiales
  const findInitialValue = useCallback(<T,>(id: string, defaultValue: T): T => {
    const filter = initialFilters.find(f => f.id === id);
    const value = filter?.value as T;
    
    if (!filter || value === undefined || value === null) {
      return defaultValue;
    }
    
    return value;
  }, [initialFilters]);
  
  // ✅ ARREGLADO: Estados con valores especiales en lugar de strings vacíos
  const [tipo, setTipo] = useState<string>(() => 
    findInitialValue('tipo', ALL_TYPES_VALUE)
  );
  
  const [estado, setEstado] = useState<string>(() => 
    findInitialValue('estado', ALL_STATES_VALUE)
  );
  
  // ✅ ARREGLADO: Manejo más robusto del rango de precios
  const [priceRange, setPriceRange] = useState<{min: string; max: string}>(() => {
    const range = findInitialValue('preciounidad', []);
    const [minVal, maxVal] = Array.isArray(range) ? range : [undefined, undefined];
    return {
      min: minVal !== undefined ? String(minVal) : '',
      max: maxVal !== undefined ? String(maxVal) : ''
    };
  });

  // ✅ ARREGLADO: Contador de filtros activos usando valores especiales
  const activeFilters = useMemo(() => {
    let count = 0;
    if (tipo && tipo !== ALL_TYPES_VALUE) count++;
    if (estado && estado !== ALL_STATES_VALUE) count++;
    if (priceRange.min || priceRange.max) count++;
    return count;
  }, [tipo, estado, priceRange]);

  // ✅ ARREGLADO: Función de limpiar usando valores especiales
  const clearAllFilters = useCallback(() => {
    setTipo(ALL_TYPES_VALUE);
    setEstado(ALL_STATES_VALUE);
    setPriceRange({ min: '', max: '' });
  }, []);

  // ✅ ARREGLADO: Validación que excluye valores especiales
  const handleApply = useCallback(() => {
    const newFilters: ColumnFiltersState = [];
    
    // Filtro por tipo (solo si no es el valor "todos")
    if (tipo && tipo !== ALL_TYPES_VALUE) {
      newFilters.push({ id: 'tipo', value: tipo });
    }
    
    // Filtro por estado (solo si no es el valor "todos")
    if (estado && estado !== ALL_STATES_VALUE) {
      newFilters.push({ id: 'estado', value: estado });
    }
    
    // Filtro por rango de precios con validación
    if (priceRange.min || priceRange.max) {
      const minNum = priceRange.min ? Number(priceRange.min) : undefined;
      const maxNum = priceRange.max ? Number(priceRange.max) : undefined;
      
      // Validar que min <= max si ambos están presentes
      if (minNum !== undefined && maxNum !== undefined && minNum > maxNum) {
        // Intercambiar valores si están al revés
        newFilters.push({ id: 'preciounidad', value: [maxNum, minNum] });
      } else {
        newFilters.push({ id: 'preciounidad', value: [minNum, maxNum] });
      }
    }
    
    onApply(newFilters);
    onClose();
  }, [tipo, estado, priceRange, onApply, onClose]);

  // ✅ ARREGLADO: Handlers específicos para el rango de precio
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
        {/* ✅ ARREGLADO: Select con valores válidos (no vacíos) */}
        <div className="space-y-2">
          <Label htmlFor="tipo-select">Tipo de Insumo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger id="tipo-select">
              <SelectValue placeholder="Seleccionar tipo..." />
            </SelectTrigger>
            <SelectContent>
              {/* ✅ ARREGLADO: Usar valor especial en lugar de string vacío */}
              <SelectItem value={ALL_TYPES_VALUE}>Todos los tipos</SelectItem>
              {TIPOS_INSUMOS.map(tipoOption => (
                <SelectItem key={tipoOption} value={tipoOption}>
                  {tipoOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado-select">Estado del Stock</Label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger id="estado-select">
              <SelectValue placeholder="Seleccionar estado..." />
            </SelectTrigger>
            <SelectContent>
              {/* ✅ ARREGLADO: Usar valor especial en lugar de string vacío */}
              <SelectItem value={ALL_STATES_VALUE}>Todos los estados</SelectItem>
              {ESTADOS_DISPONIBLES.map(estadoOption => (
                <SelectItem key={estadoOption} value={estadoOption}>
                  {estadoOption.charAt(0).toUpperCase() + estadoOption.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ✅ ARREGLADO: Pasar handlers específicos */}
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
          {/* ✅ AGREGADO: Botón para limpiar filtros */}
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