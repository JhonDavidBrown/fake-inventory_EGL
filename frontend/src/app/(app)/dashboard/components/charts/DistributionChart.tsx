"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface InsumosStats {
  total: number;
  disponibles: number;
  bajoStock: number;
  agotados: number;
  valorTotal: number;
}

interface DistributionChartProps {
  data: InsumosStats;
}

export function DistributionChart({ data }: DistributionChartProps) {
  // Obtener los colores de las variables CSS
  const getComputedColor = (variable: string) => {
    if (typeof window === "undefined") return "#000";
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  };

  const chartData = [
    {
      name: "Disponibles",
      value: data.disponibles,
      color: getComputedColor("--primary"),
    },
    {
      name: "Bajo Stock",
      value: data.bajoStock,
      color: getComputedColor("--liquid-button-color"),
    },
    {
      name: "Agotados",
      value: data.agotados,
      color: getComputedColor("--destructive"),
    },
  ];

  // Filtrar solo los que tienen valor > 0
  const filteredData = chartData.filter((item) => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          label={(entry) => `${entry.value}`}
          labelLine={false}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span style={{ color: "var(--foreground)", fontSize: "12px" }}>
              {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
