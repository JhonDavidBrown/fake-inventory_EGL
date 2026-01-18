import React, { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Wrench, Calendar } from "lucide-react";
import { PantalonAPIWithPrice, getTallasArray, getTallasWithQuantities } from "@/types/pantalones";
import { formatPrice, formatDate } from "@/util/formatters";
import {
  PLACEHOLDER_IMAGE_URL,
} from "@/constants/pantalones";
import { useImageWithFallback } from "@/hooks/useImageWithFallback";
import Image from "next/image";

interface PantalonCardAPIProps {
  pantalon: PantalonAPIWithPrice;
  onViewDetails?: (referencia: string) => void;
}

export const PantalonCardAPI = memo(function PantalonCardAPI({
  pantalon,
}: PantalonCardAPIProps) {
  const router = useRouter();


  const imageProps = useImageWithFallback({
    src: pantalon.imagen_url || PLACEHOLDER_IMAGE_URL,
    fallback: PLACEHOLDER_IMAGE_URL,
    alt: `${pantalon.nombre} - Referencia ${pantalon.referencia}`,
  });

  // Obtener tallas y cantidades (soporta formato legacy y nuevo)
  const tallasConCantidades = useMemo(() => {
    return getTallasWithQuantities(pantalon.tallas_disponibles, Number(pantalon.cantidad));
  }, [pantalon.tallas_disponibles, pantalon.cantidad]);

  const tallasArray = useMemo(() => {
    return getTallasArray(pantalon.tallas_disponibles);
  }, [pantalon.tallas_disponibles]);

  const handleViewDetails = useCallback(() => {
    try {
      router.push(`/pantalones/${pantalon.referencia}`);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [router, pantalon.referencia]);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {pantalon.nombre}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Ref: {pantalon.referencia}</span>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(pantalon.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>{pantalon.cantidad} unidades</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={imageProps.src}
            alt={imageProps.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            priority={false}
            onError={imageProps.onError}
            onLoad={imageProps.onLoad}
          />
          {imageProps.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
          {imageProps.hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Tallas disponibles y distribución */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tallas disponibles:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tallasArray.length > 0 ? (
              tallasArray.map((talla) => (
                <div
                  key={talla}
                  className="flex flex-col items-center justify-center px-2.5 py-1.5 border rounded-md bg-background min-w-[50px] hover:bg-accent/50 transition-colors"
                >
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">
                    Talla
                  </span>
                  <span className="text-lg font-bold text-foreground leading-none">
                    {talla}
                  </span>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-sm font-semibold text-primary">
                      {tallasConCantidades[talla] || 0}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      uds
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No disponible
              </span>
            )}
          </div>
        </div>

        {/* Precio */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Precio unitario:
          </span>
          <span className="font-semibold text-primary">
            {formatPrice(pantalon.precioTotal)}
          </span>
        </div>

        {/* Resumen de insumos y procesos */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span>Insumos:</span>
            </div>
            <span className="font-medium">{pantalon.insumos?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              <span>Procesos:</span>
            </div>
            <span className="font-medium">
              {pantalon.procesos?.length || 0}
            </span>
          </div>
        </div>

        {/* Botón de acción */}
        <Button
          variant="outline"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          onClick={handleViewDetails}
          aria-label={`Ver detalles de ${pantalon.nombre}`}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  );
});
