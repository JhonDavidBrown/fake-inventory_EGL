"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bug } from "lucide-react";
import { useState, useCallback } from "react";

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);

  // Memoize callback to prevent unnecessary re-renders
  const handleTriggerError = useCallback(() => {
    setShouldError(true);
  }, []);

  if (shouldError) {
    throw new Error("Este es un error de prueba para testing");
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <Bug className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">
            Página de Prueba de Errores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Propósito de Testing</p>
                <p className="text-sm text-muted-foreground">
                  Esta página permite probar el comportamiento del sistema de
                  manejo de errores de la aplicación. Al hacer clic en el botón,
                  se lanzará un error controlado que será capturado por el error
                  boundary de Next.js.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleTriggerError}
              variant="destructive"
              size="lg"
              className="w-full max-w-xs"
            >
              <Bug className="mr-2 h-4 w-4" />
              Lanzar Error de Prueba
            </Button>

            <p className="text-xs text-center text-muted-foreground max-w-md">
              Solo para desarrollo: Este botón simula un error de aplicación
              para verificar que las pantallas de error funcionen correctamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
