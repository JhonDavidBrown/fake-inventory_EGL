"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">¡Ups! Algo salió mal</CardTitle>
          <CardDescription>
            Ha ocurrido un error inesperado en la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              No te preocupes, nuestro equipo ha sido notificado del problema.
              Puedes intentar recargar la página o volver al inicio.
            </p>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                  Detalles técnicos (desarrollo)
                </summary>
                <pre className="mt-2 text-xs bg-background p-2 rounded overflow-auto max-h-32">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID del error: {error.digest}
                  </p>
                )}
              </details>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar Nuevamente
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/">
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
