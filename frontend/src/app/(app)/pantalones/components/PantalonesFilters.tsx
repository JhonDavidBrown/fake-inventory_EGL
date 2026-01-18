"use client";

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { Pantalon } from "@/types/pantalones";

interface PantalonesFiltersProps {
  pantalones: Pantalon[];
  onFilterChange: (filters: {
    search: string;
    talla: string;
    precioMin: number;
    precioMax: number;
  }) => void;
}

export function PantalonesFilters({
  pantalones,
  onFilterChange,
}: PantalonesFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedTalla, setSelectedTalla] = useState("all");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Helper function to format numbers (removed as not used)

  // Obtener tallas únicas con memoización
  const tallas = useMemo(() => {
    return Array.from(new Set(pantalones.map((p) => p.talla))).sort();
  }, [pantalones]);

  // Calcular rango de precios con useMemo para evitar recálculos
  const { minPrecio, maxPrecio } = useMemo(() => {
    if (pantalones.length === 0) {
      return { minPrecio: 0, maxPrecio: 200000 };
    }

    const precios = pantalones.map((p) => {
      const costoInsumos = p.insumos.reduce(
        (total, insumo) => total + insumo.cantidad * insumo.precio,
        0
      );
      return costoInsumos + p.manoDeObra.precio;
    });

    return {
      minPrecio: Math.min(...precios),
      maxPrecio: Math.max(...precios),
    };
  }, [pantalones]);

  // Función para aplicar filtros manualmente
  const applyFilters = useCallback(() => {
    const minPrice = precioMin ? Number(precioMin) : minPrecio;
    const maxPrice = precioMax ? Number(precioMax) : maxPrecio;

    onFilterChange({
      search,
      talla: selectedTalla,
      precioMin: minPrice,
      precioMax: maxPrice,
    });
  }, [
    search,
    selectedTalla,
    precioMin,
    precioMax,
    minPrecio,
    maxPrecio,
    onFilterChange,
  ]);

  // Manejar cambios de búsqueda con debounce manual
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      // Aplicar filtros después de un pequeño delay
      setTimeout(() => {
        const minPrice = precioMin ? Number(precioMin) : minPrecio;
        const maxPrice = precioMax ? Number(precioMax) : maxPrecio;

        onFilterChange({
          search: value,
          talla: selectedTalla,
          precioMin: minPrice,
          precioMax: maxPrice,
        });
      }, 300);
    },
    [selectedTalla, precioMin, precioMax, minPrecio, maxPrecio, onFilterChange]
  );

  // Manejar cambio de talla
  const handleTallaChange = useCallback(
    (talla: string) => {
      setSelectedTalla(talla);
      applyFilters();
    },
    [applyFilters]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedTalla("all");
    setPrecioMin("");
    setPrecioMax("");

    onFilterChange({
      search: "",
      talla: "all",
      precioMin: minPrecio,
      precioMax: maxPrecio,
    });
  }, [minPrecio, maxPrecio, onFilterChange]);

  const hasActiveFilters =
    search !== "" ||
    selectedTalla !== "all" ||
    precioMin !== "" ||
    precioMax !== "";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o referencia..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Botón de filtros */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {
                  [
                    search && "búsqueda",
                    selectedTalla !== "all" && "talla",
                    (precioMin !== "" || precioMax !== "") && "precio",
                  ].filter(Boolean).length
                }
              </Badge>
            )}
          </Button>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Filtro por talla */}
            <div>
              <label className="text-sm font-medium mb-2 block">Talla</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTalla === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTallaChange("all")}
                >
                  Todas
                </Button>
                {tallas.map((talla) => (
                  <Button
                    key={talla}
                    variant={selectedTalla === talla ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTallaChange(talla)}
                  >
                    {talla}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtro por precio */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Rango de precio
              </label>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder={`Mín: $${minPrecio.toLocaleString()}`}
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                    onBlur={applyFilters}
                    min={minPrecio}
                    max={maxPrecio}
                    aria-label="Precio mínimo"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder={`Máx: $${maxPrecio.toLocaleString()}`}
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    onBlur={applyFilters}
                    min={minPrecio}
                    max={maxPrecio}
                    aria-label="Precio máximo"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Rango disponible: ${minPrecio.toLocaleString()} - $
                {maxPrecio.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
