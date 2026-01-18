/**
 * Type guard utilities for runtime type checking
 */

export function isValidTalla(
  value: string
): value is
  | "28"
  | "30"
  | "32"
  | "34"
  | "36"
  | "38"
  | "40"
  | "42"
  | "44"
  | "46" {
  return ["28", "30", "32", "34", "36", "38", "40", "42", "44", "46"].includes(
    value
  );
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return validTypes.includes(file.type) && file.size <= maxSize;
}

export function isValidStep(step: number): boolean {
  return step >= 1 && step <= 5 && Number.isInteger(step);
}
