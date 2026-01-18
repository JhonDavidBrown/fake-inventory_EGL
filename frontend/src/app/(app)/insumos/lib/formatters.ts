import { type Insumo, type EstadoInsumo, type TipoInsumo } from '../types';

// Tipo para soportar diferentes formas de los campos de Insumo
type InsumoFlexible = Insumo & {
  cantidad_disponible?: number;
  cantidad?: number | string;
  costo_unitario?: number;
  preciounidad?: number | string;
  unidad_medida?: string;
  unidad?: string;
};

// helper: normalizar posible shape y strings a number
function toNumberValue(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

// Formateo de moneda específico para Colombia
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2, // ✅ CAMBIADO: Permitir decimales
  }).format(amount);
}

// Formateo de números con separadores
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('es-CO').format(number);
}

// Formateo de cantidades con unidades
export function formatQuantity(cantidad: number, unidad: string): string {
  const formattedNumber = formatNumber(cantidad);
  
  // Pluralización inteligente
  const pluralizedUnit = cantidad === 1 ? unidad : `${unidad}${unidad.endsWith('s') ? '' : 's'}`;
  
  return `${formattedNumber} ${pluralizedUnit}`;
}

// Formateo de fechas específico para el módulo
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Fecha inválida';
  }
}

// Formateo de fecha y hora detallada
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Fecha inválida';
  }
}

// Formateo del estado con colores/estilos
export function formatEstado(estado: EstadoInsumo): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
} {
  switch (estado) {
    case 'disponible':
      return {
        label: 'Disponible',
        variant: 'default',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    case 'bajo stock':
      return {
        label: 'Bajo Stock',
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      };
    case 'agotado':
      return {
        label: 'Agotado',
        variant: 'destructive',
        className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      };
    default:
      return {
        label: 'Desconocido',
        variant: 'outline',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      };
  }
}

// Formateo del tipo de insumo
export function formatTipoInsumo(tipo: TipoInsumo): string {
  const typeMap: Record<TipoInsumo, string> = {
    'Tela': 'Tela',
    'Botones': 'Botones',
    'Taches': 'Taches',
    'Hilos': 'Hilos',
    'Cierres': 'Cierres',
    'Cremalleras': 'Cremalleras',
    'Elásticos': 'Elásticos',
    'Etiquetas': 'Etiquetas',
  };
  
  return typeMap[tipo] || tipo;
}

// Formateo de referencia
export function formatReferencia(referencia: string): string {
  return referencia.toUpperCase().trim();
}

// Formateo del valor total del inventario
export function formatInventoryValue(insumos: Insumo[]): {
  total: string;
  breakdown: Record<TipoInsumo, string>;
} {
  // acumulador numérico por tipo (puede ser parcial mientras calculamos)
  const breakdownNums = insumos.reduce((acc, insumo) => {
    // soportar ambas formas: cantidad_disponible | cantidad, costo_unitario | preciounidad
    const insumoFlexible = insumo as InsumoFlexible;
    const cantidad = toNumberValue(insumoFlexible.cantidad_disponible ?? insumoFlexible.cantidad);
    const costo = toNumberValue(insumoFlexible.costo_unitario ?? insumoFlexible.preciounidad);

    const tipoKey = (insumo.tipo as unknown) as TipoInsumo | undefined;
    if (!tipoKey) return acc;

    acc[tipoKey] = (acc[tipoKey] ?? 0) + cantidad * costo;
    return acc;
  }, {} as Partial<Record<TipoInsumo, number>>);

  const totalNum = Object.values(breakdownNums).reduce((s, v) => s + (v ?? 0), 0);

  // formatear breakdown asegurando todas las claves de TipoInsumo
  const formattedBreakdown = (Object.keys(breakdownNums) as TipoInsumo[]).reduce((acc, tipo) => {
    acc[tipo] = formatCurrency(breakdownNums[tipo] ?? 0);
    return acc;
  }, {} as Record<TipoInsumo, string>);

  return {
    total: formatCurrency(totalNum),
    breakdown: formattedBreakdown,
  };
}

// Formateo de porcentajes
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
}

// Formateo de tiempo relativo (ej: "hace 2 horas")
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace menos de un minuto';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return formatDate(dateString);
  } catch {
    return 'Fecha inválida';
  }
}

// Formateo de resumen de insumo para tooltips/previews
export function formatInsumoSummary(insumo: Insumo): string {
  // asegurar un EstadoInsumo válido para formatEstado
  const estadoVal = ((insumo.estado ?? 'disponible') as EstadoInsumo);
  const estado = formatEstado(estadoVal);

  // normalizar nombres de campo posibles
  const insumoFlexible = insumo as InsumoFlexible;
  const cantidadNum = toNumberValue(insumoFlexible.cantidad_disponible ?? insumoFlexible.cantidad);
  const unidad = (insumoFlexible.unidad_medida ?? insumoFlexible.unidad) || 'unidades';
  const precioNum = toNumberValue(insumoFlexible.costo_unitario ?? insumoFlexible.preciounidad);

  const cantidad = formatQuantity(cantidadNum, unidad);
  const precio = formatCurrency(precioNum);

  return `${insumo.nombre} - ${cantidad} - ${precio}/unidad - ${estado.label}`;
}

// Función para generar ID de referencia automático
export function generateReferencia(nombre: string, tipo?: TipoInsumo): string {
  const prefix = tipo ? tipo.charAt(0).toUpperCase() : 'I';
  const cleanName = nombre
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3);
  
  const timestamp = Date.now().toString().slice(-4);
  
  return `${prefix}${cleanName}${timestamp}`;
}