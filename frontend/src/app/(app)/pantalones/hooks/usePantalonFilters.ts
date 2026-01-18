// ============================================================================
// HOOK PARA FILTROS DE PANTALONES
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import { Pantalon, PantalonFilters, filterPantalones, sortPantalones, PantalonSortOptions } from '../types';

interface UsePantalonFiltersOptions {
  initialFilters?: PantalonFilters;
  initialSort?: PantalonSortOptions;
}

interface UsePantalonFiltersReturn {
  // Estado de filtros
  filters: PantalonFilters;
  sortOptions: PantalonSortOptions;
  
  // Acciones de filtros
  setSearch: (search: string) => void;
  setTalla: (talla: string) => void;
  setPrecioRange: (min?: number, max?: number) => void;
  
  // Acciones de ordenamiento
  setSortField: (field: PantalonSortOptions['field']) => void;
  setSortDirection: (direction: PantalonSortOptions['direction']) => void;
  
  // Utilidades
  clearFilters: () => void;
  applyFilters: (pantalones: Pantalon[]) => Pantalon[];
  hasActiveFilters: boolean;
  filteredCount: (totalCount: number) => number;
}

export function usePantalonFilters({
  initialFilters = {},
  initialSort = { field: 'nombre', direction: 'asc' }
}: UsePantalonFiltersOptions = {}): UsePantalonFiltersReturn {
  const [filters, setFilters] = useState<PantalonFilters>(initialFilters);
  const [sortOptions, setSortOptions] = useState<PantalonSortOptions>(initialSort);

  // Acciones de filtros individuales
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search: search.trim() || undefined }));
  }, []);

  const setTalla = useCallback((talla: string) => {
    setFilters(prev => ({ 
      ...prev, 
      talla: talla === 'all' ? undefined : talla 
    }));
  }, []);

  const setPrecioRange = useCallback((min?: number, max?: number) => {
    setFilters(prev => ({ 
      ...prev, 
      precio_min: min,
      precio_max: max
    }));
  }, []);

  // Acciones de ordenamiento
  const setSortField = useCallback((field: PantalonSortOptions['field']) => {
    setSortOptions(prev => ({ ...prev, field }));
  }, []);

  const setSortDirection = useCallback((direction: PantalonSortOptions['direction']) => {
    setSortOptions(prev => ({ ...prev, direction }));
  }, []);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    setSortOptions({ field: 'nombre', direction: 'asc' });
  }, []);

  // Aplicar filtros y ordenamiento
  const applyFilters = useCallback((pantalones: Pantalon[]): Pantalon[] => {
    // Primero filtrar
    let filtered = filterPantalones(pantalones, filters);
    
    // Luego ordenar
    filtered = sortPantalones(filtered, sortOptions);
    
    return filtered;
  }, [filters, sortOptions]);

  // Determinar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      filters.talla ||
      filters.precio_min !== undefined ||
      filters.precio_max !== undefined ||
      filters.estado
    );
  }, [filters]);

  // Contar elementos filtrados (útil para mostrar estadísticas)
  const filteredCount = useCallback((totalCount: number) => {
    // Esta función es principalmente para mostrar información
    // El filtrado real se hace en applyFilters
    return totalCount;
  }, []);

  return {
    // Estado
    filters,
    sortOptions,
    
    // Acciones de filtros
    setSearch,
    setTalla,
    setPrecioRange,
    
    // Acciones de ordenamiento  
    setSortField,
    setSortDirection,
    
    // Utilidades
    clearFilters,
    applyFilters,
    hasActiveFilters,
    filteredCount,
  };
}

export default usePantalonFilters;
