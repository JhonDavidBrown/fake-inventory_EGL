import { useState, useEffect, useCallback } from "react";
import { useApi } from "./useApi";
import type { DashboardData } from "@/types/dashboard";

export function useDashboardData() {
  const api = useApi({ showErrorToast: true });
  const [data, setData] = useState<DashboardData>({
    insumos: [],
    manoObra: [],
    pantalones: [],
  });

  const fetchData = useCallback(async () => {
    try {
      const [insumos, manoObra, pantalones] = await Promise.all([
        api.get("/insumos"),
        api.get("/manos-de-obra"),
        api.get("/pantalones"),
      ]);

      setData({
        insumos: Array.isArray(insumos) ? insumos : [],
        manoObra: Array.isArray(manoObra) ? manoObra : [],
        pantalones: Array.isArray(pantalones) ? pantalones : [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading: api.loading,
    error: api.error,
    refetch: fetchData,
  };
}
