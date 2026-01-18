"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "@/types/dashboard";

interface TrendChartProps {
  data: DashboardData;
}

export function TrendChart({ data }: TrendChartProps) {
  // Obtener el color principal de las variables CSS
  const getComputedColor = (variable: string) => {
    if (typeof window === "undefined") return "#3b82f6";
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  };

  // Generar datos simulados para tendencia (últimos 7 días)
  // En producción, esto vendría de la API con datos históricos reales
  const generateTrendData = () => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const currentValue = data.insumos.length + data.pantalones.length;

    return days.map((day, index) => {
      // Simular variación en los últimos 7 días
      const variation = Math.random() * 0.2 - 0.1; // ±10%
      const value = Math.max(
        0,
        Math.floor(currentValue * (1 - (6 - index) * 0.05 + variation))
      );

      return {
        day,
        items: value,
      };
    });
  };

  const trendData = generateTrendData();
  const primaryColor = getComputedColor("--primary");

  // Crear gradiente ID único
  const gradientId = "colorItems";

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart
        data={trendData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          opacity={0.3}
        />
        <XAxis
          dataKey="day"
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Area
          type="monotone"
          dataKey="items"
          stroke={primaryColor}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          animationDuration={1000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
