"use client";

import { useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shirt } from "lucide-react";

// Import from hook to maintain single source of truth
import {
  TALLAS_DISPONIBLES,
  type TallaDisponible,
} from "@/hooks/usePantalonFormEnhanced";

interface FormErrors {
  nombre?: string;
  tallas?: string;
  cantidad?: string;
}

interface BasicInfoStepEnhancedProps {
  nombre: string;
  tallasSeleccionadas: string[];
  tallasConCantidades: Record<string, number>;
  cantidad: string;
  onNombreChange: (nombre: string) => void;
  onTallasChange: (tallas: string[]) => void;
  onCantidadChange: (cantidad: string) => void;
  onDistribucionChange?: (talla: string, cantidad: number) => void;
  onDistribuirEquitativamente?: () => void;
  isLoading?: boolean;
  errors?: FormErrors;
}

export const BasicInfoStepEnhanced = memo(function BasicInfoStepEnhanced({
  nombre,
  tallasSeleccionadas,
  tallasConCantidades,
  cantidad,
  onNombreChange,
  onTallasChange,
  onCantidadChange,
  onDistribucionChange,
  onDistribuirEquitativamente,
  isLoading = false,
  errors,
}: BasicInfoStepEnhancedProps) {
  // Memoize the selected sizes Set for O(1) lookup performance
  const tallasSeleccionadasSet = useMemo(
    () => new Set(tallasSeleccionadas),
    [tallasSeleccionadas]
  );

  const toggleTalla = useCallback(
    (talla: TallaDisponible) => {
      if (isLoading) return;

      const newTallas = tallasSeleccionadas.includes(talla)
        ? tallasSeleccionadas.filter((t) => t !== talla)
        : [...tallasSeleccionadas, talla].sort(
            (a, b) => parseInt(a, 10) - parseInt(b, 10)
          );

      onTallasChange(newTallas);
    },
    [onTallasChange, isLoading, tallasSeleccionadas]
  );

  const seleccionarTodasLasTallas = useCallback(() => {
    if (isLoading) return;
    onTallasChange([...TALLAS_DISPONIBLES]);
  }, [onTallasChange, isLoading]);

  const limpiarTallas = useCallback(() => {
    if (isLoading) return;
    onTallasChange([]);
  }, [onTallasChange, isLoading]);

  // Enhanced quantity change handler with validation
  const handleCantidadChange = useCallback(
    (value: string) => {
      if (isLoading) return;

      // Allow empty string for clearing the field
      if (value === "") {
        onCantidadChange("");
        return;
      }

      // Remove leading zeros and non-numeric characters except for the first digit
      const cleanValue = value.replace(/^0+/, "").replace(/[^\d]/g, "");

      // Only allow positive integers, max 999999
      const numericValue = parseInt(cleanValue, 10);
      if (!isNaN(numericValue) && numericValue > 0 && numericValue <= 999999) {
        onCantidadChange(numericValue.toString());
      } else if (cleanValue === "") {
        onCantidadChange("");
      }
    },
    [onCantidadChange, isLoading]
  );

  // Validar distribución de tallas
  const distribucionValida = useMemo(() => {
    if (tallasSeleccionadas.length === 0 || !cantidad) return null;

    const cantidadNum = parseInt(cantidad, 10);
    if (isNaN(cantidadNum)) return null;

    const totalDistribuido = Object.values(tallasConCantidades).reduce(
      (sum, qty) => sum + qty,
      0
    );

    return {
      totalDistribuido,
      esperado: cantidadNum,
      diferencia: totalDistribuido - cantidadNum,
      esValido: totalDistribuido === cantidadNum,
    };
  }, [tallasSeleccionadas, cantidad, tallasConCantidades]);

  // Mostrar sección de distribución
  const mostrarDistribucion = useMemo(() => {
    return (
      tallasSeleccionadas.length > 0 &&
      cantidad &&
      !isNaN(parseInt(cantidad, 10))
    );
  }, [tallasSeleccionadas, cantidad]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <Shirt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                Detalles del Producto
              </h4>
              <p className="text-sm text-muted-foreground">
                Información básica para identificar el pantalón
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Básica del Pantalón</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombre y Cantidad en una fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre del Producto *</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: Pantalón Jean Skinny"
                value={nombre}
                onChange={(e) => onNombreChange(e.target.value)}
                className={errors?.nombre ? "mt-2 border-destructive" : "mt-2"}
                disabled={isLoading}
              />
              {errors?.nombre && (
                <p className="text-sm text-destructive mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cantidad">Cantidad Total a Producir *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                step="1"
                placeholder="Ej: 50"
                value={cantidad}
                onChange={(e) => handleCantidadChange(e.target.value)}
                className={errors?.cantidad ? "mt-2 border-destructive" : "mt-2"}
                disabled={isLoading}
              />
              {errors?.cantidad && (
                <p className="text-sm text-destructive mt-1">{errors.cantidad}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selección y Distribución de Tallas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Tallas y Distribución</span>
            {tallasSeleccionadas.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {tallasSeleccionadas.length} tallas seleccionadas
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PASO 1: Seleccionar Tallas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">
                1. Selecciona las tallas *
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={seleccionarTodasLasTallas}
                  disabled={isLoading}
                >
                  Todas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={limpiarTallas}
                  disabled={tallasSeleccionadas.length === 0 || isLoading}
                >
                  Limpiar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {TALLAS_DISPONIBLES.map((talla) => {
                const isSelected = tallasSeleccionadasSet.has(talla);
                return (
                  <Button
                    key={talla}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="h-10 text-sm"
                    onClick={() => toggleTalla(talla)}
                    disabled={isLoading}
                  >
                    {talla}
                  </Button>
                );
              })}
            </div>
            {errors?.tallas && (
              <p className="text-sm text-destructive mt-2">{errors.tallas}</p>
            )}
          </div>

          {/* PASO 2: Distribuir Cantidades - Solo visible si hay tallas */}
          {mostrarDistribucion && (
            <>
              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-base font-semibold">
                      2. Distribuye las cantidades por talla *
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Asigna cuántas unidades producirás de cada talla
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onDistribuirEquitativamente}
                    disabled={isLoading}
                  >
                    Distribuir equitativamente
                  </Button>
                </div>

                {/* Indicador de validación grande */}
                {distribucionValida && (
                  <div
                    className={`mb-4 p-4 rounded-lg border-2 ${
                      distribucionValida.esValido
                        ? "bg-green-50 border-green-500"
                        : "bg-red-50 border-red-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {distribucionValida.esValido ? "✓" : "⚠"}
                        </span>
                        <div>
                          <p
                            className={`font-semibold ${
                              distribucionValida.esValido
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {distribucionValida.esValido
                              ? "¡Distribución correcta!"
                              : "Ajusta la distribución"}
                          </p>
                          <p
                            className={`text-sm ${
                              distribucionValida.esValido
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {distribucionValida.esValido
                              ? `${distribucionValida.totalDistribuido} unidades distribuidas correctamente`
                              : distribucionValida.diferencia > 0
                              ? `Tienes ${distribucionValida.diferencia} unidades de más`
                              : `Te faltan ${Math.abs(distribucionValida.diferencia)} unidades`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-3xl font-bold ${
                            distribucionValida.esValido
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {distribucionValida.totalDistribuido}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          de {distribucionValida.esperado}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid de inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {tallasSeleccionadas.map((talla) => {
                    const cantidadTalla = tallasConCantidades[talla] || 0;
                    return (
                      <div
                        key={talla}
                        className={`p-3 border-2 rounded-lg ${
                          cantidadTalla === 0
                            ? "border-yellow-400 bg-yellow-50"
                            : "border-border"
                        }`}
                      >
                        <Label
                          htmlFor={`talla-${talla}`}
                          className="text-sm font-bold block mb-2"
                        >
                          Talla {talla}
                        </Label>
                        <Input
                          id={`talla-${talla}`}
                          type="number"
                          min="0"
                          step="1"
                          value={cantidadTalla}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (onDistribucionChange && !isNaN(val)) {
                              onDistribucionChange(talla, val);
                            }
                          }}
                          disabled={isLoading}
                          className="text-center text-lg font-semibold h-12"
                        />
                        <p className="text-xs text-center text-muted-foreground mt-1">
                          unidades
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Mensaje si no hay tallas seleccionadas */}
          {!mostrarDistribucion && tallasSeleccionadas.length > 0 && (
            <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
              Ingresa la cantidad total para distribuir
            </div>
          )}

          {!mostrarDistribucion && tallasSeleccionadas.length === 0 && (
            <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
              Selecciona las tallas para continuar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
