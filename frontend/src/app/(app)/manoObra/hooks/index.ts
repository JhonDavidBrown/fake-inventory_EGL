// ============================================================================
// BARREL EXPORTS PARA EL MÓDULO MANO DE OBRA - HOOKS
// ============================================================================

export { useManoObra } from './useManoObra';
export { useManoObraFilters } from './useManoObraFilters';

// Re-export types for convenience
export type {
  ManoObra,
  ManoObraWithStats,
  ManoObraStats,
  CreateManoObraData,
  UpdateManoObraData,
  ManoObraFilters,
  ManoObraSortOptions,
} from '../types';
