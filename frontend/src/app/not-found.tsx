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
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Página no encontrada</CardTitle>
          <CardDescription>
            La página que buscas no existe o ha sido movida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              La URL que intentas acceder no está disponible. Verifica que la
              dirección sea correcta o navega desde el menú principal.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ir al Inicio
              </Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver Atrás
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              ¿Necesitas ayuda?{" "}
              <a
                href="mailto:soporte@egl.com"
                className="text-primary hover:underline"
              >
                Contacta soporte
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
