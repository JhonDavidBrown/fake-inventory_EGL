import { useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { toast } from "sonner";
import { useContext } from "react";
import { CompanyContext } from "@/context/CompanyContext";

interface UseApiOptions {
  showErrorToast?: boolean;
  timeout?: number;
}

interface ApiError {
  message: string;
  status?: number;
}

export function useApi<T = unknown>(options: UseApiOptions = {}) {
  const { showErrorToast = true, timeout = 10000 } = options;
  const { getToken } = useAuth();
  const context = useContext(CompanyContext);
  const selectedCompany = context?.selectedCompany || 'egl';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const request = useCallback(
    async (url: string, config: AxiosRequestConfig = {}): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const finalHeaders = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Company-Id": selectedCompany,
          ...config.headers,
        };

        console.log(`📡 [useApi] ${config.method || 'GET'} ${url}`, {
          companyId: selectedCompany,
          hasXCompanyId: !!finalHeaders["X-Company-Id"],
        });

        const response = await axios({
          url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
          timeout,
          headers: finalHeaders,
          ...config,
        });

        return response.data;
      } catch (err) {
        const apiError: ApiError = {
          message: "Error desconocido",
          status: undefined,
        };

        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;
          apiError.message =
            (axiosError.response?.data as {message?: string})?.message || axiosError.message;
          apiError.status = axiosError.response?.status;
        } else if (err instanceof Error) {
          apiError.message = err.message;
        }

        setError(apiError);

        if (showErrorToast) {
          toast.error(apiError.message);
        }

        console.error("API Error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getToken, showErrorToast, timeout, selectedCompany]
  );

  const get = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      request(url, { ...config, method: "GET" }),
    [request]
  );

  const post = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig) =>
      request(url, { ...config, method: "POST", data }),
    [request]
  );

  const put = useCallback(
    (url: string, data?: unknown, config?: AxiosRequestConfig) =>
      request(url, { ...config, method: "PUT", data }),
    [request]
  );

  const del = useCallback(
    (url: string, config?: AxiosRequestConfig) =>
      request(url, { ...config, method: "DELETE" }),
    [request]
  );

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del,
  };
}
