import { useMemo } from "react";
import {
  Pantalon,
  PantalonAPI,
  PantalonAPIWithPrice,
  calculatePantalonAPIPrice,
} from "@/types/pantalones";

interface PantalonWithPrice extends Pantalon {
  precioTotal: number;
}

// Utility function to calculate price range - DRY principle
function calculatePriceRange<T extends { precioTotal: number }>(items: T[]) {
  if (items.length === 0) {
    return { minPrecio: 0, maxPrecio: 200000 };
  }

  let min = Infinity;
  let max = -Infinity;

  for (const item of items) {
    const precio = item.precioTotal;
    if (precio < min) min = precio;
    if (precio > max) max = precio;
  }

  return {
    minPrecio: min === Infinity ? 0 : min,
    maxPrecio: max === -Infinity ? 200000 : max,
  };
}

// Legacy hook for backward compatibility
export function usePantalonPricing(pantalones: Pantalon[]) {
  const pantalonesWithPrices = useMemo(() => {
    return pantalones.map((pantalon): PantalonWithPrice => {
      const precioInsumos = pantalon.insumos.reduce(
        (total, insumo) => total + insumo.cantidad * insumo.precio,
        0
      );
      const precioTotal = precioInsumos + pantalon.manoDeObra.precio;

      return {
        ...pantalon,
        precioTotal,
      };
    });
  }, [pantalones]);

  const { minPrecio, maxPrecio } = useMemo(
    () => calculatePriceRange(pantalonesWithPrices),
    [pantalonesWithPrices]
  );

  return {
    pantalonesWithPrices,
    minPrecio,
    maxPrecio,
  };
}

// New hook for API data
export function usePantalonAPIPricing(pantalones: PantalonAPI[]) {
  const pantalonesWithPrices = useMemo(() => {
    return pantalones.map(
      (pantalon): PantalonAPIWithPrice => ({
        ...pantalon,
        precioTotal: calculatePantalonAPIPrice(pantalon),
      })
    );
  }, [pantalones]);

  const { minPrecio, maxPrecio } = useMemo(
    () => calculatePriceRange(pantalonesWithPrices),
    [pantalonesWithPrices]
  );

  return {
    pantalonesWithPrices,
    minPrecio,
    maxPrecio,
  };
}
