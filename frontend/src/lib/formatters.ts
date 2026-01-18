// Optimized formatters with memoization
const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2, // ✅ CAMBIADO: Permitir hasta 2 decimales
});

export const formatCurrency = (amount: number): string => {
  return currencyFormatter.format(amount);
};
