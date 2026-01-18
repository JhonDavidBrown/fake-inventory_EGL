"use client";

import { useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, Wrench, Calculator, X, ImageOff } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pantalon } from "@/types/pantalones";

interface PantalonDetailProps {
  pantalon: Pantalon;
  precio: number;
  onClose: () => void;
}

export function PantalonDetail({
  pantalon,
  precio,
  onClose,
}: PantalonDetailProps) {
  // Memoize the price formatter to avoid recreation on every render
  const formatearPrecio = useMemo(
    () =>
      new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }),
    []
  );

  // Memoize the cost calculation
  const costoInsumos = useMemo(
    () =>
      pantalon.insumos.reduce(
        (total, insumo) => total + insumo.cantidad * insumo.precio,
        0
      ),
    [pantalon.insumos]
  );

  // Memoize the format function to avoid recreation
  const formatPrice = useCallback(
    (precio: number): string => formatearPrecio.format(precio),
    [formatearPrecio]
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{pantalon.nombre}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Imagen */}
          <div className="space-y-4">
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              {pantalon.imagen ? (
                <div className="relative h-full w-full bg-gray-100">
                  <Image
                    src={pantalon.imagen}
                    alt={pantalon.nombre}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : (
                <div className="relative h-full w-full bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-xl">
                      <ImageOff className="h-16 w-16 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-700">Sin imagen disponible</p>
                      <p className="text-sm text-gray-500 mt-1">Este producto no tiene imagen asignada</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Información del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Referencia:</span>
                  <span className="font-medium">{pantalon.referencia}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Talla:</span>
                  <Badge variant="secondary">{pantalon.talla}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{pantalon.nombre}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalles de costos */}
          <div className="space-y-4">
            {/* Insumos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Insumos Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pantalon.insumos.map((insumo, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{insumo.nombre}</div>
                        <div className="text-sm text-gray-600">
                          Cantidad: {insumo.cantidad} | Precio unitario:{" "}
                          {formatPrice(insumo.precio)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatPrice(insumo.cantidad * insumo.precio)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Subtotal Insumos:</span>
                    <span className="text-blue-600">
                      {formatPrice(costoInsumos)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mano de obra */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Mano de Obra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {pantalon.manoDeObra.nombre}
                    </div>
                    <div className="text-sm text-gray-600">
                      Costo de confección
                    </div>
                  </div>
                  <div className="font-semibold text-orange-600">
                    {formatPrice(pantalon.manoDeObra.precio)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de costos */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Calculator className="h-5 w-5" />
                  Resumen de Costos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Costo de Insumos:</span>
                  <span>{formatPrice(costoInsumos)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de Mano de Obra:</span>
                  <span>{formatPrice(pantalon.manoDeObra.precio)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold text-green-700">
                  <span>Costo Total de Producción:</span>
                  <span>{formatPrice(precio)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
