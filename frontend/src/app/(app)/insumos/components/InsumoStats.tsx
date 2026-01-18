"use client";

import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle, Tag } from "lucide-react";
import { InsumoStats as InsumoStatsType } from "../types";

interface InsumoStatsProps {
  stats: InsumoStatsType | null;
}

export function InsumoStats({ stats }: InsumoStatsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-10 w-16 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Contenedor con scroll horizontal en móvil */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:min-w-0">
          {/* Total de Insumos */}
          <div className="flex-shrink-0 w-48 sm:w-auto rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Insumos
              </h3>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          {/* Stock Bajo - Usar la propiedad correcta */}
          <div className="flex-shrink-0 w-48 sm:w-auto rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Stock Bajo
              </h3>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {stats.bajoStock} {/* ✅ CORREGIDO: Usar bajoStock */}
            </p>
          </div>

          {/* Valor Total */}
          <div className="flex-shrink-0 w-48 sm:w-auto rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Valor Total
              </h3>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.valorTotal)}
            </p>
          </div>

          {/* Tipos Únicos */}
          <div className="flex-shrink-0 w-48 sm:w-auto rounded-lg border bg-card p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Tipos Únicos
              </h3>
            </div>
            <p className="text-2xl font-bold">{stats.tiposUnicos}</p>
          </div>
        </div>
      </div>
    </div>
  );
}