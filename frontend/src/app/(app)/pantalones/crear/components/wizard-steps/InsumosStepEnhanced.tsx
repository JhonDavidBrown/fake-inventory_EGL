"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Plus,
  Minus,
  X,
  Loader2,
  Search,
  ShoppingCart,
} from "lucide-react";
import type {
  InsumoAPI,
  InsumoSeleccionado,
} from "@/hooks/usePantalonFormEnhanced";

// Constants moved outside component for better performance
const QUANTITY_STEP = 0.5;
const MIN_QUANTITY = 0.5;

interface InsumosStepEnhancedProps {
  insumos: InsumoAPI[];
  insumosSeleccionados: InsumoSeleccionado[];
  loadingData: boolean;
  onAgregarInsumo: (insumo: InsumoAPI) => void;
  onRemoverInsumo: (referencia: number) => void;
  onActualizarCantidad: (referencia: number, cantidad: number) => void;
}

interface InsumoCardProps {
  insumo: InsumoAPI;
  isCompact?: boolean;
  yaSeleccionado: boolean;
  cantidadUsada?: number;
  onAgregarInsumo: (insumo: InsumoAPI) => void;
  onRemoverInsumo: (referencia: number) => void;
  onActualizarCantidad?: (referencia: number, cantidad: number) => void;
  formatearNumero: (numero: number) => string;
}

