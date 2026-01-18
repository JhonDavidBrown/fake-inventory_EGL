import { useMemo } from "react";
import type {
  DashboardData,
  DashboardStats,
  InsumoWithValue,
} from "@/types/dashboard";

// Helper function to safely parse numbers
const safeParseFloat = (value: string | number): number => {
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export function useDashboardStats(data: DashboardData): DashboardStats {
  const insumosStats = useMemo(() => {
    if (!data.insumos?.length) {
      return {
        total: 0,
        disponibles: 0,
        bajoStock: 0,
        agotados: 0,
        valorTotal: 0,
      };
    }

    // Single pass through the array for better performance
    const stats = data.insumos.reduce(
      (acc, item) => {
        const cantidad = safeParseFloat(item.cantidad);
        const precio = safeParseFloat(item.preciounidad);

        acc.total++;
        acc.valorTotal += cantidad * precio;

        switch (item.estado) {
          case "disponible":
            acc.disponibles++;
            break;
          case "bajo stock":
            acc.bajoStock++;
            break;
          case "agotado":
            acc.agotados++;
            break;
        }

        return acc;
      },
      {
        total: 0,
        disponibles: 0,
        bajoStock: 0,
        agotados: 0,
        valorTotal: 0,
      }
    );

    return stats;
  }, [data.insumos]);

  const manoObraStats = useMemo(
    () => ({
      total: data.manoObra.length,
      costoTotal: data.manoObra.reduce((acc, item) => acc + item.precio, 0),
      promedioPrice:
        data.manoObra.length > 0
          ? data.manoObra.reduce((acc, item) => acc + item.precio, 0) /
            data.manoObra.length
          : 0,
    }),
    [data.manoObra]
  );

  const pantalonesStats = useMemo(
    () => ({
      total: data.pantalones.length,
      cantidadTotal: data.pantalones.reduce(
        (acc, item) => acc + item.cantidad,
        0
      ),
      valorTotal: data.pantalones.reduce(
        (acc, item) => acc + item.cantidad * item.precio_individual,
        0
      ),
    }),
    [data.pantalones]
  );

  const alertas = useMemo(
    () => insumosStats.bajoStock + insumosStats.agotados,
    [insumosStats.bajoStock, insumosStats.agotados]
  );

  const topInsumos = useMemo((): InsumoWithValue[] => {
    if (!data.insumos?.length) return [];

    return data.insumos
      .map((insumo) => ({
        ...insumo,
        valorTotal:
          safeParseFloat(insumo.cantidad) * safeParseFloat(insumo.preciounidad),
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 3);
  }, [data.insumos]);

  return {
    insumosStats,
    manoObraStats,
    pantalonesStats,
    alertas,
    topInsumos,
  };
}
