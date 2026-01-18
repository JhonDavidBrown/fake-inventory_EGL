"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wrench,
  Loader2,
  CheckCircle,
  Search,
  X,
  Users,
} from "lucide-react";
import type { ManoDeObraAPI } from "@/hooks/usePantalonFormEnhanced";

type TipoManoDeObra = "Básica" | "Intermedia" | "Premium" | "Especializada";

// Constants moved outside component to prevent recreation
const TIPOS_MANO_DE_OBRA: readonly TipoManoDeObra[] = [
  "Básica",
  "Intermedia",
  "Premium",
  "Especializada",
];
const PRECIO_THRESHOLDS = {
  BASICA: 50000,
  INTERMEDIA: 100000,
  PREMIUM: 150000,
} as const;

// Move categorization function outside component to prevent recreation
const categorizarManoDeObra = (precio: number): TipoManoDeObra => {
  if (precio < PRECIO_THRESHOLDS.BASICA) return "Básica";
  if (precio < PRECIO_THRESHOLDS.INTERMEDIA) return "Intermedia";
  if (precio < PRECIO_THRESHOLDS.PREMIUM) return "Premium";
  return "Especializada";
};

interface ManoDeObraStepProps {
  manosDeObra: ManoDeObraAPI[];
  manoDeObraSeleccionada: ManoDeObraAPI | null;
  loadingData: boolean;
  onSeleccionar: (manoDeObra: ManoDeObraAPI) => void;
}

// Move ManoDeObraCard outside component to prevent recreation
interface ManoDeObraCardProps {
  mano: ManoDeObraAPI;
  isCompact?: boolean;
  isSelected: boolean;
  onSelect: (mano: ManoDeObraAPI) => void;
  formatearNumero: (numero: number) => string;
}

