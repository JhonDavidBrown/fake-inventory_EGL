import { useMemo } from "react";

interface InsumoAPI {
  referencia: number;
  nombre: string;
  tipo: string;
  preciounidad: string;
  cantidad: number;
}

interface ManoObraAPI {
  referencia: number;
  nombre: string;
  descripcion?: string;
  precio: number;
}

interface InsumoSeleccionado {
  referencia: string;
  nombre: string;
  cantidad_usada: number;
  precio_unitario: number;
}

interface ManoDeObraSeleccionada {
  referencia: string;
  nombre: string;
  precio: number;
}

interface UsePantalonSelectorsProps {
  insumos: InsumoAPI[];
  manosDeObra: ManoObraAPI[];
  insumosSeleccionados: InsumoSeleccionado[];
  manosDeObraSeleccionadas: ManoDeObraSeleccionada[];
  insumoSearchTerm: string;
  manoObraSearchTerm: string;
}

export function usePantalonSelectors({
  insumos,
  manosDeObra,
  insumosSeleccionados,
  manosDeObraSeleccionadas,
  insumoSearchTerm,
  manoObraSearchTerm,
}: UsePantalonSelectorsProps) {
  // Filter available insumos (not already selected)
  const filteredInsumos = useMemo(() => {
    const availableInsumos = insumos.filter(insumo => {
      if (!insumo?.referencia || !insumo?.nombre) return false;
      return !insumosSeleccionados.some(s => s.referencia === insumo.referencia.toString());
    });

    if (!insumoSearchTerm) {
      return availableInsumos.slice(0, 10);
    }
    
    const searchTerm = insumoSearchTerm.toLowerCase();
    return availableInsumos.filter(insumo => 
      String(insumo.referencia).toLowerCase().includes(searchTerm) ||
      String(insumo.nombre).toLowerCase().includes(searchTerm) ||
      (insumo.tipo && String(insumo.tipo).toLowerCase().includes(searchTerm))
    );
  }, [insumos, insumoSearchTerm, insumosSeleccionados]);

  // Filter available mano de obra (not already selected)
  const filteredManoObra = useMemo(() => {
    if (!manoObraSearchTerm) return [];
    
    return manosDeObra.filter(mano => {
      if (!mano?.referencia) return false;
      if (manosDeObraSeleccionadas.some(s => s.referencia === mano.referencia.toString())) return false;
      
      const searchTerm = manoObraSearchTerm.toLowerCase();
      return (
        String(mano.referencia).toLowerCase().includes(searchTerm) ||
        String(mano.descripcion || mano.nombre || '').toLowerCase().includes(searchTerm)
      );
    });
  }, [manosDeObra, manoObraSearchTerm, manosDeObraSeleccionadas]);

  // Calculate total cost
  const costoTotal = useMemo(() => {
    const costoInsumos = insumosSeleccionados.reduce(
      (total, insumo) => total + (insumo.precio_unitario * insumo.cantidad_usada),
      0
    );
    const costoManoObra = manosDeObraSeleccionadas.reduce(
      (total, mano) => total + mano.precio,
      0
    );
    return costoInsumos + costoManoObra;
  }, [insumosSeleccionados, manosDeObraSeleccionadas]);

  // Get insumo by reference
  const getInsumoByRef = useMemo(() => {
    const insumoMap = new Map(insumos.map(insumo => [insumo.referencia.toString(), insumo]));
    return (ref: string) => insumoMap.get(ref);
  }, [insumos]);

  // Get mano de obra by reference
  const getManoObraByRef = useMemo(() => {
    const manoObraMap = new Map(manosDeObra.map(mano => [mano.referencia.toString(), mano]));
    return (ref: string) => manoObraMap.get(ref);
  }, [manosDeObra]);

  // Create insumo helper
  const createInsumoFromAPI = (insumoRef: string): InsumoSeleccionado | null => {
    const insumo = getInsumoByRef(insumoRef);
    if (!insumo) return null;

    return {
      referencia: insumoRef,
      cantidad_usada: 1,
      nombre: insumo.nombre || 'Sin nombre',
      precio_unitario: parseFloat(insumo.preciounidad) || 0,
    };
  };

  // Create mano de obra helper
  const createManoObraFromAPI = (manoObraRef: string): ManoDeObraSeleccionada | null => {
    const manoObra = getManoObraByRef(manoObraRef);
    if (!manoObra) return null;

    return {
      referencia: manoObraRef,
      nombre: manoObra.descripcion || manoObra.nombre || 'Sin descripción',
      precio: manoObra.precio || 0,
    };
  };

  return {
    filteredInsumos,
    filteredManoObra,
    costoTotal,
    getInsumoByRef,
    getManoObraByRef,
    createInsumoFromAPI,
    createManoObraFromAPI,
  };
}
