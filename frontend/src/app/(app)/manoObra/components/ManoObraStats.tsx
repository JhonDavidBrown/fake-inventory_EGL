"use client";

import { formatCurrency } from "@/lib/formatters";
import { Package, BarChart3, DollarSign } from "lucide-react";

interface ManoObra {
  referencia: string;
  nombre: string;
  precio: number | string;
}

interface Props {
  data: ManoObra[];
  filteredData: ManoObra[];
}

export function ManoObraStats({ data, filteredData }: Props) {
  const total = filteredData.length;
  const precioTotal = filteredData.reduce((acc, item) => acc + Number(item.precio), 0);
  const precioPromedio = total > 0 ? precioTotal / total : 0;

  return (
    <div className="w-full">
      {/* Contenedor con scroll horizontal en móvil */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:min-w-0">
          {/* Registros filtrados */}
          <div className="flex-shrink-0 w-48 sm:w-auto rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Registros filtrados
              </h3>
            </div>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">
              de {data.length} en total
            </p>
          </div>

          {/* Costo total */}
          <div className="flex-shrink-0 w-48 sm:w-auto rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Costo total
              </h3>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(precioTotal)}
            </p>
            <p className="text-xs text-muted-foreground">de mano de obra</p>
          </div>

          {/* Precio promedio */}
          <div className="flex-shrink-0 w-48 sm:w-auto rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Precio promedio
              </h3>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(precioPromedio)}
            </p>
            <p className="text-xs text-muted-foreground">por servicio</p>
          </div>
        </div>
      </div>
    </div>
  );
}
