"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { InsumoWithValue } from "@/types/dashboard";

interface TopInsumosSectionProps {
  topInsumos: InsumoWithValue[];
}

export function TopInsumosSection({ topInsumos }: TopInsumosSectionProps) {
  const router = useRouter();

  if (topInsumos.length === 0) {
    return (
      <Card className="md:col-span-4 lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp
              className="h-5 w-5"
              style={{ color: "var(--primary)" }}
            />
            Top Insumos por Valor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">
            No hay insumos registrados
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...topInsumos.map((i) => i.valorTotal));

  return (
    <Card className="md:col-span-4 lg:col-span-4">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" style={{ color: "var(--primary)" }} />
          Top Insumos por Valor
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/insumos")}
        >
          Ver todos →
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topInsumos.map((insumo, index) => {
            const percentage = (insumo.valorTotal / maxValue) * 100;

            return (
              <div
                key={insumo.referencia}
                onClick={() => router.push(`/insumos/${insumo.referencia}`)}
                className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 cursor-pointer hover:bg-accent transition-colors"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {insumo.nombre}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ref: {insumo.referencia}
                  </div>

                  {/* Mini barra de progreso */}
                  <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: "var(--primary)",
                      }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className="font-bold text-sm sm:text-base"
                    style={{ color: "var(--primary)" }}
                  >
                    {formatCurrency(insumo.valorTotal)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {insumo.cantidad} {insumo.unidad}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
