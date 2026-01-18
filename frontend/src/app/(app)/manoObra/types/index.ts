// ============================================================================
// TIPOS CENTRALIZADOS PARA EL MÓDULO MANO DE OBRA
// ============================================================================

// Tipo principal basado en la respuesta de la API
export interface ManoObra {
  referencia: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  proveedor?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos para operaciones CRUD
export interface CreateManoObraData {
  referencia: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  proveedor?: string;
}

export interface UpdateManoObraData {
  referencia?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  proveedor?: string;
}

// Tipos para filtros y ordenamiento
export interface ManoObraFilters {
  search?: string;
  priceRange?: [number?, number?];
  proveedor?: string;
}

export interface ManoObraSortOptions {
  field: keyof ManoObra;
  direction: 'asc' | 'desc';
}

// Tipos para estadísticas
export interface ManoObraStats {
  total: number;
  serviciosActivos: number;
  costoPromedio: number;
  costoTotal: number;
  proveedoresUnicos: number;
  servicioPorProveedor: Record<string, number>;
  rangoPrecios: {
    min: number;
    max: number;
  };
}

// Tipo para mano de obra con estadísticas calculadas
export interface ManoObraWithStats extends ManoObra {
  esMasCaro: boolean;
  esBarato: boolean;
  diasDesdeCreacion: number;
}

// Función helper para calcular estadísticas
export function calculateManoObraStats(data: ManoObra[]): ManoObraStats {
  if (data.length === 0) {
    return {
      total: 0,
      serviciosActivos: 0,
      costoPromedio: 0,
      costoTotal: 0,
      proveedoresUnicos: 0,
      servicioPorProveedor: {},
      rangoPrecios: { min: 0, max: 0 }
    };
  }

  const precios = data.map(item => item.precio);
  const costoTotal = precios.reduce((sum, precio) => sum + precio, 0);
  const costoPromedio = costoTotal / data.length;

  const proveedores = data
    .filter(item => item.proveedor && item.proveedor.trim() !== '')
    .map(item => item.proveedor!);
  
  const proveedoresUnicos = new Set(proveedores).size;
  
  const servicioPorProveedor = proveedores.reduce((acc, proveedor) => {
    acc[proveedor] = (acc[proveedor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: data.length,
    serviciosActivos: data.length, // Todos los servicios están activos por defecto
    costoPromedio,
    costoTotal,
    proveedoresUnicos,
    servicioPorProveedor,
    rangoPrecios: {
      min: Math.min(...precios),
      max: Math.max(...precios)
    }
  };
}

// Función helper para enriquecer datos con estadísticas
export function enrichManoObraWithStats(
  data: ManoObra[], 
  stats: ManoObraStats
): ManoObraWithStats[] {
  const promedioUmbral = stats.costoPromedio;
  const umbralCaro = promedioUmbral * 1.5; // 50% más que el promedio
  const umbralBarato = promedioUmbral * 0.7; // 30% menos que el promedio

  return data.map(item => ({
    ...item,
    esMasCaro: item.precio > umbralCaro,
    esBarato: item.precio < umbralBarato,
    diasDesdeCreacion: item.created_at 
      ? Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0
  }));
}

// Función helper para aplicar filtros
export function applyManoObraFilters(
  data: ManoObra[],
  filters: ManoObraFilters
): ManoObra[] {
  return data.filter(item => {
    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        item.referencia.toLowerCase().includes(searchLower) ||
        item.nombre.toLowerCase().includes(searchLower) ||
        (item.descripcion?.toLowerCase().includes(searchLower)) ||
        (item.proveedor?.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Filtro de rango de precios
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (min !== undefined && item.precio < min) return false;
      if (max !== undefined && item.precio > max) return false;
    }

    // Filtro por proveedor
    if (filters.proveedor && filters.proveedor !== 'all') {
      if (filters.proveedor === 'sin-proveedor') {
        if (item.proveedor && item.proveedor.trim() !== '') return false;
      } else {
        if (item.proveedor !== filters.proveedor) return false;
      }
    }

    return true;
  });
}

// Función helper para ordenar datos
export function sortManoObraData(
  data: ManoObra[],
  sortOptions: ManoObraSortOptions
): ManoObra[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortOptions.field];
    const bValue = b[sortOptions.field];

    // Manejar valores undefined/null
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Comparación por tipo
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOptions.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Comparación por string (case insensitive)
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (aStr < bStr) return sortOptions.direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortOptions.direction === 'asc' ? 1 : -1;
    return 0;
  });
}
