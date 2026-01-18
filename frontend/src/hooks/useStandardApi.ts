/**
 * Standardized API client utilities
 * 
 * This file provides utilities and patterns for consistent API usage
 * across the application using the useApi hook.
 */

import { useApi } from "@/hooks/useApi";
import { useCallback, useState, useEffect, useRef, useContext } from "react";
import { toast } from "sonner";
import { CompanyContext } from "@/context/CompanyContext";

/**
 * Standard hook for CRUD operations on a resource
 * 
 * @param endpoint - The API endpoint (e.g., "/insumos", "/pantalones")
 * @param options - Configuration options
 */
export function useResource<T>(
  endpoint: string,
  options: {
    showErrorToast?: boolean;
    autoFetch?: boolean;
  } = {}
) {
  const { showErrorToast = true, autoFetch = true } = options;
  const api = useApi({ showErrorToast });
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false); // Para prevenir peticiones concurrentes
  const lastFetchRef = useRef(0); // Para rate limiting

  // Obtener la empresa actual del contexto (si está disponible)
  const context = useContext(CompanyContext);
  const selectedCompany = context?.selectedCompany;

  const fetchData = useCallback(async () => {
    // Prevenir peticiones concurrentes
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    // Rate limiting: esperar al menos 1 segundo entre peticiones
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;
    if (timeSinceLastFetch < 1000) {
      console.log('Rate limiting: waiting before next fetch...');
      setTimeout(() => fetchData(), 1000 - timeSinceLastFetch);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    lastFetchRef.current = now;

    try {
      console.log(`📡 [useResource] Fetching ${endpoint} for company: ${selectedCompany || 'default'}`);
      const result = await api.get(endpoint);
      if (result) {
        console.log(`✅ [useResource] Datos recibidos para ${endpoint}:`, Array.isArray(result) ? `${result.length} items` : 'data');
        setData(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [api, endpoint, selectedCompany]);

  const create = useCallback(async (item: Partial<T>) => {
    const result = await api.post(endpoint, item);
    if (result) {
      toast.success("Elemento creado con éxito");
      // Delay antes del refetch
      setTimeout(() => {
        if (!fetchingRef.current) {
          fetchData();
        }
      }, 500);
      return result;
    }
    return null;
  }, [api, endpoint, fetchData]);

  const update = useCallback(async (id: string | number, item: Partial<T>) => {
    const result = await api.put(`${endpoint}/${id}`, item);
    if (result) {
      toast.success("Elemento actualizado con éxito");
      setTimeout(() => {
        if (!fetchingRef.current) {
          fetchData();
        }
      }, 500);
      return result;
    }
    return null;
  }, [api, endpoint, fetchData]);

  const remove = useCallback(async (id: string | number) => {
    const result = await api.delete(`${endpoint}/${id}`);
    if (result) {
      toast.success("Elemento eliminado con éxito");
      setTimeout(() => {
        if (!fetchingRef.current) {
          fetchData();
        }
      }, 500);
      return result;
    }
    return null;
  }, [api, endpoint, fetchData]);

  const bulkDelete = useCallback(async (ids: (string | number)[]) => {
    const result = await api.post(`${endpoint}/bulk-delete`, { ids });
    if (result) {
      toast.success(`${ids.length} elementos eliminados con éxito`);
      setTimeout(() => {
        if (!fetchingRef.current) {
          fetchData();
        }
      }, 500);
      return result;
    }
    return null;
  }, [api, endpoint, fetchData]);

  useEffect(() => {
    if (autoFetch) {
      // Delay inicial para evitar conflictos con SSR
      const timer = setTimeout(() => {
        fetchData();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoFetch, selectedCompany]); // ← CAMBIO: Depender de selectedCompany, NO de fetchData

  return {
    data,
    loading: loading || api.loading,
    error: api.error,
    refetch: fetchData,
    create,
    update,
    remove,
    bulkDelete,
    api, // For custom operations
  };
}

/**
 * Hook for single item operations (view, edit)
 */
export function useResourceItem<T>(
  endpoint: string,
  id: string | number | null,
  options: { autoFetch?: boolean } = {}
) {
  const { autoFetch = true } = options;
  const api = useApi({ showErrorToast: true });
  const [item, setItem] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  // Obtener la empresa actual del contexto (si está disponible)
  const context = useContext(CompanyContext);
  const selectedCompany = context?.selectedCompany;

  const fetchItem = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    console.log(`📡 [useResourceItem] Fetching ${endpoint}/${id} for company: ${selectedCompany || 'default'}`);
    const result = await api.get(`${endpoint}/${id}`);
    if (result) {
      console.log(`✅ [useResourceItem] Item recibido para ${endpoint}/${id}`);
      setItem(result as T);
    }
    setLoading(false);
  }, [api, endpoint, id, selectedCompany]);

  useEffect(() => {
    if (autoFetch && id) {
      fetchItem();
    }
  }, [fetchItem, autoFetch, id, selectedCompany]); // ← CAMBIO: Agregué selectedCompany

  return {
    item,
    loading: loading || api.loading,
    error: api.error,
    refetch: fetchItem,
    api,
  };
}

/**
 * Common API patterns and utilities
 */
export const ApiPatterns = {
  /**
   * Standard form submission handler
   */
  createSubmitHandler: <T>(
    api: ReturnType<typeof useApi>,
    endpoint: string,
    onSuccess?: (result: T) => void,
    onError?: (error: unknown) => void
  ) => {
    return async (data: Partial<T>) => {
      const result = await api.post(endpoint, data);
      if (result) {
        onSuccess?.(result as T);
      } else {
        onError?.(api.error);
      }
      return result;
    };
  },

  /**
   * Standard update handler
   */
  createUpdateHandler: <T>(
    api: ReturnType<typeof useApi>,
    endpoint: string,
    id: string | number,
    onSuccess?: (result: T) => void,
    onError?: (error: unknown) => void
  ) => {
    return async (data: Partial<T>) => {
      const result = await api.put(`${endpoint}/${id}`, data);
      if (result) {
        onSuccess?.(result as T);
      } else {
        onError?.(api.error);
      }
      return result;
    };
  },

  /**
   * Standard delete confirmation handler
   */
  createDeleteHandler: (
    api: ReturnType<typeof useApi>,
    endpoint: string,
    id: string | number,
    confirmMessage?: string,
    onSuccess?: () => void
  ) => {
    return async () => {
      const shouldDelete = confirmMessage
        ? window.confirm(confirmMessage)
        : true;

      if (!shouldDelete) return false;

      const result = await api.delete(`${endpoint}/${id}`);
      if (result) {
        onSuccess?.();
      }
      return result;
    };
  },
};