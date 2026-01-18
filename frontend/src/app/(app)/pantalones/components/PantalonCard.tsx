"use client";

import { useMemo, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Wrench, ImageOff } from "lucide-react";
import { Pantalon } from "@/types/pantalones";

interface PantalonCardProps {
  pantalon: Pantalon;
  precio: number;
  onClick: () => void;
}

export function PantalonCard({ pantalon, precio, onClick }: PantalonCardProps) {
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

  // Memoize the formatted price to avoid recalculation
  const precioFormateado = useMemo(
    () => formatearPrecio.format(precio),
    [formatearPrecio, precio]
  );

  // Memoize click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
      <div className="relative h-80 overflow-hidden">
        {pantalon.imagen ? (
          <>
            <div className="relative h-full w-full bg-gray-100">
              <Image
                src={pantalon.imagen}
                alt={pantalon.nombre}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </>
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg">
                <ImageOff className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-gray-600">Sin imagen</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-900">
            {pantalon.talla}
          </Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={handleClick}
            className="bg-white/90 text-gray-900 hover:bg-white"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver detalles
          </Button>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
            {pantalon.nombre}
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600">{pantalon.referencia}</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Resumen de insumos */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4" />
          <span>{pantalon.insumos.length} insumos</span>
        </div>

        {/* Mano de obra */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Wrench className="h-4 w-4" />
          <span>{pantalon.manoDeObra.nombre}</span>
        </div>

        {/* Precio total */}
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Costo Total:</span>
            <span className="text-lg font-bold text-green-600">
              {precioFormateado}
            </span>
          </div>
        </div>

        <Button onClick={handleClick} className="w-full mt-3" variant="outline">
          Ver detalles completos
        </Button>
      </CardContent>
    </Card>
  );
}
