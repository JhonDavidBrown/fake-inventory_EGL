"use client";

import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Loader2, Wrench, Users } from "lucide-react";
import type { ManoDeObraAPI } from "@/hooks/usePantalonFormEnhanced";

interface ManoDeObraStepEnhancedProps {
  manosDeObra: ManoDeObraAPI[];
  manosDeObraSeleccionadas: ManoDeObraAPI[];
  loadingData: boolean;
  onSeleccionar: (manosDeObra: ManoDeObraAPI[]) => void;
}

export const ManoDeObraStepEnhanced = memo(function ManoDeObraStepEnhanced({
  manosDeObra,
  manosDeObraSeleccionadas,
  loadingData,
  onSeleccionar,
}: ManoDeObraStepEnhancedProps) {
  const formatearNumero = useCallback((numero: number): string => {
    return new Intl.NumberFormat("es-ES").format(numero);
  }, []);

  const toggleManoDeObra = useCallback(
    (manoDeObra: ManoDeObraAPI) => {
      const existe = manosDeObraSeleccionadas.find(
        (m) => m.referencia === manoDeObra.referencia
      );
      if (existe) {
        onSeleccionar(
          manosDeObraSeleccionadas.filter(
            (m) => m.referencia !== manoDeObra.referencia
          )
        );
      } else {
        onSeleccionar([...manosDeObraSeleccionadas, manoDeObra]);
      }
    },
    [manosDeObraSeleccionadas, onSeleccionar]
  );

  const costoTotal = manosDeObraSeleccionadas.reduce(
    (total, mano) => total + mano.precio,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Mano de Obra</h4>
              <p className="text-sm text-muted-foreground">
                Selecciona los tipos de confección necesarios
              </p>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">
                Servicios seleccionados: {manosDeObraSeleccionadas.length}
              </span>
              <span className="text-sm font-bold text-primary">
                Costo total: ${formatearNumero(costoTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de manos de obra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tipos de Confección Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Cargando servicios...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {manosDeObra.map((mano) => {
                const isSelected = manosDeObraSeleccionadas.some(
                  (m) => m.referencia === mano.referencia
                );
                return (
                  <div
                    key={mano.referencia}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-accent/50"
                        : "border-border hover:border-primary/30"
                    }`}
                    onClick={() => toggleManoDeObra(mano)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground text-base mb-1">
                          {mano.nombre}
                        </h5>
                        <div className="text-lg font-semibold text-primary">
                          ${formatearNumero(mano.precio)}
                        </div>
                      </div>

                      {isSelected && (
                        <Badge variant="default" className="text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de seleccionados */}
      {manosDeObraSeleccionadas.length > 0 && (
        <Card className="bg-accent/30">
          <CardHeader>
            <CardTitle className="text-lg">Servicios Seleccionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {manosDeObraSeleccionadas.map((mano) => (
                <div
                  key={mano.referencia}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-foreground">{mano.nombre}</span>
                  <span className="text-sm font-medium text-primary">
                    ${formatearNumero(mano.precio)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Mano de Obra:</span>
                  <span className="text-primary">
                    ${formatearNumero(costoTotal)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
