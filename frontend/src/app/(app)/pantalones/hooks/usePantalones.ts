// ============================================================================
// HOOK CENTRALIZADO PARA EL MÓDULO PANTALONES
// ============================================================================

import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useResource } from '@/hooks/useStandardApi';

import type { 
  Pantalon, 
  PantalonWithPrice, 
  PantalonStats, 
  CreatePantalonData, 
  UpdatePantalonData
} from '../types';

import { calculatePantalonPrice } from '../types';

interface UsePantalonesOptions {
  initialData?: Pantalon[];
}

interface UsePantalonesReturn {
  data: Pantalon[];
  dataWithPrices: PantalonWithPrice[];
  loading: boolean;
  error: unknown;
  stats: PantalonStats | null;
  createPantalon: (data: CreatePantalonData) => Promise<Pantalon | false>;
  updatePantalon: (id: string | number, data: UpdatePantalonData) => Promise<Pantalon | false>;
  deletePantalon: (id: string | number) => Promise<void>;
  deleteMultiplePantalones: (ids: (string | number)[]) => Promise<unknown>;
  refetch: () => Promise<void>;
}

export function usePantalones({ initialData = [] }: UsePantalonesOptions): UsePantalonesReturn {
  const hasInitialData = initialData.length > 0;
  
  const {
    data,
    loading,
    error,
    remove,
    bulkDelete,
    refetch: fetchData,
    api,
  } = useResource<Pantalon>('/pantalones', { 
    autoFetch: true,
    showErrorToast: true,
  });

  // Usar data de la API cuando esté disponible, sino usar initialData
  const effectiveData: Pantalon[] = useMemo(() => {
    if (data !== null && data !== undefined) {
      return data;
    }
    return initialData;
  }, [data, initialData]);

  // Crear versión con precios calculados
  const dataWithPrices: PantalonWithPrice[] = useMemo(() => {
    return effectiveData.map((pantalon) => ({
      ...pantalon,
      precioTotal: calculatePantalonPrice(pantalon),
    }));
  }, [effectiveData]);

  /**
   * Acción para crear un pantalón
   */
  const createPantalon = useCallback(async (data: CreatePantalonData): Promise<Pantalon | false> => {
    console.log('🚀 createPantalon iniciando...');
    try {
      const result = await api.post('/pantalones', data);
      console.log('✅ create result:', result);

      if (result) {
        toast.success("Pantalón creado con éxito");
        console.log('🔄 Ejecutando refetch...');
        await fetchData();
        console.log('✅ Refetch completado');
        return result as Pantalon;
      }
      return false;
    } catch (error) {
      console.error('❌ Error creating pantalon:', error);
      throw error;
    }
  }, [api, fetchData]);

  /**
   * Acción para actualizar un pantalón
   */
  const updatePantalon = useCallback(async (id: string | number, data: UpdatePantalonData): Promise<Pantalon | false> => {
    try {
      const result = await api.put(`/pantalones/${id}`, data);
      if (result) {
        toast.success("Pantalón actualizado con éxito");
        await fetchData();
        return result as Pantalon;
      }
      return false;
    } catch (error) {
      console.error('Error updating pantalon:', error);
      throw error;
    }
  }, [api, fetchData]);

  /**
   * Acción para eliminar múltiples pantalones
   */
  const deleteMultiplePantalones = useCallback(async (ids: (string | number)[]) => {
    try {
      const stringIds = ids.map(id => id.toString());
      const result = await bulkDelete(stringIds);
      if (result) {
        await fetchData();
        return result;
      }
      return false;
    } catch (error) {
      console.error('Error deleting pantalones:', error);
      throw error;
    }
  }, [bulkDelete, fetchData]);

  /**
   * Calcula estadísticas derivadas del conjunto de datos de pantalones
   */
  const stats: PantalonStats | null = useMemo(() => {
    if (!effectiveData || effectiveData.length === 0) return null;

    const valorTotal = dataWithPrices.reduce((sum, pantalon) => {
      return sum + pantalon.precioTotal;
    }, 0);

    const conStock = effectiveData.filter(p => {
      const cantidad = parseInt(p.cantidad || "0", 10);
      return !isNaN(cantidad) && cantidad > 0;
    }).length;

    const sinStock = effectiveData.length - conStock;

    const allTallas = effectiveData.flatMap(p => Object.keys(p.tallas_disponibles || {}));
    const tallasUnicas = new Set(allTallas).size;

    return {
      total: effectiveData.length,
      conStock,
      sinStock,
      valorTotal,
      valorPromedio: effectiveData.length > 0 ? valorTotal / effectiveData.length : 0,
      tallasUnicas,
    };
  }, [effectiveData, dataWithPrices]);

  // Debug logging
  console.log('🔍 Debug usePantalones:', {
    hasInitialData,
    dataFromAPI: data,
    dataLength: data?.length,
    effectiveDataLength: effectiveData.length,
    dataWithPricesLength: dataWithPrices.length,
    effectiveDataItems: effectiveData.map(item => ({ 
      referencia: item.referencia, 
      nombre: item.nombre 
    })),
    loading,
    timestamp: new Date().toLocaleTimeString()
  });

  // Wrapper para deletePantalon que asegura tipo Promise<void>
  const deletePantalon = useCallback(async (id: string | number): Promise<void> => {
    await remove(id);
  }, [remove]);

  return {
    // Estado (usando datos efectivos)
    data: effectiveData,
    dataWithPrices,
    loading: !hasInitialData ? loading : false,
    error,
    stats,

    // Acciones CRUD estándar
    createPantalon,
    updatePantalon,
    deletePantalon,
    deleteMultiplePantalones,

    // Refrescar datos
    refetch: async () => {
      await fetchData();
    },
  };
}

// Re-exportar tipos para uso en otros archivos
export type { Pantalon, PantalonWithPrice };
