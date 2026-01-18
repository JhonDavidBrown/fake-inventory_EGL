// ============================================================================
// FORMATTERS Y UTILIDADES PARA EL MÓDULO PANTALONES
// ============================================================================

import { type Pantalon, calculatePantalonPrice } from '../types';

/**
 * Formatea un precio en pesos colombianos
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha de manera legible
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

/**
 * Formatea un array de tallas como string
 */
export function formatTallas(tallas: string[]): string {
  if (tallas.length === 0) return 'Sin tallas';
  if (tallas.length === 1) return tallas[0];
  if (tallas.length <= 3) return tallas.join(', ');
  return `${tallas.slice(0, 3).join(', ')} y ${tallas.length - 3} más`;
}

/**
 * Formatea la cantidad como string legible
 */
export function formatQuantity(quantity: string | number): string {
  if (typeof quantity === 'string' && quantity.trim() === '') {
    return '0';
  }
  
  const num = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  
  if (isNaN(num)) return '0';
  if (num === 0) return 'Sin stock';
  if (num === 1) return '1 unidad';
  
  return `${num} unidades`;
}

/**
 * Obtiene el estado de stock basado en la cantidad
 */
export function getStockStatus(quantity: string | number): {
  status: 'disponible' | 'bajo-stock' | 'agotado';
  label: string;
  color: string;
} {
  const num = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
  
  if (isNaN(num) || num === 0) {
    return {
      status: 'agotado',
      label: 'Agotado',
      color: 'text-red-600 bg-red-50 border-red-200'
    };
  }
  
  if (num <= 5) {
    return {
      status: 'bajo-stock',
      label: 'Bajo stock',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
  }
  
  return {
    status: 'disponible',
    label: 'Disponible',
    color: 'text-green-600 bg-green-50 border-green-200'
  };
}

/**
 * Genera un texto de resumen para un pantalón
 */
export function generatePantalonSummary(pantalon: Pantalon): string {
  const precio = calculatePantalonPrice(pantalon);
  const tallas = formatTallas(Object.keys(pantalon.tallas_disponibles || {}));
  const cantidad = formatQuantity(pantalon.cantidad);
  
  return `${pantalon.nombre} - ${formatPrice(precio)} - Tallas: ${tallas} - ${cantidad}`;
}

/**
 * Obtiene la URL de imagen con fallback
 */
export function getImageUrl(
  imageUrl: string | null | undefined,
  fallback: string = '/images/placeholder-product.jpg'
): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return fallback;
  }
  
  // Si ya es una URL completa, devolverla tal como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si es una ruta relativa, construir la URL completa
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
}

/**
 * Trunca un texto a una longitud específica
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Genera un color consistente basado en una string
 */
export function getConsistentColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-red-100 text-red-800',
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Valida si una URL de imagen es válida
 */
export function isValidImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Formatea datos de pantalón para exportación
 */
export function formatPantalonForExport(pantalon: Pantalon) {
  const precio = calculatePantalonPrice(pantalon);
  
  return {
    Referencia: pantalon.referencia,
    Nombre: pantalon.nombre,
    'Tallas Disponibles': Object.keys(pantalon.tallas_disponibles || {}).join(', '),
    Cantidad: pantalon.cantidad,
    'Precio Calculado': formatPrice(precio),
    'Precio Individual': formatPrice(pantalon.precio_individual),
    'Fecha Creación': formatDate(pantalon.created_at),
    'Última Actualización': formatDate(pantalon.updated_at),
    'Número Insumos': pantalon.insumos.length,
    'Número Procesos': pantalon.procesos.length,
  };
}
