import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  PantalonAPI,
  PantalonAPIWithPrice,
  calculatePantalonAPIPrice,
} from "@/types/pantalones";
import { createSmartRefresh } from "@/lib/debounce";

interface UsePantalonesAPIReturn {
  pantalones: PantalonAPI[];
  pantalonesWithPrices: PantalonAPIWithPrice[];
  loading: boolean;
  error: string | null;
  refetch: (silent?: boolean) => Promise<void>;
}

export function usePantalonesAPI(): UsePantalonesAPIReturn {
  const [pantalones, setPantalones] = useState<PantalonAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchPantalones = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pantalones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching pantalones: ${response.status} ${response.statusText}`
        );
      }

      const data: PantalonAPI[] = await response.json();
      setPantalones(data);
      
      if (silent) {
        console.log("Pantalones data refreshed silently");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching pantalones:", err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [getToken]);

  useEffect(() => {
    fetchPantalones();
  }, [fetchPantalones]);

  // Smart auto-refresh with debouncing and throttling
  const smartRefresh = useMemo(
    () => createSmartRefresh(
      () => fetchPantalones(true),
      {
        debounceMs: 2000,    // Wait 2s after last focus/visibility change
        throttleMs: 10000,   // Don't refresh more than once per 10s
        maxStaleMs: 60000,   // Force refresh if data is older than 1 minute
      }
    ),
    [fetchPantalones]
  );

  useEffect(() => {
    const handleFocus = () => {
      // Only refresh if window was actually inactive
      smartRefresh();
    };

    const handleVisibilityChange = () => {
      // Only refresh when becoming visible, not when hiding
      if (!document.hidden) {
        smartRefresh();
      }
    };

    // Listen for window focus events
    window.addEventListener('focus', handleFocus);
    
    // Listen for visibility change events (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [smartRefresh]);

  // Calculate prices for all pantalones - memoized for performance
  const pantalonesWithPrices = useMemo(
    (): PantalonAPIWithPrice[] =>
      pantalones.map((pantalon) => ({
        ...pantalon,
        precioTotal: calculatePantalonAPIPrice(pantalon),
      })),
    [pantalones]
  );

  return {
    pantalones,
    pantalonesWithPrices,
    loading,
    error,
    refetch: fetchPantalones,
  };
}
