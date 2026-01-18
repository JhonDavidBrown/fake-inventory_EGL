"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt } from "lucide-react";

// Define tallas as const for better type safety
const TALLAS = ["32", "34", "36", "38", "40"] as const;

interface BasicInfoStepProps {
  nombre: string;
  talla: string;
  onNombreChange: (nombre: string) => void;
  onTallaChange: (talla: string) => void;
}

export function BasicInfoStep({
  nombre,
  talla,
  onNombreChange,
  onTallaChange,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent rounded-lg">
              <Shirt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                Detalles del Producto
              </h4>
              <p className="text-sm text-muted-foreground">
                Información básica para identificar el pantalón
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Nombre del pantalón */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-base font-medium">
                Nombre del Pantalón *
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => onNombreChange(e.target.value)}
                placeholder="Ej: Pantalón Clásico, Jean Skinny, Cargo Deportivo..."
                className="text-base h-12"
                required
              />
              <p className="text-sm text-muted-foreground">
                Elige un nombre descriptivo que identifique claramente el
                producto
              </p>
            </div>

            {/* Selección de talla */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                Talla del Pantalón *
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {TALLAS.map((tallaOption) => (
                  <Button
                    key={tallaOption}
                    type="button"
                    variant={talla === tallaOption ? "default" : "outline"}
                    size="lg"
                    onClick={() => onTallaChange(tallaOption)}
                    className="h-12 text-base font-medium"
                  >
                    {tallaOption}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Selecciona la talla específica para este pantalón
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview de la información */}
      {(nombre || talla) && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h5 className="font-medium text-foreground mb-2">Vista Previa:</h5>
            <div className="text-sm text-muted-foreground">
              {nombre && (
                <p>
                  <span className="font-medium">Nombre:</span> {nombre}
                </p>
              )}
              {talla && (
                <p>
                  <span className="font-medium">Talla:</span> {talla}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
