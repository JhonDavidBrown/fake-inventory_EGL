import React from "react";
import { Package, Wrench } from "lucide-react";
import { formatPrice } from "@/util/formatters";
import { PantalonAPIWithPrice } from "@/types/pantalones";

interface InsumosSectionProps {
  insumos: PantalonAPIWithPrice["insumos"];
  total: number;
}

interface ProcesosSectionProps {
  procesos: PantalonAPIWithPrice["procesos"];
  total: number;
}

export const InsumosSection = React.memo(function InsumosSection({
  insumos,
  total,
}: InsumosSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <span className="font-medium">Insumos ({insumos.length})</span>
      </div>
      {insumos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No hay insumos registrados.
        </p>
      ) : (
        <div className="space-y-2">
          {insumos.map((insumo) => (
            <div
              key={insumo.referencia}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="space-y-1">
                <div className="text-sm font-medium">{insumo.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  Ref: {insumo.referencia} • {insumo.unidad}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm font-medium">
                  {formatPrice(
                    parseFloat(insumo.preciounidad) *
                      insumo.PantalonInsumo.cantidad_usada
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {insumo.PantalonInsumo.cantidad_usada} ×{" "}
                  {formatPrice(parseFloat(insumo.preciounidad))}
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t font-medium text-sm">
            <span>Subtotal insumos:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
});

export const ProcesosSection = React.memo(function ProcesosSection({
  procesos,
  total,
}: ProcesosSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        <span className="font-medium">Mano de Obra ({procesos.length})</span>
      </div>
      {procesos.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No hay procesos registrados.
        </p>
      ) : (
        <div className="space-y-2">
          {procesos.map((proceso) => (
            <div
              key={proceso.referencia}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="space-y-1">
                <div className="text-sm font-medium">{proceso.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  Ref: {proceso.referencia}
                </div>
              </div>
              <div className="text-sm font-medium">
                {formatPrice(proceso.precio)}
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t font-medium text-sm">
            <span>Subtotal mano de obra:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
});