const ManoDeObraCard = React.memo(
  ({
    mano,
    isCompact = false,
    isSelected,
    onSelect,
    formatearNumero,
  }: ManoDeObraCardProps) => {
    if (isCompact) {
      return (
        <div
          className={`p-4 border rounded-lg transition-all cursor-pointer ${
            isSelected
              ? "border-primary bg-accent/50"
              : "border-border hover:border-primary/30"
          }`}
          onClick={() => onSelect(mano)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <h5 className="font-semibold text-foreground text-base">
                {mano.nombre}
              </h5>

              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Confección</span>
                <Badge variant="outline" className="text-xs">
                  disponible
                </Badge>
              </div>

              <div className="text-base font-medium text-primary">
                ${formatearNumero(mano.precio)}
                <span className="text-sm text-muted-foreground ml-1">
                  por Unidad
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(mano);
                }}
                disabled={isSelected}
                size="sm"
                variant={isSelected ? "default" : "outline"}
                className="min-w-[90px]"
              >
                {isSelected ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Seleccionado
                  </>
                ) : (
                  <>
                    <Users className="h-3 w-3 mr-1" />
                    Agregar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative p-6 border-2 rounded-lg transition-all cursor-pointer ${
          isSelected
            ? "border-primary bg-accent/50 shadow-sm"
            : "border-border hover:border-primary/30 hover:shadow-sm"
        }`}
        onClick={() => onSelect(mano)}
      >
        {isSelected && (
          <div className="absolute top-3 right-3">
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3" />
            </Badge>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h5 className="font-semibold text-foreground text-lg mb-2">
              {mano.nombre}
            </h5>
            <p className="text-sm text-muted-foreground">
              Proceso de confección profesional
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">Disponible:</span>
              <Badge variant="secondary" className="text-xs">
                disponible
              </Badge>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">
                Precio unitario:
              </span>
              <div className="text-right">
                <div className="font-semibold text-primary text-lg">
                  ${formatearNumero(mano.precio)}
                </div>
                <div className="text-xs text-muted-foreground">por Unidad</div>
              </div>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(mano);
            }}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
          >
            {isSelected ? "Seleccionado" : "Agregar"}
          </Button>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.mano.referencia === nextProps.mano.referencia &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isCompact === nextProps.isCompact
    );
  }
);

ManoDeObraCard.displayName = "ManoDeObraCard";

export function ManoDeObraStep({
  manosDeObra,
  manoDeObraSeleccionada,
  loadingData,
  onSeleccionar,
}: ManoDeObraStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("all");
  const [viewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("common");

  // Memoize formatearNumero to prevent recreation on every render
  const formatearNumero = useCallback((numero: number): string => {
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }, []);

  // Use constant instead of memoized value for static data
  const tiposUnicos = TIPOS_MANO_DE_OBRA;

  // Filtrar mano de obra basado en búsqueda y tipo
  const manoDeObraFiltrada = useMemo(() => {
    if (!searchTerm && selectedTipo === "all") {
      return manosDeObra; // Early return for no filters
    }

    const searchLower = searchTerm.toLowerCase();
    return manosDeObra.filter((mano) => {
      const matchesSearch =
        !searchTerm || mano.nombre.toLowerCase().includes(searchLower);
      const matchesTipo =
        selectedTipo === "all" ||
        categorizarManoDeObra(mano.precio) === selectedTipo;
      return matchesSearch && matchesTipo;
    });
  }, [manosDeObra, searchTerm, selectedTipo]);

  // Mano de obra más común (simulado - basado en precios medios)
  const manoDeObraComun = useMemo(() => {
    return manosDeObra
      .filter((mano) => {
        const tipo = categorizarManoDeObra(mano.precio);
        return ["Intermedia", "Premium"].includes(tipo);
      })
      .slice(0, 6);
  }, [manosDeObra]);

  const limpiarFiltros = useCallback(() => {
    setSearchTerm("");
    setSelectedTipo("all");
  }, []);

  const hasActiveFilters = searchTerm !== "" || selectedTipo !== "all";

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                Tipo de Confección
              </h4>
              <p className="text-sm text-muted-foreground">
                Selecciona el tipo de mano de obra necesaria para este pantalón
              </p>
            </div>
          </div>

          {manoDeObraSeleccionada && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {manoDeObraSeleccionada.nombre}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">
                  ${formatearNumero(manoDeObraSeleccionada.precio)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegación por pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="common">Más Usados</TabsTrigger>
          <TabsTrigger value="browse">Todos ({manosDeObra.length})</TabsTrigger>
        </TabsList>

        {/* Pestaña de mano de obra común */}
        <TabsContent value="common" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos Más Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">
                    Cargando...
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {manoDeObraComun.map((mano) => (
                    <ManoDeObraCard
                      key={mano.referencia}
                      mano={mano}
                      isCompact={true}
                      isSelected={
                        manoDeObraSeleccionada?.referencia === mano.referencia
                      }
                      onSelect={onSeleccionar}
                      formatearNumero={formatearNumero}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de explorar todos */}
        <TabsContent value="browse" className="space-y-4">
          {/* Búsqueda y filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar tipo de confección..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={limpiarFiltros}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filtros por tipo */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTipo === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTipo("all")}
                  >
                    Todos
                  </Button>
                  {tiposUnicos.map((tipo) => (
                    <Button
                      key={tipo}
                      variant={selectedTipo === tipo ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTipo(tipo)}
                    >
                      {tipo}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de mano de obra */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Tipos de Confección</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {manoDeObraFiltrada.length} de {manosDeObra.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">
                    Cargando tipos de confección...
                  </span>
                </div>
              ) : manoDeObraFiltrada.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h5 className="text-lg font-medium text-foreground mb-2">
                    No se encontraron tipos de confección
                  </h5>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Intenta ajustar la búsqueda"
                      : "No hay tipos disponibles"}
                  </p>
                </div>
              ) : (
                <div
                  className={`max-h-96 overflow-y-auto ${
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-2"
                  }`}
                >
                  {manoDeObraFiltrada.map((mano) => (
                    <ManoDeObraCard
                      key={mano.referencia}
                      mano={mano}
                      isCompact={viewMode === "list"}
                      isSelected={
                        manoDeObraSeleccionada?.referencia === mano.referencia
                      }
                      onSelect={onSeleccionar}
                      formatearNumero={formatearNumero}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Información adicional */}
      <Card className="bg-accent/30 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h5 className="font-medium text-foreground mb-2">
                ¿Qué incluye la mano de obra?
              </h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Corte de las piezas según el patrón</li>
                <li>• Ensamblaje y costura de todas las partes</li>
                <li>• Acabados y detalles finales</li>
                <li>• Control de calidad del producto terminado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje si no hay selección */}
      {!manoDeObraSeleccionada && !loadingData && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="p-8 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h5 className="text-lg font-medium text-foreground mb-2">
              Selecciona un tipo de confección
            </h5>
            <p className="text-muted-foreground">
              Ve a &quot;Más Usados&quot; para opciones comunes o explora todos
              los tipos disponibles
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
