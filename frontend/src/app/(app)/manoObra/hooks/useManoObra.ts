// ============================================================================
// HOOK CENTRALIZADO PARA EL MÓDULO MANO DE OBRA
// ============================================================================

import { useMemo, useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';

import type {
  ManoObra,
  ManoObraWithStats,
  ManoObraStats,
  CreateManoObraData,
  UpdateManoObraData
} from '../types';

import {
  calculateManoObraStats,
  enrichManoObraWithStats
} from '../types';

import {
  validateManoObraData,
  sanitizeManoObraData
} from '../lib/api';

// Importar el hook existente como fallback
import { useApi } from '@/hooks/useApi';
import { useCompany } from '@/context/CompanyContext';

interface UseManoObraOptions {
  initialData?: ManoObra[];
  autoFetch?: boolean;
}

interface UseManoObraReturn {
  data: ManoObra[];
  dataWithStats: ManoObraWithStats[];
  loading: boolean;
  error: unknown;
  stats: ManoObraStats | null;
  createManoObra: (data: CreateManoObraData) => Promise<ManoObra | null>;
  updateManoObra: (id: string | number, data: UpdateManoObraData) => Promise<ManoObra | null>;
  deleteManoObra: (id: string | number) => Promise<void>;
  deleteMultipleManoObra: (ids: (string | number)[]) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useManoObra({
  initialData = [],
  autoFetch = true
}: UseManoObraOptions): UseManoObraReturn {
  const api = useApi({ showErrorToast: true });
  const { selectedCompany } = useCompany();

  const sortByReferenciaAsc = useCallback((items: ManoObra[]) => {
    return [...items].sort((a, b) => {
      const aNum = Number(a.referencia);
      const bNum = Number(b.referencia);

      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return aNum - bNum;
      }

      return String(a.referencia).localeCompare(String(b.referencia));
    });
  }, []);

  // Por simplicidad, usamos los datos pasados como prop inicialmente
  // En una implementación futura, esto podría usar useStandardApi
  const [data, setData] = useState<ManoObra[]>(sortByReferenciaAsc(initialData));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Fetch data function usando useApi existente (más compatible)
  const fetchData = useCallback(async () => {
    if (!autoFetch) return;

    try {
      setLoading(true);
      setError(null);
      // Usar el hook useApi existente que maneja la autenticación automáticamente
      const result = await api.get("/manos-de-obra");
      if (result) {
        const dataArray = Array.isArray(result) ? result : [];
        setData(sortByReferenciaAsc(dataArray));
      }
    } catch (err) {
      console.error('Error fetching mano obra data:', err);
      setError(err);
      // No mostrar toast de error aquí porque useApi ya lo maneja
    } finally {
      setLoading(false);
    }
  }, [api.get, autoFetch, selectedCompany, sortByReferenciaAsc]);

  // Auto-fetch on mount and when company changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, selectedCompany]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    return calculateManoObraStats(data);
  }, [data]);

  // Enriquecer datos con estadísticas
  const dataWithStats = useMemo(() => {
    if (!stats) return [];
    return enrichManoObraWithStats(data, stats);
  }, [data, stats]);

  // CRUD operations usando useApi existente
  const createManoObra = useCallback(async (createData: CreateManoObraData): Promise<ManoObra | null> => {
    try {
      // Validar datos
      const validationErrors = validateManoObraData(createData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Sanitizar datos
      const sanitizedData = sanitizeManoObraData(createData);

      const result = await api.post("/manos-de-obra", sanitizedData);

      // Actualizar estado local
      if (result) {
        setData(prev => sortByReferenciaAsc([...prev, result as ManoObra]));
        toast.success('Servicio creado exitosamente');
        return result as ManoObra;
      }

      return null;
    } catch (error) {
      console.error('Error creating mano de obra:', error);
      const message = error instanceof Error ? error.message : 'Error al crear el servicio';
      toast.error(message);
      throw error;
    }
  }, [api.post, sortByReferenciaAsc]);

  const updateManoObra = useCallback(async (id: string | number, updateData: UpdateManoObraData): Promise<ManoObra | null> => {
    try {
      // Validar datos
      const validationErrors = validateManoObraData(updateData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Sanitizar datos
      const sanitizedData = sanitizeManoObraData(updateData);

      const result = await api.put(`/manos-de-obra/${id}`, sanitizedData);

      // Actualizar estado local
      if (result) {
        setData(prev => sortByReferenciaAsc(prev.map(item =>
          item.referencia === id || item.referencia === String(id) ? { ...item, ...(result as ManoObra) } : item
        )));
        toast.success('Servicio actualizado exitosamente');
        return result as ManoObra;
      }

      return null;
    } catch (error) {
      console.error('Error updating mano de obra:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar el servicio';
      toast.error(message);
      throw error;
    }
  }, [api.put, sortByReferenciaAsc]);

  const deleteManoObra = useCallback(async (id: string | number): Promise<void> => {
    try {
      await api.delete(`/manos-de-obra/${id}`);

      // Actualizar estado local
      setData(prev => prev.filter(item =>
        item.referencia !== id && item.referencia !== String(id)
      ));

      toast.success('Servicio eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting mano de obra:', error);
      const message = error instanceof Error ? error.message : 'Error al eliminar el servicio';
      toast.error(message);
      throw error;
    }
  }, [api.delete]);

  const deleteMultipleManoObra = useCallback(async (ids: (string | number)[]): Promise<void> => {
    try {
      if (ids.length === 0) {
        throw new Error('No se seleccionaron servicios para eliminar');
      }

      // Eliminar uno por uno usando el API existente
      await Promise.all(ids.map(id => api.delete(`/manos-de-obra/${id}`)));

      // Actualizar estado local
      setData(prev => prev.filter(item =>
        !ids.includes(item.referencia) && !ids.includes(String(item.referencia))
      ));

      toast.success(`${ids.length} servicios eliminados exitosamente`);
    } catch (error) {
      console.error('Error deleting multiple mano de obra:', error);
      const message = error instanceof Error ? error.message : 'Error al eliminar los servicios';
      toast.error(message);
      throw error;
    }
  }, [api.delete]);

  // Debug logging
  console.log('🔍 Debug useManoObra:', {
    dataLength: data.length,
    dataWithStatsLength: dataWithStats.length,
    loading,
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toLocaleTimeString()
  });

  return {
    // Estado
    data,
    dataWithStats,
    loading,
    error,
    stats,
    
    // Acciones CRUD con validación
    createManoObra,
    updateManoObra,
    deleteManoObra,
    deleteMultipleManoObra,
    
    // Refrescar datos
    refetch: fetchData,
  };
}
