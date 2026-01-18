import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useResource } from '@/hooks/useStandardApi';

// SOLO usar el tipo de dashboard que coincide con la API real
import type { Insumo } from "@/types/dashboard";

// Interfaces para las acciones (definidas localmente)
interface AddStockData {
  cantidad: number;
  precio_compra?: number;
  nota?: string;
}

interface InsumoStats {
  total: number;
  disponibles: number;
  bajoStock: number;
  agotados: number;
  valorTotal: number;
  valorPromedio: number;
  tiposUnicos: number;
}

interface UseInsumosOptions {
  initialData?: Insumo[];
}

interface UseInsumosReturn {
  data: Insumo[];
  loading: boolean;
  error: unknown;
  stats: InsumoStats | null;
  createInsumo: (data: Partial<Insumo>) => Promise<Insumo | false>;
  updateInsumo: (id: string, data: Partial<Insumo>) => Promise<Insumo | false>;
  deleteInsumo: (id: string) => Promise<void>;
  deleteMultipleInsumos: (ids: string[]) => Promise<unknown>;
  addStock: (id: string, stockData: AddStockData) => Promise<boolean>;
  refetch: () => void;
}

export function useInsumos({ initialData = [] }: UseInsumosOptions): UseInsumosReturn {
  const hasInitialData = initialData.length > 0;
  
  const {
    data,
    loading,
    error,
    create,
    update,
    remove,
    bulkDelete,
    refetch,
    api,
  } = useResource<Insumo>('/insumos', { 
    autoFetch: true,
    showErrorToast: true,
  });

  // ✅ CAMBIAR: Usar data SIEMPRE que esté disponible
  // Solo usar initialData si nunca hemos hecho fetch exitoso
  const effectiveData: Insumo[] = useMemo(() => {
    // Si data tiene contenido (incluso un array vacío desde la API), usar data
    if (data !== null && data !== undefined) {
      return data;
    }
    // Solo usar initialData si nunca hemos recibido respuesta de la API
    return initialData;
  }, [data, initialData]);

  /**
   * Acción personalizada para añadir stock a un insumo.
   */
  const addStock = useCallback(
    async (id: string, stockData: AddStockData) => {
      try {
        const result = await api.post(`/insumos/${id}/add-stock`, stockData);
        
        if (result) {
          toast.success(`Stock añadido exitosamente`);
          // ✅ Refetch inmediato
          await refetch();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error adding stock:', error);
        return false;
      }
    },
    [api, refetch]
  );

  // ✅ CAMBIAR: Hacer el refetch síncrono y más directo
  const createInsumo = useCallback(async (data: Partial<Insumo>): Promise<Insumo | false> => {
    console.log('🚀 createInsumo iniciando...');
    try {
      const result = await create(data);
      console.log('✅ create result:', result);

      if (result) {
        console.log('🔄 Ejecutando refetch...');
        await refetch();
        console.log('✅ Refetch completado');
        return result as Insumo;
      }
      return false;
    } catch (error) {
      console.error('❌ Error creating insumo:', error);
      throw error;
    }
  }, [create, refetch]);

  const updateInsumo = useCallback(async (id: string, data: Partial<Insumo>): Promise<Insumo | false> => {
    try {
      const result = await update(id, data);
      if (result) {
        await refetch();
        return result as Insumo;
      }
      return false;
    } catch (error) {
      console.error('Error updating insumo:', error);
      throw error;
    }
  }, [update, refetch]);

  const deleteInsumo = useCallback(async (id: string): Promise<void> => {
    try {
      await remove(id);
      await refetch();
    } catch (error) {
      console.error('Error deleting insumo:', error);
      throw error;
    }
  }, [remove, refetch]);

  const deleteMultipleInsumos = useCallback(async (ids: string[]) => {
    try {
      const result = await bulkDelete(ids);
      if (result) {
        await refetch();
        return result;
      }
      return false;
    } catch (error) {
      console.error('Error deleting insumos:', error);
      throw error;
    }
  }, [bulkDelete, refetch]);

  /**
   * Calcula estadísticas derivadas del conjunto de datos de insumos.
   */
  const stats: InsumoStats | null = useMemo(() => {
    if (!effectiveData || effectiveData.length === 0) return null;

    const valorTotal = effectiveData.reduce((sum, insumo) => {
      const cantidad = parseFloat(insumo.cantidad || "0");
      const precio = parseFloat(insumo.preciounidad || "0");
      return sum + (cantidad * precio);
    }, 0);

    return {
      total: effectiveData.length,
      disponibles: effectiveData.filter(i => i.estado === 'disponible').length,
      bajoStock: effectiveData.filter(i => i.estado === 'bajo stock').length,
      agotados: effectiveData.filter(i => i.estado === 'agotado').length,
      valorTotal: valorTotal,
      valorPromedio: effectiveData.length > 0 ? valorTotal / effectiveData.length : 0,
      tiposUnicos: new Set(effectiveData.map(i => i.tipo)).size,
    };
  }, [effectiveData]);

  // ✅ Debug corregido - usar las propiedades que SÍ existen en dashboard
  console.log('🔍 Debug useInsumos:', {
    hasInitialData: hasInitialData,
    dataFromAPI: data,
    dataIsNull: data === null,
    dataIsUndefined: data === undefined,
    dataLength: data?.length,
    effectiveData: effectiveData.length,
    // ✅ CAMBIAR: usar referencia en lugar de id
    effectiveDataItems: effectiveData.map(item => ({ 
      referencia: item.referencia, 
      nombre: item.nombre 
    })),
    loading,
    timestamp: new Date().toLocaleTimeString()
  });

  return {
    // Estado (usando datos efectivos)
    data: effectiveData,
    loading: !hasInitialData ? loading : false,
    error,
    stats,

    // Acciones CRUD estándar
    createInsumo,
    updateInsumo,
    deleteInsumo,
    deleteMultipleInsumos,

    // Acción personalizada
    addStock,

    // Refrescar datos
    refetch,
  };
}

// Re-exportar el tipo para uso en otros archivos
export type { Insumo };