import { z } from 'zod';
import {
  INSUMO_VALIDATION,
  type TipoInsumo,
  type EstadoInsumo
} from '../types';

// Esquemas de validación con Zod - Alineados con campos reales de la API
export const insumoBaseSchema = z.object({
  nombre: z
    .string()
    .min(INSUMO_VALIDATION.NOMBRE_MIN_LENGTH, 'El nombre debe tener al menos 2 caracteres')
    .max(INSUMO_VALIDATION.NOMBRE_MAX_LENGTH, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  referencia: z
    .string()
    .max(INSUMO_VALIDATION.REFERENCIA_MAX_LENGTH, 'La referencia no puede exceder 50 caracteres')
    .optional(),

  unidad: z.enum(['Metros', 'Unidades', 'Kilogramos', 'Cajas', 'Rollos']),

  cantidad: z
    .number()
    .min(INSUMO_VALIDATION.CANTIDAD_MIN, 'La cantidad no puede ser negativa'),

  preciounidad: z
    .number()
    .min(INSUMO_VALIDATION.PRECIO_MIN, 'El precio no puede ser negativo'),

  proveedor: z
    .string()
    .optional(),

  tipo: z
    .enum(['Tela', 'Botones', 'Taches', 'Hilos', 'Cierres', 'Cremalleras', 'Elásticos', 'Etiquetas'])
    .optional(),
});

export const createInsumoSchema = insumoBaseSchema;

export const updateInsumoSchema = insumoBaseSchema.partial().extend({
  estado: z.enum(['disponible', 'bajo stock', 'agotado']).optional(),
});

export const addStockSchema = z.object({
  cantidad: z
    .number()
    .min(0.1, 'La cantidad debe ser mayor a 0'),
  
  precio_compra: z
    .number()
    .min(0, 'El precio de compra no puede ser negativo')
    .optional(),
  
  nota: z
    .string()
    .max(500, 'La nota no puede exceder 500 caracteres')
    .optional(),
});

export const insumoFiltersSchema = z.object({
  search: z.string().optional(),
  tipo: z.union([
    z.enum(['Tela', 'Botones', 'Taches', 'Hilos', 'Cierres', 'Cremalleras', 'Elásticos', 'Etiquetas']),
    z.literal('all')
  ]).optional(),
  estado: z.union([
    z.enum(['disponible', 'bajo stock', 'agotado']),
    z.literal('all')
  ]).optional(),
  precio_min: z.number().min(0).optional(),
  precio_max: z.number().min(0).optional(),
  stock_min: z.number().min(0).optional(),
  proveedor_id: z.string().optional(),
});

// Funciones de validación
export function validateCreateInsumo(data: unknown) {
  return createInsumoSchema.safeParse(data);
}

export function validateUpdateInsumo(data: unknown) {
  return updateInsumoSchema.safeParse(data);
}

export function validateAddStock(data: unknown) {
  return addStockSchema.safeParse(data);
}

export function validateInsumoFilters(data: unknown) {
  return insumoFiltersSchema.safeParse(data);
}

// Validaciones adicionales de negocio
export function validateStockLevel(cantidad: number, tipo: TipoInsumo): EstadoInsumo {
  // Umbrales específicos por tipo de insumo
  const thresholds = {
    'Tela': { bajo: 10, agotado: 0 },
    'Botones': { bajo: 50, agotado: 0 },
    'Taches': { bajo: 20, agotado: 0 },
    'Hilos': { bajo: 5, agotado: 0 },
    'Cierres': { bajo: 25, agotado: 0 },
    'Cremalleras': { bajo: 15, agotado: 0 },
    'Elásticos': { bajo: 10, agotado: 0 },
    'Etiquetas': { bajo: 100, agotado: 0 },
  } as const;

  const threshold = thresholds[tipo] || { bajo: 10, agotado: 0 };

  if (cantidad <= threshold.agotado) return 'agotado';
  if (cantidad <= threshold.bajo) return 'bajo stock';
  return 'disponible';
}

export function validateBusinessRules(insumo: {
  nombre: string;
  cantidad: number;
  preciounidad: number;
  tipo?: TipoInsumo;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar que el nombre no contenga solo números
  if (/^\d+$/.test(insumo.nombre.trim())) {
    errors.push('El nombre no puede contener solo números');
  }

  // Validar coherencia entre cantidad y estado
  if (insumo.tipo) {
    // Se podría validar el estado esperado aquí si fuera necesario
    validateStockLevel(insumo.cantidad, insumo.tipo);
  }

  // Validar precios razonables
  if (insumo.preciounidad > 1000000) {
    errors.push('El precio unitario parece excesivamente alto');
  }

  // Validar cantidades razonables
  if (insumo.cantidad > 1000000) {
    errors.push('La cantidad disponible parece excesivamente alta');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Funciones de sanitización
export function sanitizeInsumoInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Convertir múltiples espacios en uno solo
    .replace(/[<>]/g, ''); // Remover caracteres potencialmente peligrosos
}

export function normalizeReferencia(referencia: string): string {
  return referencia
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, ''); // Solo letras, números y guiones
}

// Validaciones de unicidad (para usar con la API)
export function isDuplicateReferencia(
  referencia: string, 
  existingInsumos: Array<{ referencia: string }>,
  excludeId?: string
): boolean {
  const normalizedRef = normalizeReferencia(referencia);
  
  return existingInsumos.some(insumo => 
    normalizeReferencia(insumo.referencia) === normalizedRef &&
    insumo.referencia !== excludeId
  );
}