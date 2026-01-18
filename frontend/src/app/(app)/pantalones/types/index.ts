// ============================================================================
// BARREL EXPORTS PARA TODOS LOS TIPOS DEL MÓDULO PANTALONES
// ============================================================================

export type {
  // Tipos principales
  Pantalon,
  InsumoAPI,
  ProcesoAPI,
  PantalonWithPrice,
  
  // Operaciones CRUD
  CreatePantalonData,
  UpdatePantalonData,
  
  // Filtros y búsqueda
  PantalonFilters,
  PantalonSortField,
  SortDirection,
  PantalonSortOptions,
  
  // Estadísticas
  PantalonStats,
  
  // API Responses
  PantalonApiResponse,
  PantalonesListResponse,
  
  // Validaciones
  PantalonValidation,
} from './pantalon.types';

export {
  // Constantes
  PANTALON_VALIDATION,
  
  // Funciones utilitarias
  calculatePantalonPrice,
  formatPantalonPrice,
  getUniqueTallas,
  filterPantalones,
  sortPantalones,
} from './pantalon.types';
