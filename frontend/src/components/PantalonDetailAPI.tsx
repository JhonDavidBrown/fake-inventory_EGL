import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, Ruler, Hash, Edit, Trash2 } from "lucide-react";
import { InsumosSection, ProcesosSection } from "./PantalonDetailSections";
import { PantalonAPIWithPrice, getTallasArray, getTallasWithQuantities } from "@/types/pantalones";
import {
  formatPrice,
  formatDateDetailed,
} from "@/util/formatters";
import {
  PLACEHOLDER_IMAGE_URL,
} from "@/constants/pantalones";
import Image from "next/image";

interface PantalonDetailAPIProps {
  pantalon: PantalonAPIWithPrice;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PantalonDetailAPI = React.memo(function PantalonDetailAPI({
  pantalon,
  onEdit,
  onDelete,
}: PantalonDetailAPIProps) {

  // Obtener tallas y cantidades (soporta formato legacy y nuevo)
  const tallasConCantidades = useMemo(() => {
    return getTallasWithQuantities(pantalon.tallas_disponibles, Number(pantalon.cantidad));
  }, [pantalon.tallas_disponibles, pantalon.cantidad]);

  const tallasArray = useMemo(() => {
    return getTallasArray(pantalon.tallas_disponibles);
  }, [pantalon.tallas_disponibles]);

  // Memoize cost calculations to avoid repeated computations
  const costCalculations = useMemo(() => {
    const insumosTotal = pantalon.insumos.reduce(
      (total, insumo) =>
        total +
        parseFloat(insumo.preciounidad) * insumo.PantalonInsumo.cantidad_usada,
      0
    );

    const procesosTotal = pantalon.procesos.reduce(
      (total, proceso) => total + proceso.precio,
      0
    );

    return {
      insumosTotal,
      procesosTotal,
      grandTotal: insumosTotal + procesosTotal,
    };
  }, [pantalon.insumos, pantalon.procesos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">
                {pantalon.nombre}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <span>Referencia: {pantalon.referencia}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Creado: {formatDateDetailed(pantalon.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Imagen del producto */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Imagen del Producto</CardTitle>
          </CardHeader>
          <CardContent className="relative flex-1 min-h-[400px] p-0">
            <Image
              src={pantalon.imagen_url}
              alt={`${pantalon.nombre} - Referencia ${pantalon.referencia}`}
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 33vw"
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = PLACEHOLDER_IMAGE_URL;
                target.alt = `Imagen no disponible para ${pantalon.nombre}`;
              }}
            />
          </CardContent>
        </Card>

        {/* Información del producto */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Detalles del Producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stock y cantidad */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Cantidad en stock:</span>
                <div className="text-lg font-bold">
                  {pantalon.cantidad} unidades
                </div>
              </div>
            </div>

            {/* Tallas */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                <span className="font-medium">
                  Tallas disponibles ({tallasArray.length}):
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {tallasArray.map((talla) => (
                  <div
                    key={talla}
                    className="flex flex-col items-center justify-center p-3 border-2 rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-[10px] font-medium text-muted-foreground uppercase mb-1">
                      Talla
                    </span>
                    <span className="text-2xl font-bold text-foreground leading-none">
                      {talla}
                    </span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-lg font-semibold text-primary">
                        {tallasConCantidades[talla] || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        unidades
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Fechas */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="p-2 bg-muted/30 rounded flex justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="font-medium">
                    {formatDateDetailed(pantalon.created_at)}
                  </span>
                </div>
                <div className="p-2 bg-muted/30 rounded flex justify-between">
                  <span className="text-muted-foreground">Actualizado:</span>
                  <span className="font-medium">
                    {formatDateDetailed(pantalon.updated_at)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precios y costos */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Análisis de Costos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InsumosSection
              insumos={pantalon.insumos}
              total={costCalculations.insumosTotal}
            />

            <Separator />

            <ProcesosSection
              procesos={pantalon.procesos}
              total={costCalculations.procesosTotal}
            />

            <Separator />

            {/* Precio final del pantalón */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary">Precio unitario total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(pantalon.precioTotal)}
                </span>
              </div>
              <div className="text-xs text-primary/80 mt-1">
                Calculado automáticamente (insumos + procesos)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