// Move InsumoCard outside component to prevent recreation on every render
const InsumoCard = memo(function InsumoCard({
  insumo,
  isCompact = false,
  yaSeleccionado,
  cantidadUsada = 0,
  onAgregarInsumo,
  onRemoverInsumo,
  onActualizarCantidad,
  formatearNumero,
}: InsumoCardProps) {
  const handleToggle = useCallback(() => {
    if (yaSeleccionado) {
      onRemoverInsumo(insumo.referencia);
    } else {
      onAgregarInsumo(insumo);
    }
  }, [yaSeleccionado, onRemoverInsumo, onAgregarInsumo, insumo]);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleToggle();
    },
    [handleToggle]
  );

  if (isCompact) {
    return (
      <div
        className={`p-4 border rounded-lg transition-all ${
          yaSeleccionado
            ? "border-primary bg-accent/50"
            : "border-border hover:border-primary/30 cursor-pointer"
        }`}
        onClick={yaSeleccionado ? undefined : handleToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <h5 className="font-semibold text-foreground text-base">
              {insumo.nombre}
            </h5>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">{insumo.tipo}</span>
              <Badge variant="outline" className="text-xs">
                {insumo.cantidad} disponibles
              </Badge>
            </div>

            <div className="text-base font-medium text-primary">
              ${formatearNumero(insumo.preciounidad)}
              <span className="text-sm text-muted-foreground ml-1">
                por {insumo.unidad}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0">
            {!yaSeleccionado ? (
              <Button
                onClick={handleButtonClick}
                size="sm"
                variant="outline"
                className="min-w-[90px]"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar
              </Button>
            ) : (
              <Button
                onClick={handleButtonClick}
                size="sm"
                variant="ghost"
                className="min-w-[90px]"
              >
                <X className="h-3 w-3 mr-1" />
                Quitar
              </Button>
            )}
          </div>
        </div>

        {/* Controles de cantidad cuando está seleccionado */}
        {yaSeleccionado && onActualizarCantidad && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                Cantidad necesaria:
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActualizarCantidad(
                        insumo.referencia,
                        Math.max(MIN_QUANTITY, cantidadUsada - QUANTITY_STEP)
                      );
                    }}
                    disabled={cantidadUsada <= MIN_QUANTITY}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <div className="text-center min-w-[100px] px-2">
                    <Input
                      type="number"
                      value={cantidadUsada}
                      onChange={(e) => {
                        e.stopPropagation();
                        const valor = parseFloat(e.target.value);
                        if (!isNaN(valor) && valor >= MIN_QUANTITY) {
                          onActualizarCantidad(insumo.referencia, valor);
                        } else if (e.target.value === '') {
                          onActualizarCantidad(insumo.referencia, MIN_QUANTITY);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => {
                        e.stopPropagation();
                        e.target.select();
                      }}
                      min={MIN_QUANTITY}
                      step={QUANTITY_STEP}
                      className="h-8 text-center font-bold text-foreground text-lg border-none focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {insumo.unidad}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActualizarCantidad(
                        insumo.referencia,
                        cantidadUsada + QUANTITY_STEP
                      );
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-right min-w-[100px]">
                  <div className="text-xs text-muted-foreground">Subtotal</div>
                  <div className="font-bold text-primary text-lg">
                    ${formatearNumero(cantidadUsada * insumo.preciounidad)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative p-6 border-2 rounded-lg transition-all cursor-pointer ${
        yaSeleccionado
          ? "border-primary bg-accent/50 shadow-sm"
          : "border-border hover:border-primary/30 hover:shadow-sm"
      }`}
      onClick={() => !yaSeleccionado && onAgregarInsumo(insumo)}
    >
      {yaSeleccionado && (
        <div className="absolute top-3 right-3">
          <Badge variant="default" className="text-xs">
            ✓
          </Badge>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-foreground text-lg mb-2">
            {insumo.nombre}
          </h5>
          <p className="text-sm text-muted-foreground">
            Categoría: {insumo.tipo}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted-foreground">Disponible:</span>
            <Badge variant="secondary" className="text-xs">
              {insumo.cantidad} {insumo.unidad}
            </Badge>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted-foreground">
              Precio unitario:
            </span>
            <div className="text-right">
              <div className="font-semibold text-primary text-lg">
                ${formatearNumero(insumo.preciounidad)}
              </div>
              <div className="text-xs text-muted-foreground">
                por {insumo.unidad}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleButtonClick}
          disabled={yaSeleccionado}
          variant={yaSeleccionado ? "default" : "outline"}
          size="sm"
          className="w-full"
        >
          {yaSeleccionado ? "Seleccionado" : "Agregar"}
        </Button>
      </div>
    </div>
  );
});

export const InsumosStepEnhanced = memo(function InsumosStepEnhanced({
  insumos,
  insumosSeleccionados,
  loadingData,
  onAgregarInsumo,
  onRemoverInsumo,
  onActualizarCantidad,
}: InsumosStepEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");

  // Obtener tipos únicos de insumos - memoized with stable reference
  const tiposUnicos = useMemo(() => {
    const tipos = new Set<string>();
    for (const insumo of insumos) {
      tipos.add(insumo.tipo);
    }
    return Array.from(tipos).sort();
  }, [insumos]);

  // Filtrar insumos basado en búsqueda y tipo
  const insumosFiltrados = useMemo(() => {
    return insumos.filter((insumo) => {
      const matchesSearch =
        insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.tipo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo =
        selectedTipo === "all" || insumo.tipo === selectedTipo;
      return matchesSearch && matchesTipo;
    });
  }, [insumos, searchTerm, selectedTipo]);

  // Función para formatear números con puntos - moved outside component for better performance
  const formatearNumero = useCallback((numero: number): string => {
    return new Intl.NumberFormat("es-ES").format(numero);
  }, []);

  const costoTotalInsumos = useMemo(() => {
    return insumosSeleccionados.reduce(
      (total, item) => total + item.cantidadUsada * item.insumo.preciounidad,
      0
    );
  }, [insumosSeleccionados]);

  const limpiarFiltros = useCallback(() => {
    setSearchTerm("");
    setSelectedTipo("all");
  }, []);

  const hasActiveFilters = searchTerm !== "" || selectedTipo !== "all";

  // Create memoized set for O(1) lookup performance
  const insumosSeleccionadosSet = useMemo(
    () => new Set(insumosSeleccionados.map((item) => item.insumo.referencia)),
    [insumosSeleccionados]
  );

  return (
    <div className="space-y-6">
      {/* Header con resumen */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                Materiales Necesarios
              </h4>
              <p className="text-sm text-muted-foreground">
                Selecciona los insumos que necesitas para confeccionar el
                pantalón
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Insumos seleccionados: {insumosSeleccionados.length}
              </span>
              <span className="text-sm font-bold text-primary">
                Costo total: ${formatearNumero(costoTotalInsumos)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegación por pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Explorar Insumos</TabsTrigger>
          <TabsTrigger value="selected">
            Seleccionados ({insumosSeleccionados.length})
          </TabsTrigger>
        </TabsList>

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
                      placeholder="Buscar insumos..."
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

          {/* Lista de insumos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Todos los Insumos</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {insumosFiltrados.length} de {insumos.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">
                    Cargando insumos...
                  </span>
                </div>
              ) : insumosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h5 className="text-lg font-medium text-foreground mb-2">
                    No se encontraron insumos
                  </h5>
                  <p className="text-muted-foreground">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {insumosFiltrados.map((insumo) => {
                    const insumoSeleccionado = insumosSeleccionados.find(
                      (item) => item.insumo.referencia === insumo.referencia
                    );
                    return (
                      <InsumoCard
                        key={insumo.referencia}
                        insumo={insumo}
                        isCompact={true}
                        yaSeleccionado={insumosSeleccionadosSet.has(
                          insumo.referencia
                        )}
                        cantidadUsada={insumoSeleccionado?.cantidadUsada}
                        onAgregarInsumo={onAgregarInsumo}
                        onRemoverInsumo={onRemoverInsumo}
                        onActualizarCantidad={onActualizarCantidad}
                        formatearNumero={formatearNumero}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de seleccionados */}
        <TabsContent value="selected" className="space-y-4">
          {insumosSeleccionados.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Insumos Seleccionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insumosSeleccionados.map((item) => (
                    <div
                      key={item.insumo.referencia}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">
                          {item.insumo.nombre}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          ${formatearNumero(item.insumo.preciounidad)} por{" "}
                          {item.insumo.unidad}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onActualizarCantidad(
                                item.insumo.referencia,
                                Math.max(
                                  MIN_QUANTITY,
                                  item.cantidadUsada - QUANTITY_STEP
                                )
                              )
                            }
                            disabled={item.cantidadUsada <= MIN_QUANTITY}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <div className="text-center min-w-[90px]">
                            <Input
                              type="number"
                              value={item.cantidadUsada}
                              onChange={(e) => {
                                const valor = parseFloat(e.target.value);
                                if (!isNaN(valor) && valor >= MIN_QUANTITY) {
                                  onActualizarCantidad(item.insumo.referencia, valor);
                                } else if (e.target.value === '') {
                                  onActualizarCantidad(item.insumo.referencia, MIN_QUANTITY);
                                }
                              }}
                              onFocus={(e) => e.target.select()}
                              min={MIN_QUANTITY}
                              step={QUANTITY_STEP}
                              className="h-8 text-center font-medium text-foreground border focus-visible:ring-1 focus-visible:ring-primary"
                            />
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.insumo.unidad}
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onActualizarCantidad(
                                item.insumo.referencia,
                                item.cantidadUsada + QUANTITY_STEP
                              )
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <span className="font-bold text-primary">
                            $
                            {formatearNumero(
                              item.cantidadUsada * item.insumo.preciounidad
                            )}
                          </span>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            onRemoverInsumo(item.insumo.referencia)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-foreground">
                      Costo Total de Insumos:
                    </span>
                    <span className="text-primary">
                      ${formatearNumero(costoTotalInsumos)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="p-8 text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h5 className="text-lg font-medium text-foreground mb-2">
                  No hay insumos seleccionados
                </h5>
                <p className="text-muted-foreground">
                  Ve a la pestaña &quot;Explorar&quot; para seleccionar insumos
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});
