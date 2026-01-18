"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Shirt,
  Image as ImageIcon,
  Package,
  Wrench,
  Calculator,
} from "lucide-react";
import Image from "next/image";
import type {
  InsumoSeleccionado,
  ManoDeObraAPI,
} from "@/hooks/usePantalonFormEnhanced";

interface ReviewStepProps {
  nombre: string;
  talla: string;
  imagenPreview: string | null;
  insumosSeleccionados: InsumoSeleccionado[];
  manoDeObraSeleccionada: ManoDeObraAPI | null;
  costoTotal: number;
}

export function ReviewStep({
  nombre,
  talla,
  imagenPreview,
  insumosSeleccionados,
  manoDeObraSeleccionada,
  costoTotal,
}: ReviewStepProps) {
  // Función para formatear números con puntos
  const formatearNumero = (numero: number): string => {
    return new Intl.NumberFormat("es-ES").format(numero);
  };

  const costoInsumos = insumosSeleccionados.reduce(
    (total, item) => total + item.cantidadUsada * item.insumo.preciounidad,
    0
  );

  const costoManoDeObra = manoDeObraSeleccionada?.precio || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Revisar y Confirmar
              </h4>
              <p className="text-sm text-gray-600">
                Verifica que toda la información sea correcta antes de crear el
                pantalón
              </p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">
                Todo listo para crear el pantalón
              </span>
              <span className="text-lg font-bold text-green-600">
                ${formatearNumero(costoTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* --- INICIO DE LA SECCIÓN CORREGIDA --- */}
        {/* Columna Izquierda: Información del Producto (con la nueva estructura) */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="h-5 w-5" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Columna de la Imagen */}
              <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {imagenPreview ? (
                  <Image
                    src={imagenPreview}
                    alt="Preview del pantalón"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              {/* Columna de Detalles */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre</label>
                  <p className="text-lg font-semibold">{nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Talla</label>
                  <div>
                    <Badge variant="secondary" className="text-base">{talla}</Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                  Revisa que la imagen y los detalles del producto sean los correctos.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Resumen de Costos */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Costos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Insumos:</span>
                <span className="font-medium">${formatearNumero(costoInsumos)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mano de Obra:</span>
                <span className="font-medium">${formatearNumero(costoManoDeObra)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">${formatearNumero(costoTotal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* --- FIN DE LA SECCIÓN CORREGIDA --- */}
      </div>

      {/* Insumos y Mano de Obra (se mantienen igual) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Insumos Seleccionados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insumosSeleccionados.map((item) => (
              <div
                key={item.insumo.referencia}
                className="flex justify-between items-center"
              >
                <div>
                  <span className="font-medium">{item.insumo.nombre}</span>
                  <div className="text-sm text-gray-600">
                    {item.cantidadUsada} {item.insumo.unidad} × $
                    {formatearNumero(item.insumo.preciounidad)}
                  </div>
                </div>
                <span className="font-medium">
                  $
                  {formatearNumero(
                    item.cantidadUsada * item.insumo.preciounidad
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Mano de Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          {manoDeObraSeleccionada && (
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">
                  {manoDeObraSeleccionada.nombre}
                </span>
                <div className="text-sm text-gray-600">
                  Confección profesional
                </div>
              </div>
              <span className="font-semibold text-orange-600">
                ${formatearNumero(manoDeObraSeleccionada.precio)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}