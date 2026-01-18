import { type Insumo, type CreateInsumoData, type UpdateInsumoData, type AddStockData } from '../types';

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

// Función auxiliar para hacer requests HTTP
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & ApiOptions = {}
): Promise<T> {
  const { token, signal, ...requestOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
  // Usar Headers para evitar problemas de tipado con HeadersInit
  const headers = new Headers(requestOptions.headers as HeadersInit);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  console.log(`🌐 [API] ${requestOptions.method || 'GET'} ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      ...requestOptions,
      headers, // Headers es aceptado por fetch
      signal,
      next: { revalidate: 30 }, // Cache por 30 segundos
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP error ${response.status}`;
      
      console.error(`❌ [API] Error ${response.status}:`, errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log(`✅ [API] Success ${requestOptions.method || 'GET'} ${endpoint}`);
    
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`⏹️ [API] Request cancelled: ${endpoint}`);
      throw error;
    }
    
    console.error(`❌ [API] Network error:`, error);
    throw error;
  }
}

// =====================================
// OPERACIONES CRUD DE INSUMOS
// =====================================

/**
 * Obtiene todos los insumos con paginación opcional
 */
export async function getInsumos(
  options: {
    token: string;
    page?: number;
    per_page?: number;
    search?: string;
    tipo?: string;
    estado?: string;
    signal?: AbortSignal;
  }
): Promise<Insumo[]> {
  const { token, page, per_page, search, tipo, estado, signal } = options;
  
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (per_page) params.append('per_page', per_page.toString());
  if (search) params.append('search', search);
  if (tipo && tipo !== 'all') params.append('tipo', tipo);
  if (estado && estado !== 'all') params.append('estado', estado);

  const endpoint = `/insumos${params.toString() ? `?${params.toString()}` : ''}`;
  
  if (page || per_page) {
    // Respuesta paginada
    const response = await apiRequest<PaginatedResponse<Insumo>>(endpoint, {
      token,
      signal,
    });
    return response.data;
  } else {
    // Respuesta simple (todos los insumos)
    return apiRequest<Insumo[]>(endpoint, {
      token,
      signal,
    });
  }
}

/**
 * Obtiene un insumo específico por ID
 */
