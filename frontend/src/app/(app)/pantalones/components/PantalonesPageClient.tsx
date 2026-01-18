"use client";

import { usePantalones } from "../hooks/usePantalones";
import { Pantalon } from "../types";
import { PantalonesGridAPI } from "@/components/PantalonesGridAPI";
import { PantalonAPIWithPrice } from "@/types/pantalones";
import { CompanyBanner } from "@/components/CompanyBanner";

interface PantalonesPageClientProps {
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

export function PantalonesPageClient({ initialData }: PantalonesPageClientProps) {
  const { data, loading, error, refetch } = usePantalones({ initialData });
  
  // Adaptamos los datos al formato legacy
  const adaptedData = adaptToLegacyFormat(data);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <CompanyBanner showAlways={true} />
      <PantalonesGridAPI
        pantalones={adaptedData}
        loading={loading}
        error={error instanceof Error ? error.message : error as string}
        onRefresh={refetch}
      />
    </div>
  );
}
