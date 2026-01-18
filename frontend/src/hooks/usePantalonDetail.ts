import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCompany } from "@/context/CompanyContext";
import {
  PantalonAPI,
  PantalonAPIWithPrice,
  calculatePantalonAPIPrice,
} from "@/types/pantalones";

interface UsePantalonDetailReturn {
  pantalon: PantalonAPIWithPrice | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePantalonDetail(referencia: string): UsePantalonDetailReturn {
  const [pantalon, setPantalon] = useState<PantalonAPIWithPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { selectedCompany } = useCompany();

  const fetchPantalon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/pantalones/${referencia}`;
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Company-Id": selectedCompany,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Pantalón no encontrado");
        }
        throw new Error(
          `Error fetching pantalón: ${response.status} ${response.statusText}`
        );
      }

      const data: PantalonAPI = await response.json();
      const pantalonWithPrice: PantalonAPIWithPrice = {
        ...data,
        precioTotal: calculatePantalonAPIPrice(data),
      };

      setPantalon(pantalonWithPrice);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching pantalón:", err);
    } finally {
      setLoading(false);
    }
  }, [referencia, getToken, selectedCompany]);

  useEffect(() => {
    fetchPantalon();
  }, [fetchPantalon]);

  return {
    pantalon,
    loading,
    error,
    refetch: fetchPantalon,
  };
}
