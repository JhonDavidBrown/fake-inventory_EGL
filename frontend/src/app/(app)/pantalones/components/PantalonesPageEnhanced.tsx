// ============================================================================
// VERSIÓN MEJORADA DEL PAGE CLIENT (EJEMPLO)
// ============================================================================
// Este archivo demuestra cómo podrías usar las nuevas características
// manteniendo tu interfaz de grid actual

"use client";

import { usePantalones } from "../hooks/usePantalones";
import { usePantalonFilters } from "../hooks/usePantalonFilters"; 
import { Pantalon } from "../types";
import { PantalonesGridAPI } from "@/components/PantalonesGridAPI";
import { PantalonStatsCard } from "./PantalonStats";
import { PantalonAPIWithPrice } from "@/types/pantalones";

interface PantalonesPageEnhancedProps {
  initialData: Pantalon[];
}

// Función para adaptar nuestros datos al formato legacy que espera el componente
function adaptToLegacyFormat(pantalones: Pantalon[]): PantalonAPIWithPrice[] {
  return pantalones.map(pantalon => ({
    ...pantalon,
    // Asegurar compatibilidad con el formato esperado por PantalonesGridAPI
    precioTotal: pantalon.insumos.reduce((total, insumo) => {
      return total + parseFloat(insumo.preciounidad) * insumo.PantalonInsumo.cantidad_usada;
    }, 0) + pantalon.procesos.reduce((total, proceso) => {
      return total + proceso.precio;
    }, 0),
  })) as PantalonAPIWithPrice[];
}

export function PantalonesPageEnhanced({ initialData }: PantalonesPageEnhancedProps) {
  const { data, loading, error, stats, refetch } = usePantalones({ initialData });

  const {
    applyFilters,
    hasActiveFilters,
  } = usePantalonFilters();
  
  // Aplicar filtros localmente si los necesitas
  const filteredData = applyFilters(data);
  const adaptedData = adaptToLegacyFormat(filteredData);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Estadísticas opcionales - podrías mostrarlas u ocultarlas */}
      {stats && (
        <PantalonStatsCard stats={stats} loading={loading} />
      )}

      {/* Tu grid actual - sin cambios en la UI */}
      <PantalonesGridAPI
        pantalones={adaptedData}
        loading={loading}
        error={error instanceof Error ? error.message : error as string}
        onRefresh={refetch}
      />
      
      {/* Debug info - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground p-4 bg-muted/10 rounded-lg">
          <p>Debug info:</p>
          <p>• Total pantalones: {data.length}</p>
          <p>• Filtrados: {filteredData.length}</p>
          <p>• Filtros activos: {hasActiveFilters ? 'Sí' : 'No'}</p>
          <p>• Cargando: {loading ? 'Sí' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
