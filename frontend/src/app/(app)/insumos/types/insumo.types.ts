// Tipos centralizados para el módulo de insumos

/** Estados disponibles para un insumo */
export type EstadoInsumo = 'disponible' | 'bajo stock' | 'agotado';

/** Tipos de insumos disponibles en el sistema */
export type TipoInsumo = 'Tela' | 'Botones' | 'Taches' | 'Hilos' | 'Cierres' | 'Cremalleras' | 'Elásticos' | 'Etiquetas';

/** Unidades de medida para insumos */
export type UnidadMedida = 'metros' | 'unidades' | 'kilogramos' | 'cajas' | 'rollos' | 'yardas' | 'litros';

/** Interfaz principal del insumo - BASADA EN LOS DATOS REALES DE LA API */
export interface Insumo {
  /** Referencia única numérica */
  referencia: number;

  /** Nombre descriptivo del insumo */
  nombre: string;

  /** Tipo/categoría del insumo */
  tipo: string;

  /** Estado actual del stock */
  estado: string | null;

  /** Cantidad disponible (string por compatibilidad con API) */
  cantidad: string;

  /** Proveedor que suministra el insumo */
  proveedor: string | null;

  /** Unidad de medida */
  unidad: string;

  /** Precio por unidad (string por compatibilidad con API) */
  preciounidad: string;

  /** Fecha de creación del registro */
  created_at: string;

  /** Fecha de última actualización */
  updated_at: string;
}

/** Versión parseada para cálculos internos del módulo */
export interface ParsedInsumo extends Omit<Insumo, "cantidad" | "preciounidad"> {
  cantidad: number;
  preciounidad: number;
}

/** Datos para crear un nuevo insumo */
export interface CreateInsumoData {
  nombre: string;
  tipo?: string;
  cantidad: string;
  proveedor?: string;
  unidad: string;
  preciounidad: string;
}

/** Datos para actualizar un insumo existente */
export interface UpdateInsumoData {
  nombre?: string;
  tipo?: string;
  cantidad?: string;
  proveedor?: string;
  unidad?: string;
  preciounidad?: string;
  estado?: string;
}

/** Datos para añadir stock a un insumo */
export interface AddStockData {
  cantidad: number;
  precio_compra?: number;
  nota?: string;
}

/** Filtros para búsqueda de insumos */
export interface InsumoFilters {
  search?: string;
  tipo?: string;
  estado?: EstadoInsumo;
  proveedor?: string;
}

/** Estadísticas computadas del inventario de insumos */
export interface InsumoStats {
  total: number;
  disponibles: number;
  bajoStock: number;
  agotados: number;
  valorTotal: number;
  valorPromedio: number;
  tiposUnicos: number;
}

/** Respuesta de la API para operaciones con insumos */
export interface InsumoApiResponse {
  /** Indica si la operación fue exitosa */
  success: boolean;
  
  /** Datos del insumo (en caso de éxito) */
  data?: Insumo;
  
  /** Mensaje descriptivo */
  message?: string;
  
  /** Errores de validación (en caso de fallo) */
  errors?: Record<string, string[]>;
}

/** Respuesta de la API para listado de insumos */
export interface InsumosListResponse {
  /** Indica si la operación fue exitosa */
  success: boolean;
  
  /** Array de insumos */
  data: Insumo[];
  
  /** Metadata de paginación */
  meta?: {
    /** Página actual */
    page: number;
    
    /** Insumos por página */
    per_page: number;
    
    /** Total de insumos */
    total: number;
    
    /** Total de páginas */
    total_pages: number;
  };
}

/** Validaciones para campos de insumo */
export interface InsumoValidation {
  /** Nombre mínimo de caracteres */
  readonly NOMBRE_MIN_LENGTH: 2;
  
  /** Nombre máximo de caracteres */
  readonly NOMBRE_MAX_LENGTH: 100;
  
  /** Cantidad mínima permitida */
  readonly CANTIDAD_MIN: 0;
  
  /** Precio mínimo permitido */
  readonly PRECIO_MIN: 0;
  
  /** Referencia máxima de caracteres */
  readonly REFERENCIA_MAX_LENGTH: 50;
}

/** Constantes de validación */
export const INSUMO_VALIDATION: InsumoValidation = {
  NOMBRE_MIN_LENGTH: 2,
  NOMBRE_MAX_LENGTH: 100,
  CANTIDAD_MIN: 0,
  PRECIO_MIN: 0,
  REFERENCIA_MAX_LENGTH: 50,
} as const;

/** Opciones de ordenamiento para insumos - CORREGIDO para usar campos reales de la API */
export type InsumoSortField = 
  | 'nombre' 
  | 'referencia' 
  | 'cantidad'        // ✅ Campo real de la API
  | 'preciounidad'    // ✅ Campo real de la API
  | 'estado' 
  | 'tipo'
  | 'unidad'
  | 'proveedor'
  | 'created_at' 
  | 'updated_at';

export type SortDirection = 'asc' | 'desc';

export interface InsumoSortOptions {
  field: InsumoSortField;
  direction: SortDirection;
}

// Re-exportaciones para compatibilidad
export type { Insumo as InsumoType };
export type { EstadoInsumo as InsumoEstado };