export async function getInsumoById(
  id: string,
  options: ApiOptions
): Promise<Insumo> {
  const response = await apiRequest<ApiResponse<Insumo>>(`/insumos/${id}`, {
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al obtener el insumo');
  }
  
  return response.data;
}

/**
 * Obtiene un insumo específico por referencia
 */
export async function getInsumoByReferencia(
  referencia: string,
  options: ApiOptions
): Promise<Insumo> {
  const response = await apiRequest<ApiResponse<Insumo>>(`/insumos/referencia/${referencia}`, {
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al obtener el insumo');
  }
  
  return response.data;
}

/**
 * Crea un nuevo insumo
 */
export async function createInsumo(
  data: CreateInsumoData,
  options: ApiOptions
): Promise<Insumo> {
  const response = await apiRequest<ApiResponse<Insumo>>('/insumos', {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al crear el insumo');
  }
  
  return response.data;
}

/**
 * Actualiza un insumo existente
 */
export async function updateInsumo(
  id: string,
  data: UpdateInsumoData,
  options: ApiOptions
): Promise<Insumo> {
  const response = await apiRequest<ApiResponse<Insumo>>(`/insumos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al actualizar el insumo');
  }
  
  return response.data;
}

/**
 * Elimina un insumo
 */
export async function deleteInsumo(
  id: string,
  options: ApiOptions
): Promise<void> {
  const response = await apiRequest<ApiResponse<null>>(`/insumos/${id}`, {
    method: 'DELETE',
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al eliminar el insumo');
  }
}

/**
 * Añade stock a un insumo existente
 */
export async function addStockToInsumo(
  id: string,
  data: AddStockData,
  options: ApiOptions
): Promise<Insumo> {
  const response = await apiRequest<ApiResponse<Insumo>>(`/insumos/${id}/add-stock`, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Error al añadir stock');
  }
  
  return response.data;
}

// =====================================
// OPERACIONES EN LOTE - TODO: Implementar en backend
// =====================================

// Las siguientes funciones están comentadas porque los endpoints no existen en el backend.
// Descomentar cuando se implementen los endpoints correspondientes.

/*
export async function deleteMultipleInsumos(
  ids: string[],
  options: ApiOptions
): Promise<{ deleted: number; failed: string[] }> {
  const response = await apiRequest<ApiResponse<{ deleted: number; failed: string[] }>>('/insumos/bulk-delete', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
    ...options,
  });

  if (!response.success) {
    throw new Error(response.message || 'Error al eliminar insumos');
  }

  return response.data;
}

export async function updateMultipleInsumos(
  updates: Array<{ id: string; data: UpdateInsumoData }>,
  options: ApiOptions
): Promise<{ updated: number; failed: string[] }> {
  const response = await apiRequest<ApiResponse<{ updated: number; failed: string[] }>>('/insumos/bulk-update', {
    method: 'PUT',
    body: JSON.stringify({ updates }),
    ...options,
  });

  if (!response.success) {
    throw new Error(response.message || 'Error al actualizar insumos');
  }

  return response.data;
}

// =====================================
// OPERACIONES DE ESTADÍSTICAS - TODO: Implementar en backend
// =====================================

export async function getInsumoStats(
  options: ApiOptions
): Promise<{
  total: number;
  disponibles: number;
  bajoStock: number;
  agotados: number;
  valorTotal: number;
  tiposUnicos: number;
}> {
  const response = await apiRequest<ApiResponse<{
    total: number;
    disponibles: number;
    bajoStock: number;
    agotados: number;
    valorTotal: number;
    tiposUnicos: number;
  }>>('/insumos/stats', {
    ...options,
  });

  if (!response.success) {
    throw new Error(response.message || 'Error al obtener estadísticas');
  }

  return response.data;
}

export async function getInsumoStatsByType(
  options: ApiOptions
): Promise<Record<string, { cantidad: number; valor: number }>> {
  const response = await apiRequest<ApiResponse<Record<string, { cantidad: number; valor: number }>>>('/insumos/stats/by-type', {
    ...options,
  });

  if (!response.success) {
    throw new Error(response.message || 'Error al obtener estadísticas por tipo');
  }

  return response.data;
}

// =====================================
// OPERACIONES DE VALIDACIÓN - TODO: Implementar en backend
// =====================================

export async function checkReferenciaAvailability(
  referencia: string,
  options: ApiOptions & { excludeId?: string }
): Promise<{ available: boolean; suggestion?: string }> {
  const { excludeId, ...apiOptions } = options;

  const params = new URLSearchParams();
  if (excludeId) params.append('exclude', excludeId);

  const endpoint = `/insumos/check-referencia/${referencia}${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await apiRequest<ApiResponse<{ available: boolean; suggestion?: string }>>(endpoint, {
    ...apiOptions,
  });

  if (!response.success) {
    throw new Error(response.message || 'Error al verificar referencia');
  }

  return response.data;
}

// =====================================
// UTILIDADES DE EXPORTACIÓN - TODO: Implementar en backend
// =====================================

export async function exportInsumosToCSV(
  options: ApiOptions & {
    filters?: {
      search?: string;
      tipo?: string;
      estado?: string;
    };
  }
): Promise<Blob> {
  const { filters, ...apiOptions } = options;

  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.tipo && filters.tipo !== 'all') params.append('tipo', filters.tipo);
  if (filters?.estado && filters.estado !== 'all') params.append('estado', filters.estado);

  const endpoint = `/insumos/export/csv${params.toString() ? `?${params.toString()}` : ''}`;

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

export async function exportInsumosToExcel(
  options: ApiOptions & {
    filters?: {
      search?: string;
      tipo?: string;
      estado?: string;
    };
  }
): Promise<Blob> {
  const { filters, ...apiOptions } = options;

  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.tipo && filters.tipo !== 'all') params.append('tipo', filters.tipo);
  if (filters?.estado && filters.estado !== 'all') params.append('estado', filters.estado);

  const endpoint = `/insumos/export/excel${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${apiOptions.token}`,
    },
    signal: apiOptions.signal,
  });

  if (!response.ok) {
    throw new Error(`Error al exportar Excel: ${response.status}`);
  }

  return response.blob();
}

// =====================================
// UTILIDADES DE CACHÉ - TODO: Implementar en backend
// =====================================

export async function revalidateInsumosCache(
  options: ApiOptions
): Promise<void> {
  await apiRequest<ApiResponse<null>>('/insumos/revalidate', {
    method: 'POST',
    ...options,
  });
}
*/

// =====================================
// HOOKS HELPER FUNCTIONS
// =====================================

/**
 * Función helper para el hook useInsumos - obtiene insumos con reintentos
 */
export async function fetchInsumosWithRetry(
  options: ApiOptions & {
    retries?: number;
    delay?: number;
  }
): Promise<Insumo[]> {
  const { retries = 3, ...apiOptions } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await getInsumos({ token: apiOptions.token!, signal: apiOptions.signal });
    } catch (error) {
      // ❌ ELIMINAR: console.error
      // console.error('Error fetching insumos:', error);
      throw handleApiError(error);
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
    console.warn('🔄 [API] Optimistic update failed, rolling back:', error);
    rollback();
    throw error;
  }
}

// Helper para normalizar/registrar errores de API
function handleApiError(error: unknown): Error {
  // Log para desarrollo/telemetría
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", error);
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