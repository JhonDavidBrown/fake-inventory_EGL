"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="p-6 m-4">
          <CardContent className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Algo salió mal</h3>
              <p className="text-muted-foreground">
                Ha ocurrido un error inesperado. Por favor, recarga la página.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
