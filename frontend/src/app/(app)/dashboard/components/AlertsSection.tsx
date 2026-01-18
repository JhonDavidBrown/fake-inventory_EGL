"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { AlertTriangle } from "lucide-react";

interface InsumosStats {
  total: number;
  disponibles: number;
  bajoStock: number;
  agotados: number;
  valorTotal: number;
}

interface AlertsSectionProps {
  stats: InsumosStats;
}

export function AlertsSection({ stats }: AlertsSectionProps) {
  const router = useRouter();
  const totalAlertas = stats.agotados + stats.bajoStock;

  return (
    <Card className="md:col-span-4 lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle
            className="h-5 w-5"
            style={{ color: "var(--primary)" }}
          />
          Alertas de Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge
            variant="outline"
            style={{
              borderColor: "var(--destructive)",
              color: "var(--destructive)",
            }}
            className="text-xs px-2 py-1"
          >
            {stats.agotados} Agotados
          </Badge>
          <Badge
            variant="outline"
            style={{
              borderColor: "var(--liquid-button-color)",
              color: "var(--liquid-button-color)",
            }}
            className="text-xs px-2 py-1"
          >
            {stats.bajoStock} Bajo Stock
          </Badge>
          <Badge
            variant="outline"
            style={{
              borderColor: "var(--primary)",
              color: "var(--primary)",
            }}
            className="text-xs px-2 py-1"
          >
            {stats.disponibles} Disponibles
          </Badge>
        </div>

        {totalAlertas > 0 && (
          <div className="mt-3 space-y-3">
            <div
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: "var(--liquid-button-background-color)",
                borderColor: "var(--liquid-button-color)",
              }}
            >
              <div
                className="text-xs font-medium"
                style={{ color: "var(--liquid-button-color)" }}
              >
                {totalAlertas} insumos requieren atención
              </div>
            </div>

            <LiquidButton
              variant="default"
              size="sm"
              fillHeight="2px"
              onClick={() => router.push("/insumos")}
              className="w-full"
            >
              Resolver Alertas
            </LiquidButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
