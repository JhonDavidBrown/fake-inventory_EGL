"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface PantalonFormErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface PantalonFormErrorBoundaryProps {
  children: React.ReactNode;
}

export class PantalonFormErrorBoundary extends React.Component<
  PantalonFormErrorBoundaryProps,
  PantalonFormErrorBoundaryState
> {
  constructor(props: PantalonFormErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(
    error: Error
  ): PantalonFormErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("PantalonForm Error:", error, errorInfo);
    this.setState({ errorInfo });

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/pantalones");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error en el Formulario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Ha ocurrido un error inesperado al procesar el formulario.
            {error?.message && (
              <span className="block mt-2 text-sm font-mono bg-muted p-2 rounded">
                {error.message}
              </span>
            )}
          </p>

          <div className="flex gap-2">
            <Button
              onClick={resetError}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
