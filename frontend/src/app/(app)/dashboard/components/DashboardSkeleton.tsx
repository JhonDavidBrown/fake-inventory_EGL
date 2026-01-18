import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = React.memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-full">
      {/* Company Banner Skeleton */}
      <Skeleton className="h-14 w-full rounded-md" />

      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" /> {/* Título */}
      </div>

      {/* Bento Grid - Replica EXACTA del layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-min w-full">

        {/* Fila 1 - Resumen General (3 cols) */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="h-8 w-16 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fila 1 - Valor Total Inventario (3 cols) */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>

        {/* Fila 2 - Pantalones en Stock (2 cols) */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>

        {/* Fila 2 - Servicios M.O. (2 cols) */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-52" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-48" />
          </CardContent>
        </Card>

        {/* Fila 2 - Alertas de Stock (2 cols) */}
        <Card className="md:col-span-4 lg:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 justify-center">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Fila 3 - Distribución de Stock (3 cols) - GRÁFICO DONA */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </CardContent>
        </Card>

        {/* Fila 3 - Tendencia de Inventario (3 cols) - GRÁFICO LÍNEA */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full rounded-md" />
          </CardContent>
        </Card>

        {/* Fila 4 - Top Insumos (4 cols) */}
        <Card className="md:col-span-4 lg:col-span-4">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
              >
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fila 4 - Análisis de Rendimiento (2 cols) */}
        <Card className="md:col-span-4 lg:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="text-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
