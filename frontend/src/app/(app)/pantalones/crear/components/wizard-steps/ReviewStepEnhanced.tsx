"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  Wrench,
  Shirt,
  Image as ImageIcon,
  Calculator, // <--- CORRECCIÓN 1: Se añade la importación faltante
} from "lucide-react";
import Image from "next/image";
import type {
  InsumoSeleccionado,
  ManoDeObraAPI,
} from "@/hooks/usePantalonFormEnhanced";

interface ReviewStepEnhancedProps {
  nombre: string;
  tallasSeleccionadas: string[];
  imagenPreview: string | null;
  insumosSeleccionados: InsumoSeleccionado[];
  manosDeObraSeleccionadas: ManoDeObraAPI[];
  costoTotal: number;
}

export const ReviewStepEnhanced = memo(function ReviewStepEnhanced({
  nombre,
  tallasSeleccionadas,
  imagenPreview,
  insumosSeleccionados,
  manosDeObraSeleccionadas,
  costoTotal,
}: ReviewStepEnhancedProps) {
  const formatearNumero = (numero: number): string => {
    return new Intl.NumberFormat("es-ES").format(numero);
  };

  const costoInsumos = useMemo(() => {
    return insumosSeleccionados.reduce(
      (total, item) => total + item.cantidadUsada * item.insumo.preciounidad,
      0
    );
  }, [insumosSeleccionados]);

  const costoManoDeObra = useMemo(() => {
    return manosDeObraSeleccionadas.reduce(
      (total, mano) => total + mano.precio,
      0
    );
  }, [manosDeObraSeleccionadas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                Revisar y Confirmar
              </h4>
              <p className="text-sm text-muted-foreground">
                Verifica todos los detalles antes de crear el pantalón
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Columna Izquierda: Información del Producto */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                {imagenPreview ? (
                  <Image
                    src={imagenPreview}
                    alt="Preview del pantalón"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-lg font-semibold">{nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tallas Seleccionadas</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tallasSeleccionadas.length > 0 ? (
                      tallasSeleccionadas.map((talla) => (
                        <Badge key={talla} variant="secondary">{talla}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Ninguna</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Resumen de Costos */}
        <div className="lg:col-span-2">
           <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Insumos:</span>
                 <div className="text-right">
                    {/* CORRECCIÓN 2: Se elimina la propiedad 'size' */}
                    <Badge variant="outline" className="mb-1">{insumosSeleccionados.length} items</Badge>
                    <p className="font-semibold">${formatearNumero(costoInsumos)}</p>
                 </div>
              </div>
               <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mano de Obra:</span>
                <div className="text-right">
                    {/* CORRECCIÓN 3: Se elimina la propiedad 'size' */}
                    <Badge variant="outline" className="mb-1">{manosDeObraSeleccionadas.length} servicios</Badge>
                    <p className="font-semibold">${formatearNumero(costoManoDeObra)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-xl">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary">
                  ${formatearNumero(costoTotal)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detalles de Insumos y Mano de Obra */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Insumos Seleccionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insumosSeleccionados.length > 0 ? (
                insumosSeleccionados.map((item) => (
                  <div
                    key={item.insumo.referencia}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{item.insumo.nombre}</span>
                      <div className="text-sm text-muted-foreground">
                        {item.cantidadUsada} {item.insumo.unidad} × $
                        {formatearNumero(item.insumo.preciounidad)}
                      </div>
                    </div>
                    <span className="font-medium text-right">
                      $
                      {formatearNumero(
                        item.cantidadUsada * item.insumo.preciounidad
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay insumos seleccionados.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Servicios de Confección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {manosDeObraSeleccionadas.length > 0 ? (
                manosDeObraSeleccionadas.map((mano) => (
                  <div
                    key={mano.referencia}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{mano.nombre}</span>
                    <span className="font-semibold">
                      ${formatearNumero(mano.precio)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay servicios seleccionados.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
});