// ============================================================================
// API DESACOPLADA PARA EL MÓDULO PANTALONES
// ============================================================================

import { type Pantalon, type CreatePantalonData, type UpdatePantalonData } from '../types';

// Configuración base de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiOptions {
  token?: string;
  signal?: AbortSignal;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// FUNCIÓN AUXILIAR PARA REQUESTS HTTP
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & ApiOptions = {}
): Promise<T> {
  const { token, signal, ...requestOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(requestOptions.headers as HeadersInit);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  console.log(`🌐 [PANTALONES-API] ${requestOptions.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      ...requestOptions,
      headers,
      signal,
      next: { revalidate: 30 }, // Cache por 30 segundos
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP error ${response.status}`;
      
      console.error(`❌ [PANTALONES-API] Error ${response.status}:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ [PANTALONES-API] Success ${requestOptions.method || 'GET'} ${endpoint}`);
    
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`⏹️ [PANTALONES-API] Request cancelled: ${endpoint}`);
      throw error;
    }
    
    console.error(`❌ [PANTALONES-API] Network error:`, error);
    throw error;
  }
}

// ============================================================================
// OPERACIONES CRUD DE PANTALONES
// ============================================================================

/**
 * Obtiene todos los pantalones con paginación opcional
 */
export async function getPantalones(
  options: {
    token: string;
    page?: number;
    per_page?: number;
    search?: string;
    talla?: string;
    signal?: AbortSignal;
  }
): Promise<Pantalon[]> {
  const { token, page, per_page, search, talla, signal } = options;
  
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (per_page) params.append('per_page', per_page.toString());
  if (search) params.append('search', search);
  if (talla && talla !== 'all') params.append('talla', talla);

  const endpoint = `/pantalones${params.toString() ? `?${params.toString()}` : ''}`;
  
  if (page || per_page) {
    // Respuesta paginada
    const response = await apiRequest<PaginatedResponse<Pantalon>>(endpoint, {
      token,
      signal,
    });
    return response.data;
  } else {
    // Respuesta simple (todos los pantalones)
    return apiRequest<Pantalon[]>(endpoint, {
      token,
      signal,
    });
  }
}

/**
 * Obtiene un pantalón específico por ID
 */
