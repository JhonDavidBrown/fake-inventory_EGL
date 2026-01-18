// ============================================================================
// TIPOS DEL MÓDULO PANTALONES
// ============================================================================

// Tipos principales basados en la respuesta de la API
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

export interface Pantalon {
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

export interface PantalonWithPrice extends Pantalon {
  precioTotal: number;
}

// ============================================================================
// TIPOS PARA OPERACIONES CRUD
// ============================================================================

export interface CreatePantalonData {
  nombre: string;
  imagen_url?: string;
  tallas_disponibles: TallasDisponibles;
  precio_individual?: number;
  cantidad?: string;
  insumos?: Array<{
    referencia: number;
    cantidad_usada: number;
  }>;
  procesos?: Array<{
    referencia: number;
  }>;
}

export interface UpdatePantalonData {
  nombre?: string;
  imagen_url?: string;
  tallas_disponibles?: TallasDisponibles;
  precio_individual?: number;
  cantidad?: string;
  insumos?: Array<{
    referencia: number;
    cantidad_usada: number;
  }>;
  procesos?: Array<{
    referencia: number;
  }>;
}

// ============================================================================
// TIPOS PARA FILTROS Y BÚSQUEDA
// ============================================================================

export interface PantalonFilters {
  search?: string;
  talla?: string;
  precio_min?: number;
  precio_max?: number;
  estado?: string;
}

export type PantalonSortField = 'nombre' | 'referencia' | 'precio_individual' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface PantalonSortOptions {
  field: PantalonSortField;
  direction: SortDirection;
}

// ============================================================================
// TIPOS PARA ESTADÍSTICAS
// ============================================================================

export interface PantalonStats {
  total: number;
  conStock: number;
  sinStock: number;
  valorTotal: number;
  valorPromedio: number;
  tallasUnicas: number;
}

// ============================================================================
// TIPOS PARA RESPUESTAS DE API
// ============================================================================

export interface PantalonApiResponse {
  success: boolean;
  data: Pantalon;
  message?: string;
}

export interface PantalonesListResponse {
  success: boolean;
  data: Pantalon[];
  message?: string;
}

// ============================================================================
// TIPOS PARA VALIDACIÓN
// ============================================================================

export interface PantalonValidation {
  nombre: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  tallas_disponibles: {
    required: boolean;
    minItems: number;
  };
  precio_individual: {
    min: number;
    max: number;
  };
}

export const PANTALON_VALIDATION: PantalonValidation = {
  nombre: {
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  tallas_disponibles: {
    required: true,
    minItems: 1,
  },
  precio_individual: {
    min: 0,
    max: 999999,
  },
};

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

/**
 * Calcula el precio total de un pantalón basado en sus insumos y procesos
 */
export function calculatePantalonPrice(pantalon: Pantalon): number {
  const insumosTotal = pantalon.insumos.reduce((total, insumo) => {
    return total + parseFloat(insumo.preciounidad) * insumo.PantalonInsumo.cantidad_usada;
  }, 0);

  const procesosTotal = pantalon.procesos.reduce((total, proceso) => {
    return total + proceso.precio;
  }, 0);

  return insumosTotal + procesosTotal;
}

/**
 * Formatea el precio para mostrar
 */
export function formatPantalonPrice(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(precio);
}

/**
 * Obtiene las tallas únicas de una lista de pantalones
 */
export function getUniqueTallas(pantalones: Pantalon[]): string[] {
  const allTallas = pantalones.flatMap(p => {
    if (Array.isArray(p.tallas_disponibles)) {
      return p.tallas_disponibles;
    }
    return Object.keys(p.tallas_disponibles || {});
  });
  return Array.from(new Set(allTallas)).sort();
}

/**
 * Filtra pantalones basado en criterios
 */
export function filterPantalones(
  pantalones: Pantalon[],
  filters: PantalonFilters
): Pantalon[] {
  return pantalones.filter(pantalon => {
    if (filters.search && !pantalon.nombre.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.talla) {
      const tallas = Array.isArray(pantalon.tallas_disponibles)
        ? pantalon.tallas_disponibles
        : Object.keys(pantalon.tallas_disponibles || {});
      if (!tallas.includes(filters.talla)) {
        return false;
      }
    }
    
    const precio = calculatePantalonPrice(pantalon);
    if (filters.precio_min && precio < filters.precio_min) {
      return false;
    }
    
    if (filters.precio_max && precio > filters.precio_max) {
      return false;
    }
    
    return true;
  });
}

/**
 * Ordena pantalones basado en criterios
 */
export function sortPantalones(
  pantalones: Pantalon[],
  sortOptions: PantalonSortOptions
): Pantalon[] {
  return [...pantalones].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    
    switch (sortOptions.field) {
      case 'nombre':
        aValue = a.nombre.toLowerCase();
        bValue = b.nombre.toLowerCase();
        break;
      case 'referencia':
        aValue = a.referencia;
        bValue = b.referencia;
        break;
      case 'precio_individual':
        aValue = calculatePantalonPrice(a);
        bValue = calculatePantalonPrice(b);
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return sortOptions.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOptions.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}
