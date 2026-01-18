// ============================================================================
// HOOK DE FILTROS PARA EL MÓDULO MANO DE OBRA
// ============================================================================

import { useState, useMemo, useCallback } from 'react';
import type { 
  ManoObra, 
  ManoObraFilters, 
  ManoObraSortOptions 
} from '../types';
import { 
  applyManoObraFilters, 
  sortManoObraData 
} from '../types';

interface UseManoObraFiltersOptions {
  data: ManoObra[];
  initialFilters?: Partial<ManoObraFilters>;
  initialSort?: ManoObraSortOptions;
}

interface UseManoObraFiltersReturn {
  // Datos filtrados y ordenados
  filteredData: ManoObra[];
  
  // Estado de filtros
  filters: ManoObraFilters;
  sortOptions: ManoObraSortOptions;
  
  // Funciones para actualizar filtros
  setSearch: (search: string) => void;
  setPriceRange: (range: [number?, number?]) => void;
  setProveedor: (proveedor: string) => void;
  
  // Funciones para ordenamiento
  setSortField: (field: keyof ManoObra) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  toggleSort: (field: keyof ManoObra) => void;
  
  // Utilidades
  clearFilters: () => void;
  clearSearch: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
  
  // Opciones dinámicas
  availableProveedores: string[];
  priceRange: { min: number; max: number };
}

export function useManoObraFilters({
  data,
  initialFilters = {},
  initialSort = { field: 'referencia', direction: 'asc' }
}: UseManoObraFiltersOptions): UseManoObraFiltersReturn {
  
  // Estado de filtros
  const [filters, setFilters] = useState<ManoObraFilters>({
    search: initialFilters.search || '',
    priceRange: initialFilters.priceRange || [undefined, undefined],
    proveedor: initialFilters.proveedor || 'all',
  });

  // Estado de ordenamiento
  const [sortOptions, setSortOptions] = useState<ManoObraSortOptions>(initialSort);

  // Datos filtrados
  const filteredData = useMemo(() => {
    let result = applyManoObraFilters(data, filters);
    result = sortManoObraData(result, sortOptions);
    return result;
  }, [data, filters, sortOptions]);

  // Información derivada
  const availableProveedores = useMemo(() => {
    const proveedores = data
      .filter(item => item.proveedor && item.proveedor.trim() !== '')
      .map(item => item.proveedor!)
      .filter((proveedor, index, array) => array.indexOf(proveedor) === index)
      .sort();
    
    return proveedores;
  }, [data]);

  const priceRange = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 0 };
    
    const prices = data.map(item => item.precio);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [data]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.search ||
      (filters.priceRange && (filters.priceRange[0] !== undefined || filters.priceRange[1] !== undefined)) ||
      (filters.proveedor && filters.proveedor !== 'all')
    );
  }, [filters]);

  // Funciones para actualizar filtros
  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search: search.trim() }));
  }, []);

  const setPriceRange = useCallback((range: [number?, number?]) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
  }, []);

  const setProveedor = useCallback((proveedor: string) => {
    setFilters(prev => ({ ...prev, proveedor }));
  }, []);

  // Funciones para ordenamiento
  const setSortField = useCallback((field: keyof ManoObra) => {
    setSortOptions(prev => ({ ...prev, field }));
  }, []);

  const setSortDirection = useCallback((direction: 'asc' | 'desc') => {
    setSortOptions(prev => ({ ...prev, direction }));
  }, []);

  const toggleSort = useCallback((field: keyof ManoObra) => {
    setSortOptions(prev => {
      if (prev.field === field) {
        // Si es el mismo campo, cambiar dirección
        return {
          ...prev,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // Si es un campo diferente, usar ese campo con dirección ascendente
        return {
          field,
          direction: 'asc'
        };
      }
    });
  }, []);

  // Utilidades
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      priceRange: [undefined, undefined],
      proveedor: 'all',
    });
  }, []);

  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
  }, []);

  return {
    // Datos
    filteredData,
    
    // Estado
    filters,
    sortOptions,
    
    // Funciones de filtro
    setSearch,
    setPriceRange,
    setProveedor,
    
    // Funciones de ordenamiento
    setSortField,
    setSortDirection,
    toggleSort,
    
    // Utilidades
    clearFilters,
    clearSearch,
    hasActiveFilters,
    resultCount: filteredData.length,
    
    // Información derivada
    availableProveedores,
    priceRange,
  };
}