export async function getPantalonById(
  id: string | number,
  options: ApiOptions
): Promise<Pantalon> {
  const response = await apiRequest<ApiResponse<Pantalon>>(`/pantalones/${id}`, {
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al obtener el pantalón');
  }
  
  return response.data;
}

/**
 * Obtiene un pantalón específico por referencia
 */
export async function getPantalonByReferencia(
  referencia: string | number,
  options: ApiOptions
): Promise<Pantalon> {
  const response = await apiRequest<ApiResponse<Pantalon>>(`/pantalones/referencia/${referencia}`, {
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al obtener el pantalón');
  }
  
  return response.data;
}

/**
 * Crea un nuevo pantalón
 */
export async function createPantalon(
  data: CreatePantalonData,
  options: ApiOptions
): Promise<Pantalon> {
  const response = await apiRequest<ApiResponse<Pantalon>>('/pantalones', {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al crear el pantalón');
  }
  
  return response.data;
}

/**
 * Actualiza un pantalón existente
 */
export async function updatePantalon(
  id: string | number,
  data: UpdatePantalonData,
  options: ApiOptions
): Promise<Pantalon> {
  const response = await apiRequest<ApiResponse<Pantalon>>(`/pantalones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al actualizar el pantalón');
  }
  
  return response.data;
}

/**
 * Elimina un pantalón
 */
export async function deletePantalon(
  id: string | number,
  options: ApiOptions
): Promise<void> {
  const response = await apiRequest<ApiResponse<null>>(`/pantalones/${id}`, {
    method: 'DELETE',
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al eliminar el pantalón');
  }
}

// ============================================================================
// OPERACIONES EN LOTE
// ============================================================================

/**
 * Elimina múltiples pantalones
 */
export async function deleteMultiplePantalones(
  ids: (string | number)[],
  options: ApiOptions
): Promise<{ deleted: number; failed: string[] }> {
  const response = await apiRequest<ApiResponse<{ deleted: number; failed: string[] }>>('/pantalones/bulk-delete', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al eliminar pantalones');
  }
  
  return response.data;
}

/**
 * Actualiza múltiples pantalones
 */
export async function updateMultiplePantalones(
  updates: Array<{ id: string | number; data: UpdatePantalonData }>,
  options: ApiOptions
): Promise<{ updated: number; failed: string[] }> {
  const response = await apiRequest<ApiResponse<{ updated: number; failed: string[] }>>('/pantalones/bulk-update', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al actualizar pantalones');
  }
  
  return response.data;
}

// ============================================================================
// OPERACIONES DE ESTADÍSTICAS
// ============================================================================

/**
 * Obtiene estadísticas de inventario de pantalones
 */
export async function getPantalonStats(
  options: ApiOptions
): Promise<{
  total: number;
  conStock: number;
  sinStock: number;
  valorTotal: number;
  valorPromedio: number;
  tallasUnicas: number;
}> {
  const response = await apiRequest<ApiResponse<{
    total: number;
    conStock: number;
    sinStock: number;
    valorTotal: number;
    valorPromedio: number;
    tallasUnicas: number;
  }>>('/pantalones/stats', {
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al obtener estadísticas');
  }
  
  return response.data;
}

// ============================================================================
// OPERACIONES DE VALIDACIÓN
// ============================================================================

/**
 * Verifica si una referencia está disponible
 */
export async function checkReferenciaAvailability(
  referencia: string | number,
  options: ApiOptions & { excludeId?: string | number }
): Promise<{ available: boolean; suggestion?: string }> {
  const { excludeId, ...apiOptions } = options;
  
  const params = new URLSearchParams();
  if (excludeId) params.append('exclude', excludeId.toString());
  
  const endpoint = `/pantalones/check-referencia/${referencia}${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await apiRequest<ApiResponse<{ available: boolean; suggestion?: string }>>(endpoint, {
    ...apiOptions,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al verificar referencia');
  }
  
  return response.data;
}

// ============================================================================
// UTILIDADES DE EXPORTACIÓN
// ============================================================================

/**
 * Exporta pantalones a CSV
 */
export async function exportPantalonesToCSV(
  options: ApiOptions & {
    filters?: {
      search?: string;
      talla?: string;
    };
  }
): Promise<Blob> {
  const { filters, ...apiOptions } = options;
  
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.talla && filters.talla !== 'all') params.append('talla', filters.talla);
  
  const endpoint = `/pantalones/export/csv${params.toString() ? `?${params.toString()}` : ''}`;
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${apiOptions.token}`,
    },
    signal: apiOptions.signal,
  });
  
  if (!response.ok) {
    throw new Error(`Error al exportar CSV: ${response.status}`);
  }
  
  return response.blob();
}

// ============================================================================
// UTILIDADES DE CACHÉ
// ============================================================================

/**
 * Invalida el caché de pantalones
 */
export async function revalidatePantalonesCache(
  options: ApiOptions
): Promise<void> {
  await apiRequest<ApiResponse<null>>('/pantalones/revalidate', {
    method: 'POST',
    ...options,
  });
}

// ============================================================================
// HOOKS HELPER FUNCTIONS
// ============================================================================

/**
 * Función helper para el hook usePantalones - obtiene pantalones con reintentos
 */
export async function fetchPantalonesWithRetry(
  options: ApiOptions & {
    retries?: number;
    delay?: number;
  }
): Promise<Pantalon[]> {
  const { retries = 3, delay = 1000, ...apiOptions } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await getPantalones({ token: apiOptions.token!, signal: apiOptions.signal });
    } catch (error) {
      if (attempt === retries) {
        throw handleApiError(error);
      }
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * Función helper para manejar operaciones optimistas
 */
export async function optimisticUpdate<T>(
  operation: () => Promise<T>,
  rollback: () => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('🔄 [PANTALONES-API] Optimistic update failed, rolling back:', error);
    rollback();
    throw error;
  }
}

// Helper para normalizar/registrar errores de API
function handleApiError(error: unknown): Error {
  // Log para desarrollo/telemetría
  if (process.env.NODE_ENV === "development") {
    console.error("PANTALONES API Error:", error);
  }
  if (error instanceof Error) {
    return error;
  }
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}
