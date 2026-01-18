/**
 * Design system color palette for consistent theming across the application
 * Uses Tailwind's slate palette as the foundation for a professional, elegant look
 */

// Type definitions for better IntelliSense and type safety
export type ButtonVariant = "primary" | "secondary" | "ghost";
export type TextVariant = "primary" | "secondary" | "muted" | "accent";
export type StateVariant = "success" | "warning" | "error";

// Semantic color tokens - prefer these over direct Tailwind classes
export const semanticColors = {
  // Component-specific color schemes
  card: "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
  input:
    "border-slate-200 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-700",
  button: {
    primary: "bg-slate-700 hover:bg-slate-600 text-white",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800",
  },
  text: {
    primary: "text-slate-900 dark:text-slate-100",
    secondary: "text-slate-600 dark:text-slate-300",
    muted: "text-slate-500 dark:text-slate-400",
    accent: "text-sky-600 dark:text-sky-400",
  },
  states: {
    success:
      "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800",
    warning:
      "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800",
    error:
      "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800",
  },
} as const;

// Import and re-export the utility function for convenience
import { cn } from "./utils";
export { cn };

// Helper functions for type-safe color access
export const getButtonClasses = (variant: ButtonVariant): string => {
  return semanticColors.button[variant];
};

export const getTextClasses = (variant: TextVariant): string => {
  return semanticColors.text[variant];
};

export const getStateClasses = (variant: StateVariant): string => {
  return semanticColors.states[variant];
};

// Utility for combining semantic colors with custom classes
export const withSemanticColors = (
  baseClasses: string,
  ...semanticClasses: string[]
): string => {
  return cn(baseClasses, ...semanticClasses);
};
