// Barrel exports para todas las utilidades del módulo de insumos

// Validadores
export {
  validateCreateInsumo,
  validateUpdateInsumo,
  validateAddStock,
  validateInsumoFilters,
  validateStockLevel,
  validateBusinessRules,
  sanitizeInsumoInput,
  normalizeReferencia,
  isDuplicateReferencia,
  // Esquemas de Zod para uso directo
  insumoBaseSchema,
  createInsumoSchema,
  updateInsumoSchema,
  addStockSchema,
  insumoFiltersSchema,
} from './validators';

// Formateadores
export {
  formatCurrency,
  formatNumber,
  formatQuantity,
  formatDate,
  formatDateTime,
  formatEstado,
  formatTipoInsumo,
  formatReferencia,
  formatInventoryValue,
  formatPercentage,
  formatRelativeTime,
  formatInsumoSummary,
  generateReferencia,
} from './formatters';

// API utilities
export {
  // CRUD Operations
  getInsumos,
  getInsumoById,
  getInsumoByReferencia,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  addStockToInsumo,

  // Bulk Operations
  // TODO: Implement these endpoints in backend first
  // deleteMultipleInsumos,
  // updateMultipleInsumos,

  // Statistics
  // TODO: Implement these endpoints in backend first
  // getInsumoStats,
  // getInsumoStatsByType,

  // Validation
  // TODO: Implement this endpoint in backend first
  // checkReferenciaAvailability,

  // Export
  // TODO: Implement these endpoints in backend first
  // exportInsumosToCSV,
  // exportInsumosToExcel,

  // Cache
  // TODO: Implement this endpoint in backend first
  // revalidateInsumosCache,

  // Helpers
  fetchInsumosWithRetry,
  optimisticUpdate,
} from './api';