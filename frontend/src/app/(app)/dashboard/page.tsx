"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { useCompany } from "@/context/CompanyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RippleButton,
  RippleButtonRipples,
} from "@/components/animate-ui/components/buttons/ripple";
import {
  Package,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Users,
  Activity,
  PieChartIcon,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import type { DashboardData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/formatters";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CompanyBanner } from "@/components/CompanyBanner";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { AlertsSection } from "./components/AlertsSection";
import { TopInsumosSection } from "./components/TopInsumosSection";
import { DistributionChart } from "./components/charts/DistributionChart";
import { TrendChart } from "./components/charts/TrendChart";

const DashboardPage = React.memo(function DashboardPage() {
  const { getToken } = useAuth();
  const { selectedCompany } = useCompany();
  const [data, setData] = useState<DashboardData>({
    insumos: [],
    manoObra: [],
    pantalones: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();

      if (!token) {
        throw new Error("No authentication token available");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Company-Id": selectedCompany,
      };

      // Add timeout and better error handling
      const axiosConfig = {
        headers,
        timeout: 10000, // 10 second timeout
      };

      // Sequential requests with delays to prevent rate limiting
      const insumosRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/insumos`, axiosConfig);
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
      
      const manoObraRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/manos-de-obra`, axiosConfig);
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
      
      const pantalonesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/pantalones`, axiosConfig);

      setData({
        insumos: Array.isArray(insumosRes.data) ? insumosRes.data : [],
        manoObra: Array.isArray(manoObraRes.data) ? manoObraRes.data : [],
        pantalones: Array.isArray(pantalonesRes.data) ? pantalonesRes.data : [],
      });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : "Error desconocido";

      console.error("Error fetching dashboard data:", error);
      setError(`Error al cargar los datos del dashboard: ${errorMessage}`);
      toast.error("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, [getToken, selectedCompany]);

  useEffect(() => {
    // Add delay to prevent rate limiting on initial load
    const timeoutId = setTimeout(() => {
      fetchDashboardData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchDashboardData, selectedCompany]);

  useEffect(() => {
    document.title = "Dashboard | EGL";
  }, []);

  // Use the custom hook for better performance and maintainability
  const { insumosStats, manoObraStats, pantalonesStats, alertas, topInsumos } =
    useDashboardStats(data);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            Error al cargar el dashboard
          </h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <RippleButton onClick={fetchDashboardData} variant="outline" size="lg">
          Intentar de nuevo
          <RippleButtonRipples />
        </RippleButton>
      </div>
    );
  }

  return (
    <div className="space-y-6  max-w-full">
      {/* Company Banner */}
      <CompanyBanner showAlways={true} />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-min w-full">
        {/* Primera fila - 6 columnas total */}
        {/* Resumen Principal */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: "var(--primary)" }} />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {insumosStats.total}
                </div>
                <div className="text-sm text-muted-foreground">Insumos</div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {pantalonesStats.total}
                </div>
                <div className="text-sm text-muted-foreground">Pantalones</div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {manoObraStats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Servicios M.O.
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--liquid-button-color)" }}
                >
                  {alertas}
                </div>
                <div className="text-sm text-muted-foreground">Alertas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valor Total Inventario */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" style={{ color: "var(--primary)" }} />
              Valor Total Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              {formatCurrency(
                insumosStats.valorTotal + pantalonesStats.valorTotal
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Insumos:</span>
                <span className="font-medium">
                  {formatCurrency(insumosStats.valorTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pantalones:</span>
                <span className="font-medium">
                  {formatCurrency(pantalonesStats.valorTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segunda fila - 6 columnas total */}
        {/* Estadísticas de Producción */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: "var(--primary)" }} />
              Pantalones en Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {pantalonesStats.cantidadTotal}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Unidades totales
            </div>
            <div
              className="text-xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {formatCurrency(pantalonesStats.valorTotal)}
            </div>
            <div className="text-xs text-muted-foreground">
              Valor total producción
            </div>
          </CardContent>
        </Card>

        {/* Costo Mano de Obra */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: "var(--primary)" }} />
              Servicios de Mano de Obra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {manoObraStats.total}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              Servicios disponibles
            </div>
            <div
              className="text-xl font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {formatCurrency(manoObraStats.promedioPrice)}
            </div>
            <div className="text-xs text-muted-foreground">
              Precio promedio servicio
            </div>
          </CardContent>
        </Card>

        {/* Alertas - Componente Mejorado */}
        <AlertsSection stats={insumosStats} />

        {/* Tercera fila - NUEVA - Gráficos */}
        {/* Gráfico de Distribución */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon
                className="h-5 w-5"
                style={{ color: "var(--primary)" }}
              />
              Distribución de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionChart data={insumosStats} />
          </CardContent>
        </Card>

        {/* Gráfico de Tendencia */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" style={{ color: "var(--primary)" }} />
              Tendencia de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={data} />
          </CardContent>
        </Card>

        {/* Cuarta fila - Top Insumos con Componente Mejorado */}
        <TopInsumosSection topInsumos={topInsumos} />

        {/* Métricas Rápidas */}
        <Card className="md:col-span-4 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" style={{ color: "var(--primary)" }} />
              Análisis de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "var(--primary)" }}
                >
                  {insumosStats.total > 0
                    ? Math.round(
                        (insumosStats.disponibles / insumosStats.total) * 100
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm text-muted-foreground">
                  Disponibilidad
                </div>
              </div>
              <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div
                  className="text-lg font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {formatCurrency(
                    insumosStats.total > 0
                      ? insumosStats.valorTotal / insumosStats.total
                      : 0
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Valor prom. insumo
                </div>
              </div>
              <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div
                  className="text-lg font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  {formatCurrency(
                    pantalonesStats.total > 0
                      ? pantalonesStats.valorTotal /
                          pantalonesStats.cantidadTotal
                      : 0
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Precio prom. pantalón
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

// Wrap with ErrorBoundary for better error handling
function DashboardPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <DashboardPage />
    </ErrorBoundary>
  );
}

export default DashboardPageWithErrorBoundary;

