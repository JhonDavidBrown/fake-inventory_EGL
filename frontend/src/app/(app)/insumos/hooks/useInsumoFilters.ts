import { useState, useCallback, useMemo } from 'react';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { TipoInsumo, EstadoInsumo } from '../types';

interface UseInsumoFiltersOptions {
  initialFilters?: ColumnFiltersState;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
}

interface UseInsumoFiltersReturn {
  // Estado de filtros
  filters: ColumnFiltersState;
  activeFiltersCount: number;
  
  // Filtros específicos
  searchTerm: string;
  selectedTipo: TipoInsumo | 'all';
  selectedEstado: EstadoInsumo | 'all';
  priceRange: [number | undefined, number | undefined];
  
  // Acciones
  setSearchTerm: (term: string) => void;
  setTipoFilter: (tipo: TipoInsumo | 'all') => void;
  setEstadoFilter: (estado: EstadoInsumo | 'all') => void;
  setPriceRange: (min: number | undefined, max: number | undefined) => void;
  clearAllFilters: () => void;
  clearFilter: (filterId: string) => void;
  applyFilters: () => void;
  
  // Utilidades
  hasActiveFilters: boolean;
  getFilterValue: (filterId: string) => unknown;
}

export function useInsumoFilters({ 
  initialFilters = [], 
  onFiltersChange 
}: UseInsumoFiltersOptions = {}): UseInsumoFiltersReturn {
  
  const [filters, setFilters] = useState<ColumnFiltersState>(initialFilters);

  // Helper para obtener valor de filtro específico
  const getFilterValue = useCallback((filterId: string) => {
    return filters.find(f => f.id === filterId)?.value;
  }, [filters]);

  // Estados derivados para filtros específicos - CORREGIDOS
  const searchTerm = useMemo(() => {
    // ✅ CAMBIAR de 'globalFilter' a 'global' para que coincida con tanstack table
    return (getFilterValue('global') as string) || '';
  }, [getFilterValue]);

  const selectedTipo = useMemo(() => {
    return (getFilterValue('tipo') as TipoInsumo | 'all') || 'all';
  }, [getFilterValue]);

  const selectedEstado = useMemo(() => {
    return (getFilterValue('estado') as EstadoInsumo | 'all') || 'all';
  }, [getFilterValue]);

  const priceRange = useMemo((): [number | undefined, number | undefined] => {
    const range = getFilterValue('preciounidad');
    return Array.isArray(range) ? [range[0], range[1]] : [undefined, undefined];
  }, [getFilterValue]);

  // Contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    return filters.filter(f => {
      const value = f.value;
      if (typeof value === 'string') return value.trim() !== '' && value !== 'all';
      if (Array.isArray(value)) return value.some(v => v !== undefined && v !== '');
      return value !== undefined && value !== null;
    }).length;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Función para actualizar filtros y notificar cambios
  const updateFilters = useCallback((newFilters: ColumnFiltersState) => {
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  }, [onFiltersChange]);

  // Acciones específicas para cada tipo de filtro
  const setSearchTerm = useCallback((term: string) => {
    // ✅ CAMBIAR de 'globalFilter' a 'global'
    const newFilters = filters.filter(f => f.id !== 'global');
    if (term.trim()) {
      newFilters.push({ id: 'global', value: term });
    }
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const setTipoFilter = useCallback((tipo: TipoInsumo | 'all') => {
    const newFilters = filters.filter(f => f.id !== 'tipo');
    if (tipo !== 'all') {
      newFilters.push({ id: 'tipo', value: tipo });
    }
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const setEstadoFilter = useCallback((estado: EstadoInsumo | 'all') => {
    const newFilters = filters.filter(f => f.id !== 'estado');
    if (estado !== 'all') {
      newFilters.push({ id: 'estado', value: estado });
    }
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const setPriceRange = useCallback((min: number | undefined, max: number | undefined) => {
    const newFilters = filters.filter(f => f.id !== 'preciounidad');
    if (min !== undefined || max !== undefined) {
      newFilters.push({ id: 'preciounidad', value: [min, max] });
    }
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  // Limpiar filtros
  const clearAllFilters = useCallback(() => {
    updateFilters([]);
  }, [updateFilters]);

  const clearFilter = useCallback((filterId: string) => {
    const newFilters = filters.filter(f => f.id !== filterId);
    updateFilters(newFilters);
  }, [filters, updateFilters]);

  const applyFilters = useCallback(() => {
    // Esta función puede ser usada para aplicar filtros manualmente
    // si se necesita validación adicional antes de aplicar
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  return {
    // Estado de filtros
    filters,
    activeFiltersCount,
    
    // Filtros específicos
    searchTerm,
    selectedTipo,
    selectedEstado,
    priceRange,
    
    // Acciones
    setSearchTerm,
    setTipoFilter,
    setEstadoFilter,
    setPriceRange,
    clearAllFilters,
    clearFilter,
    applyFilters,
    
    // Utilidades
    hasActiveFilters,
    getFilterValue,
  };
}
