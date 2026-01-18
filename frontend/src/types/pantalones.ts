// Core types for the pantalones module based on API response
export interface InsumoAPI {
  referencia: number;
  nombre: string;
  unidad: string;
  preciounidad: string;
  PantalonInsumo: {
    cantidad_usada: number;
  };
}

export interface ProcesoAPI {
  referencia: number;
  nombre: string;
  precio: number;
}

// Type for tallas: can be array (legacy) or object with quantities
export type TallasDisponibles = string[] | Record<string, number>;

export interface PantalonAPI {
  referencia: number;
  nombre: string;
  imagen_url: string;
  tallas_disponibles: TallasDisponibles;
  precio_individual: number;
  cantidad: string;
  created_at: string;
  updated_at: string;
  insumos: InsumoAPI[];
  procesos: ProcesoAPI[];
}

// Legacy types for backward compatibility (can be removed later)
export interface Insumo {
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface ManoDeObra {
  nombre: string;
  precio: number;
}

export interface Pantalon {
  id: number;
  referencia: string;
  nombre: string;
  talla: string;
  imagen: string;
  insumos: Insumo[];
  manoDeObra: ManoDeObra;
}

// Extended types for pricing calculations
export interface PantalonWithPrice extends Pantalon {
  precioTotal: number;
}

export interface PantalonAPIWithPrice extends PantalonAPI {
  precioTotal: number;
}

// Utility functions for data transformation
export const transformPantalonAPIToLegacy = (
  pantalonAPI: PantalonAPI
): Pantalon => {
  return {
    id: pantalonAPI.referencia,
    referencia: pantalonAPI.referencia.toString(),
    nombre: pantalonAPI.nombre,
    talla: getTallasArray(pantalonAPI.tallas_disponibles)[0] || "", // Use first available size as default
    imagen: pantalonAPI.imagen_url,
    insumos: pantalonAPI.insumos.map((insumo) => ({
      nombre: insumo.nombre,
      cantidad: insumo.PantalonInsumo.cantidad_usada,
      precio: parseFloat(insumo.preciounidad),
    })),
    manoDeObra: {
      nombre:
        pantalonAPI.procesos.map((p) => p.nombre).join(", ") || "Sin procesos",
      precio: pantalonAPI.procesos.reduce(
        (total, proceso) => total + proceso.precio,
        0
      ),
    },
  };
};

export const calculatePantalonAPIPrice = (pantalon: PantalonAPI): number => {
  const insumosTotal = pantalon.insumos.reduce((total, insumo) => {
    return (
      total +
      parseFloat(insumo.preciounidad) * insumo.PantalonInsumo.cantidad_usada
    );
  }, 0);

  const procesosTotal = pantalon.procesos.reduce((total, proceso) => {
    return total + proceso.precio;
  }, 0);

  return insumosTotal + procesosTotal;
};

// ============================================================================
// UTILITY FUNCTIONS FOR TALLAS
// ============================================================================

/**
 * Detecta si tallas_disponibles está en formato legacy (array)
 */
export const isTallasArray = (tallas: TallasDisponibles): tallas is string[] => {
  return Array.isArray(tallas);
};

/**
 * Detecta si tallas_disponibles está en formato nuevo (objeto con cantidades)
 */
export const isTallasObject = (tallas: TallasDisponibles): tallas is Record<string, number> => {
  return !Array.isArray(tallas) && typeof tallas === 'object' && tallas !== null;
};

/**
 * Convierte array de tallas a objeto distribuyendo equitativamente
 * Ejemplo: ["32", "34", "36"] con cantidad=10 → {"32": 3, "34": 3, "36": 4}
 */
export const normalizeTallasToObject = (
  tallas: TallasDisponibles,
  cantidadTotal: number
): Record<string, number> => {
  if (isTallasObject(tallas)) {
    return tallas;
  }

  // Es array, distribuir equitativamente
  const tallasArray = tallas as string[];
  const numTallas = tallasArray.length;

  if (numTallas === 0) return {};

  const baseUnits = Math.floor(cantidadTotal / numTallas);
  const extraUnits = cantidadTotal % numTallas;

  const result: Record<string, number> = {};
  tallasArray.forEach((talla, index) => {
    result[talla] = baseUnits + (index < extraUnits ? 1 : 0);
  });

  return result;
};

/**
 * Extrae solo las tallas (sin cantidades) del formato nuevo u original
 * Devuelve siempre un array de strings
 */
export const getTallasArray = (tallas: TallasDisponibles): string[] => {
  if (isTallasArray(tallas)) {
    return tallas;
  }
  return Object.keys(tallas).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
};

/**
 * Extrae el objeto con cantidades. Si es array, distribuye equitativamente
 */
export const getTallasWithQuantities = (
  tallas: TallasDisponibles,
  cantidadTotal: number
): Record<string, number> => {
  return normalizeTallasToObject(tallas, cantidadTotal);
};

/**
 * Suma el total de unidades desde el objeto de tallas
 * Si es array, devuelve la cantidad total proporcionada
 */
export const getTotalUnitsFromTallas = (
  tallas: TallasDisponibles,
  fallbackTotal?: number
): number => {
  if (isTallasArray(tallas)) {
    return fallbackTotal || 0;
  }

  return Object.values(tallas).reduce((sum, qty) => sum + qty, 0);
};

/**
 * Valida que la suma de cantidades por talla coincida con el total
 */
export const validateTallasQuantities = (
  tallas: Record<string, number>,
  expectedTotal: number
): { isValid: boolean; actualTotal: number; difference: number } => {
  const actualTotal = Object.values(tallas).reduce((sum, qty) => sum + qty, 0);
  const difference = actualTotal - expectedTotal;

  return {
    isValid: difference === 0,
    actualTotal,
    difference,
  };
};

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Step validation types
export type StepNumber = 1 | 2 | 3 | 4 | 5;

export interface StepValidation {
  step: StepNumber;
  isValid: boolean;
  message?: string;
}
