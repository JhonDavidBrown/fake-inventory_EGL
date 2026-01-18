import { getApiUrl } from "./env";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClientOptions {
  token?: string;
  timeout?: number;
  companyId?: string;
}

export class ApiClient {
  private baseURL: string;
  private defaultTimeout = 10000; // 10 seconds
  private abortControllers = new Map<string, AbortController>();
  private getCompanyId: (() => string) | null = null;

  constructor() {
    this.baseURL = getApiUrl();
  }

  // Inyectar la función para obtener la empresa seleccionada
  setCompanyIdGetter(getter: () => string) {
    this.getCompanyId = getter;
  }

  // Cancel pending requests for a specific endpoint
  cancelRequest(endpoint: string): void {
    const controller = this.abortControllers.get(endpoint);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(endpoint);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & ApiClientOptions = {}
  ): Promise<T> {
    const { token, timeout = this.defaultTimeout, companyId, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Obtener companyId del getter si no se proporciona explícitamente
      const finalCompanyId = companyId || (this.getCompanyId ? this.getCompanyId() : 'egl');

      // 🔍 DEBUG: Log para verificar qué empresa se está enviando
      console.log(`🚀 [API Client] ${options.method || 'GET'} ${endpoint}`, {
        hasGetter: this.getCompanyId !== null,
        companyId: companyId || 'undefined',
        finalCompanyId,
        getterResult: this.getCompanyId ? this.getCompanyId() : 'no getter',
        timestamp: new Date().toISOString(),
      });

      const finalHeaders = {
        "Content-Type": "application/json",
        "X-Company-Id": finalCompanyId,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...fetchOptions.headers,
      };

      console.log(`📤 [API Client] Headers siendo enviados:`, {
        "X-Company-Id": finalHeaders["X-Company-Id"],
        "Content-Type": finalHeaders["Content-Type"],
        hasAuth: !!finalHeaders["Authorization"],
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers: finalHeaders,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status,
          response
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }

      throw new ApiError("Network error", 0);
    }
  }

  async get<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: ApiClientOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
