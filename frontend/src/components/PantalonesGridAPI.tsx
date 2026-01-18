import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package } from "lucide-react";
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple";
import { PantalonAPIWithPrice } from "@/types/pantalones";
import { PantalonCardAPI } from "./PantalonCardAPI";
import { ErrorBoundary } from "./ErrorBoundary";
import {
  GRID_SKELETON_COUNT,
  SEARCH_DEBOUNCE_DELAY,
} from "@/constants/pantalones";

interface PantalonesGridAPIProps {
  pantalones: PantalonAPIWithPrice[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => Promise<void>;
}

export const PantalonesGridAPI = React.memo(function PantalonesGridAPI({
  pantalones,
  loading = false,
  error = null,
  onRefresh,
}: PantalonesGridAPIProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Memoized navigation handler
  const handleCreatePantalon = useCallback(() => {
    router.push("/pantalones/crear");
  }, [router]);

  // Filter pantalones - optimized search with early return
  const filteredPantalones = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return pantalones;

    const searchLower = debouncedSearchTerm.toLowerCase();
    return pantalones.filter((pantalon) => {
      return (
        pantalon.nombre?.toLowerCase().includes(searchLower) ||
        pantalon.referencia?.toString().includes(debouncedSearchTerm)
      );
    });
  }, [pantalones, debouncedSearchTerm]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="text-destructive">
            <Package className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">
              Error al cargar pantalones
            </h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              Intentar de nuevo
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pantalones</h2>
          <p className="text-muted-foreground">
            {loading
              ? "Cargando..."
              : `${filteredPantalones.length} de ${pantalones.length} pantalones`}
          </p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col justify-between sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o referencia..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 h-10"
            aria-label="Buscar pantalones"
          />
        </div>
        <RippleButton
          variant="default"
          size="lg"
          onClick={handleCreatePantalon}
          className="shrink-0 whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Pantalón
          <RippleButtonRipples />
        </RippleButton>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(GRID_SKELETON_COUNT)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && (
        <>
          {filteredPantalones.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <Package className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    No se encontraron pantalones
                  </h3>
                  <p className="text-muted-foreground">
                    {pantalones.length === 0
                      ? "Aún no has creado ningún pantalón."
                      : "No se encontraron pantalones con ese término de búsqueda."}
                  </p>
                </div>
                {pantalones.length === 0 && (
                  <Button onClick={handleCreatePantalon}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear tu primer pantalón
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPantalones.map((pantalon) => (
                <ErrorBoundary key={pantalon.referencia}>
                  <PantalonCardAPI pantalon={pantalon} />
                </ErrorBoundary>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});
