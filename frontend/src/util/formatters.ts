/**
 * Format price to Colombian Peso currency
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
};

/**
 * Format date string to Colombian locale
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha no válida";
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Fecha no válida";
  }
};

/**
 * Format date string with detailed time to Colombian locale
 */
export const formatDateDetailed = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha no válida";
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Fecha no válida";
  }
};

/**
 * Calculate stock status based on quantity
 */
export const getStockStatus = (cantidad: number | string, threshold = 10) => {
  const stock = Number(cantidad) || 0;
  if (stock === 0)
    return { text: "Sin stock", variant: "destructive" as const };
  if (stock < threshold)
    return { text: "Stock bajo", variant: "secondary" as const };
  return { text: `${stock} unidades`, variant: "default" as const };
};
