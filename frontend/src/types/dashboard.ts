export interface Insumo {
  referencia: number;
  nombre: string;
  tipo: string;
  estado: string | null;
  cantidad: string; // Keep as string for API compatibility
  proveedor: string | null;
  unidad: string;
  preciounidad: string; // Keep as string for API compatibility
  created_at: string;
  updated_at: string;
}

// Add parsed version for calculations
export interface ParsedInsumo
  extends Omit<Insumo, "cantidad" | "preciounidad"> {
  cantidad: number;
  preciounidad: number;
}

export interface ManoObra {
  id: string;
  nombre: string;
  precio: number;
}

export interface Pantalon {
  id: string;
  nombre: string;
  cantidad: number;
  precio_individual: number;
}

export interface DashboardData {
  insumos: Insumo[];
  manoObra: ManoObra[];
  pantalones: Pantalon[];
}

export interface InsumoWithValue extends Insumo {
  valorTotal: number;
}

export interface DashboardStats {
  insumosStats: {
    total: number;
    disponibles: number;
    bajoStock: number;
    agotados: number;
    valorTotal: number;
  };
  manoObraStats: {
    total: number;
    costoTotal: number;
    promedioPrice: number;
  };
  pantalonesStats: {
    total: number;
    cantidadTotal: number;
    valorTotal: number;
  };
  alertas: number;
  topInsumos: InsumoWithValue[];
}
