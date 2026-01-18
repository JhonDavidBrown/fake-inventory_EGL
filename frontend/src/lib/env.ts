/**
 * Environment configuration utilities
 */

export function getApiUrl(): string {
  // In development, use localhost backend
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  }

  // In production, use environment variable or fallback
  return process.env.NEXT_PUBLIC_API_URL || "/api";
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
