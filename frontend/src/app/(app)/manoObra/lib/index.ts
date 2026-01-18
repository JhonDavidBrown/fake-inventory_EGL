// ============================================================================
// BARREL EXPORTS PARA EL MÓDULO MANO DE OBRA - LIB
// ============================================================================

export * from './api';

// Funciones de formateo específicas del módulo
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

export const formatDate = (date: string | undefined): string => {
  // Manejar casos donde el backend no envía las fechas
  if (!date || date === undefined || date === null || date === '') {
    return "No registrada";
  }
  
  // Convertir formato PostgreSQL (2025-07-20 22:34:59.261+00) a formato ISO
  let dateString = date;
  
  // Si el formato es de PostgreSQL (sin T y con +00 al final), convertirlo
  if (date.includes(' ') && !date.includes('T')) {
    // Reemplazar el espacio por T y asegurar que termine en Z si es +00
    dateString = date.replace(' ', 'T');
    if (dateString.endsWith('+00')) {
      dateString = dateString.replace('+00', 'Z');
    }
  }
  
  const dateObj = new Date(dateString);
  
  // Verificar si la fecha es válida
  if (isNaN(dateObj.getTime())) {
    return "Fecha inválida";
  }
  
  return dateObj.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatReferencia = (referencia: string): string => {
  return referencia.toUpperCase().trim();
};
