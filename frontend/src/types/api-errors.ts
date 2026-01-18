// API Error Types
export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ValidationError extends APIError {
  field?: string;
  validationErrors?: string[];
}

export interface NetworkError extends APIError {
  isNetworkError: true;
  originalError?: Error;
}

export type FormError = APIError | ValidationError | NetworkError;

// Error handling utilities
export const isValidationError = (
  error: FormError
): error is ValidationError => {
  return "field" in error || "validationErrors" in error;
};

export const isNetworkError = (error: FormError): error is NetworkError => {
  return "isNetworkError" in error && error.isNetworkError === true;
};

export const createAPIError = (message: string, status?: number): APIError => ({
  message,
  status,
});

export const createNetworkError = (originalError: Error): NetworkError => ({
  message: "Error de conexión. Verifica tu conexión a internet.",
  isNetworkError: true,
  originalError,
});
