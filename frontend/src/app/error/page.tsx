"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Suspense, useCallback, useMemo } from "react";

// Type definitions for better type safety
interface ErrorInfo {
  title: string;
  description: string;
  details: string;
}

type ErrorType =
  | "auth_failed"
  | "oauth_error"
  | "access_denied"
  | "session_expired";

// Error configurations - moved outside component for better performance
const ERROR_CONFIGS: Record<ErrorType, Omit<ErrorInfo, "details">> = {
  auth_failed: {
    title: "Error de Autenticación",
    description: "No se pudo completar el proceso de autenticación",
  },
  oauth_error: {
    title: "Error de OAuth",
    description: "Problema con el proveedor de autenticación",
  },
  access_denied: {
    title: "Acceso Denegado",
    description: "No tienes permisos para acceder a esta página",
  },
  session_expired: {
    title: "Sesión Expirada",
    description: "Tu sesión ha expirado",
  },
} as const;

const ERROR_DETAILS: Record<ErrorType, string> = {
  auth_failed:
    "Hubo un problema al iniciar sesión con tu cuenta. Por favor, intenta nuevamente.",
  oauth_error:
    "No se pudo conectar con Google. Verifica tu conexión e intenta nuevamente.",
  access_denied:
    "Tu cuenta no tiene los permisos necesarios para acceder a este recurso.",
  session_expired:
    "Por seguridad, tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
} as const;

// Separate component for better error boundary handling
function ErrorPageContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const error =
    errorParam && Object.keys(ERROR_CONFIGS).includes(errorParam)
      ? (errorParam as ErrorType)
      : null;
  const message = searchParams.get("message");

  // Memoize error info calculation for performance
  const errorInfo = useMemo((): ErrorInfo => {
    if (error && ERROR_CONFIGS[error]) {
      return {
        ...ERROR_CONFIGS[error],
        details: ERROR_DETAILS[error],
      };
    }

    return {
      title: "Error Inesperado",
      description: "Ha ocurrido un error inesperado",
      details:
        message ||
        "Algo salió mal. Por favor, intenta nuevamente o contacta al soporte técnico.",
    };
  }, [error, message]);

  // Memoize callback to prevent unnecessary re-renders
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
          <CardDescription>{errorInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">{errorInfo.details}</p>
            {error && (
              <p className="mt-2 text-xs text-muted-foreground">
                Código de error:{" "}
                <code className="bg-background px-1 py-0.5 rounded">
                  {error}
                </code>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar Nuevamente
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/sign-in">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Si el problema persiste, contacta al{" "}
              <a
                href="mailto:soporte@egl.com"
                className="text-primary hover:underline"
              >
                soporte técnico
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading component extracted for reusability
const LoadingCard = () => (
  <div className="flex min-h-screen items-center justify-center bg-background p-4">
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Main component with Suspense wrapper for better SSR compatibility
export default function ErrorPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <ErrorPageContent />
    </Suspense>
  );
}
