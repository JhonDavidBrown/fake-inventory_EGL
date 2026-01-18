// ============================================================================
// CAPA DE API DESACOPLADA PARA EL MÓDULO MANO DE OBRA
// ============================================================================

import type { ManoObra, CreateManoObraData, UpdateManoObraData } from '../types';

// Endpoints del módulo
const ENDPOINTS = {
  base: '/manos-de-obra',
  byId: (id: string | number) => `/manos-de-obra/${id}`,
  search: '/manos-de-obra/search',
  bulk: '/manos-de-obra/bulk',
} as const;

// ============================================================================
// FUNCIONES DE API QUE SERÁN USADAS POR EL HOOK
// ============================================================================

/**
 * Función base para hacer requests con token
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Obtiene todos los servicios de mano de obra
 */
export async function getManoObraData(token?: string): Promise<ManoObra[]> {
  try {
    const response = await apiRequest<ManoObra[]>(ENDPOINTS.base, { 
      method: 'GET', 
      token 
    });
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching mano de obra data:', error);
    throw new Error('No se pudieron cargar los servicios de mano de obra');
  }
}

/**
 * Crea un nuevo servicio de mano de obra
 */
export async function createManoObra(
  data: CreateManoObraData, 
  token?: string
): Promise<ManoObra> {
  try {
    // Validación básica
    if (!data.referencia?.trim()) {
      throw new Error('La referencia es requerida');
    }
    if (!data.nombre?.trim()) {
      throw new Error('El nombre del servicio es requerido');
    }
    if (!data.precio || data.precio <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }

    return await apiRequest<ManoObra>(ENDPOINTS.base, {
      method: 'POST',
      body: JSON.stringify(data),
      token
    });
  } catch (error) {
    console.error('Error creating mano de obra:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo crear el servicio de mano de obra');
  }
}

/**
 * Actualiza un servicio de mano de obra existente
 */
export async function updateManoObra(
  id: string | number, 
  data: UpdateManoObraData,
  token?: string
): Promise<ManoObra> {
  try {
    // Validación básica
    if (data.precio !== undefined && data.precio <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    if (data.nombre !== undefined && !data.nombre.trim()) {
      throw new Error('El nombre del servicio no puede estar vacío');
    }

    return await apiRequest<ManoObra>(ENDPOINTS.byId(id), {
      method: 'PUT',
      body: JSON.stringify(data),
      token
    });
  } catch (error) {
    console.error(`Error updating mano de obra ${id}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo actualizar el servicio de mano de obra');
  }
}

/**
 * Elimina un servicio de mano de obra
 */
export async function deleteManoObra(
  id: string | number, 
  token?: string
): Promise<void> {
  try {
    await apiRequest<void>(ENDPOINTS.byId(id), {
      method: 'DELETE',
      token
    });
  } catch (error) {
    console.error(`Error deleting mano de obra ${id}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudo eliminar el servicio de mano de obra');
  }
}

/**
 * Elimina múltiples servicios de mano de obra
 */
export async function deleteManoObraBulk(
  ids: (string | number)[], 
  token?: string
): Promise<void> {
  try {
    if (ids.length === 0) {
      throw new Error('No se proporcionaron IDs para eliminar');
    }

    await apiRequest<void>(ENDPOINTS.bulk, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
      token
    });
  } catch (error) {
    console.error('Error deleting multiple mano de obra:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('No se pudieron eliminar los servicios seleccionados');
  }
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Valida los datos antes de enviar al servidor
 */
export function validateManoObraData(data: CreateManoObraData | UpdateManoObraData): string[] {
  const errors: string[] = [];

  // Validar referencia (solo para creación)
  if ('referencia' in data) {
    if (!data.referencia || !data.referencia.trim()) {
      errors.push('La referencia es requerida');
    } else if (data.referencia.length > 50) {
      errors.push('La referencia no puede tener más de 50 caracteres');
    }
  }

  // Validar nombre
  if (data.nombre !== undefined) {
    if (!data.nombre || !data.nombre.trim()) {
      errors.push('El nombre del servicio es requerido');
    } else if (data.nombre.length > 255) {
      errors.push('El nombre no puede tener más de 255 caracteres');
    }
  }

  // Validar precio
  if (data.precio !== undefined) {
    if (!data.precio || data.precio <= 0) {
      errors.push('El precio debe ser mayor a 0');
    } else if (data.precio > 999999999) {
      errors.push('El precio es demasiado alto');
    }
  }

  return errors;
}

/**
 * Sanitiza los datos de entrada
 */
export function sanitizeManoObraData<T extends CreateManoObraData | UpdateManoObraData>(data: T): T {
  const sanitized = { ...data };

  if ('referencia' in sanitized && sanitized.referencia) {
    sanitized.referencia = sanitized.referencia.trim().toUpperCase();
  }

  if (sanitized.nombre) {
    sanitized.nombre = sanitized.nombre.trim();
  }

  if (sanitized.descripcion) {
    sanitized.descripcion = sanitized.descripcion.trim() || undefined;
  }

  if (sanitized.proveedor) {
    sanitized.proveedor = sanitized.proveedor.trim() || undefined;
  }

  if (sanitized.precio) {
    sanitized.precio = Number(Number(sanitized.precio).toFixed(2));
  }

  return sanitized;
}
