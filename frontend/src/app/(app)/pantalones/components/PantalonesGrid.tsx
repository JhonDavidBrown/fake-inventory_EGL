"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PantalonCard } from "./PantalonCard";
import { PantalonesFilters } from "./PantalonesFilters";
import { PantalonDetail } from "./PantalonDetail";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Pantalon } from "@/types/pantalones";
import { usePantalonPricing } from "@/hooks/usePantalonPricing";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface PantalonesGridProps {
  pantalones: Pantalon[];
}

export function PantalonesGrid({ pantalones }: PantalonesGridProps) {
  const router = useRouter();
  const { pantalonesWithPrices } = usePantalonPricing(pantalones);
  const [filteredPantalones, setFilteredPantalones] =
    useState(pantalonesWithPrices);
  const [selectedPantalon, setSelectedPantalon] = useState<Pantalon | null>(
    null
  );

  const handleFilterChange = (filters: {
    search: string;
    talla: string;
    precioMin: number;
    precioMax: number;
  }) => {
    let filtered = pantalonesWithPrices;

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.referencia.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por talla
    if (filters.talla && filters.talla !== "all") {
      filtered = filtered.filter((p) => p.talla === filters.talla);
    }

    // Filtro por precio usando precio pre-calculado
    filtered = filtered.filter((p) => {
      return (
        p.precioTotal >= filters.precioMin && p.precioTotal <= filters.precioMax
      );
    });

    setFilteredPantalones(filtered);
  };

  const handleCardClick = (pantalon: Pantalon) => {
    setSelectedPantalon(pantalon);
  };

  const handleCloseDetail = () => {
    setSelectedPantalon(null);
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pantalones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona tu catálogo de pantalones y costos de producción
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredPantalones.length} de {pantalones.length} productos
            </div>
            <Button
              onClick={() => router.push("/pantalones/crear")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Pantalón
            </Button>
          </div>
        </div>

        <PantalonesFilters
          pantalones={pantalones}
          onFilterChange={handleFilterChange}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPantalones.map((pantalon) => (
            <PantalonCard
              key={pantalon.id}
              pantalon={pantalon}
              precio={pantalon.precioTotal}
              onClick={() => handleCardClick(pantalon)}
            />
          ))}
        </div>

        {filteredPantalones.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-lg">
              No se encontraron pantalones con los filtros aplicados
            </div>
          </div>
        )}

        {selectedPantalon && (
          <PantalonDetail
            pantalon={selectedPantalon}
            precio={
              pantalonesWithPrices.find((p) => p.id === selectedPantalon.id)
                ?.precioTotal || 0
            }
            onClose={handleCloseDetail}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
