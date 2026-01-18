// ============================================================================
// BARREL EXPORTS PARA LAS UTILIDADES DEL MÓDULO PANTALONES
// ============================================================================

export {
  // Operaciones CRUD principales
  getPantalones,
  getPantalonById,
  getPantalonByReferencia,
  createPantalon,
  updatePantalon,
  deletePantalon,
  
  // Operaciones en lote
  deleteMultiplePantalones,
  updateMultiplePantalones,
  
  // Estadísticas
  getPantalonStats,
  
  // Validaciones
  checkReferenciaAvailability,
  
  // Exportación
  exportPantalonesToCSV,
  
  // Caché
  revalidatePantalonesCache,
  
  // Helpers
  fetchPantalonesWithRetry,
  optimisticUpdate,
} from './api';

export {
  // Re-exportar formatters si los creamos
} from './formatters';
