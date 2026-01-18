// ============================================================================
// COMPONENTE DE ESTADÍSTICAS PARA PANTALONES
// ============================================================================

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Ruler,
  DollarSign
} from "lucide-react";
import { PantalonStats } from "../types";
import { formatPrice } from "../lib/formatters";

interface PantalonStatsCardProps {
  stats: PantalonStats | null;
  loading?: boolean;
}

export function PantalonStatsCard({ stats, loading = false }: PantalonStatsCardProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-20" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted animate-pulse rounded w-16 mb-1" />
              <div className="h-3 bg-muted animate-pulse rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsConfig = [
    {
      title: "Total Pantalones",
      value: stats.total.toString(),
      description: "Productos registrados",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Con Stock",
      value: stats.conStock.toString(),
      description: `${stats.sinStock} sin stock`,
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Valor Total",
      value: formatPrice(stats.valorTotal),
      description: `Promedio: ${formatPrice(stats.valorPromedio)}`,
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Tallas Únicas",
      value: stats.tallasUnicas.toString(),
      description: "Variedad disponible",
      icon: Ruler,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat) => {
        const IconComponent = stat.icon;
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default PantalonStatsCard;
