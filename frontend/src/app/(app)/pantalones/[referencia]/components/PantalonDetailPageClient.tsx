"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calendar, Hash, Ruler, DollarSign, AlertCircle, ImageOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

import { usePantalonDetail } from "@/hooks/usePantalonDetail";
import { usePantalonDelete } from "@/hooks/usePantalonDelete";
import { PantalonDetailSkeleton } from "@/components/ui/pantalon-detail-skeleton";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { formatPrice, formatDateDetailed } from "@/util/formatters";
import { InsumosSection, ProcesosSection } from "@/components/PantalonDetailSections";
import { getTallasArray, getTallasWithQuantities } from "@/types/pantalones";

interface PantalonDetailPageClientProps {
  referencia: string;
}

export function PantalonDetailPageClient({ referencia }: PantalonDetailPageClientProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const { pantalon, loading, error, refetch } = usePantalonDetail(referencia);
  const { isDeleting, deletePantalon } = usePantalonDelete();

  const { insumosTotal, procesosTotal } = useMemo(() => {
    if (!pantalon) return { insumosTotal: 0, procesosTotal: 0 };
    const insumosTotal = pantalon.insumos.reduce(
      (total, insumo) => total + parseFloat(insumo.preciounidad) * insumo.PantalonInsumo.cantidad_usada, 0
    );
    const procesosTotal = pantalon.procesos.reduce((total, proceso) => total + proceso.precio, 0);
    return { insumosTotal, procesosTotal };
  }, [pantalon]);
  
  const tallasConCantidades = useMemo(() => {
    if (!pantalon) return {};
    return getTallasWithQuantities(pantalon.tallas_disponibles, Number(pantalon.cantidad));
  }, [pantalon]);

  const tallasArray = useMemo(() => {
    if (!pantalon) return [];
    return getTallasArray(pantalon.tallas_disponibles);
  }, [pantalon]);

  const handleEdit = useCallback(() => {
    router.push(`/pantalones/${referencia}/editar`);
  }, [referencia, router]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pantalon) return;
    await deletePantalon(referencia);
    setDeleteDialogOpen(false);
  }, [deletePantalon, referencia, pantalon]);

  if (loading) {
    return <PantalonDetailSkeleton onBack={() => router.back()} />;
  }

  if (error || !pantalon) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">
          {error ? "Error al cargar el producto" : "Producto no encontrado"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {error || `No se pudo encontrar el pantalón con referencia #${referencia}.`}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
          <Button onClick={() => refetch()}>Intentar de nuevo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{pantalon.nombre}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1.5"><Hash className="h-4 w-4" /> Referencia: {pantalon.referencia}</div>
            <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Creado: {formatDateDetailed(pantalon.created_at)}</div>
          </div>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <Button variant="outline" onClick={handleEdit}><Edit className="h-4 w-4 mr-2" /> Editar</Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}><Trash2 className="h-4 w-4 mr-2" /> Eliminar</Button>
        </div>
      </header>
      
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* === INICIO COLUMNA IZQUIERDA === */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagen del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden">
                {pantalon.imagen_url ? (
                  <div className="relative h-full w-full bg-muted group">
                    <Image
                      src={pantalon.imagen_url}
                      alt={`Imagen de ${pantalon.nombre}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority
                    />
                  </div>
                ) : (
                  <div className="relative h-full w-full bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-xl">
                        <ImageOff className="h-16 w-16 text-blue-600" strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-700">Sin imagen disponible</p>
                        <p className="text-sm text-gray-500 mt-1">Este producto no tiene imagen asignada</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* === FIN COLUMNA IZQUIERDA === */}

        {/* === INICIO COLUMNA DERECHA === */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-muted-foreground">Cantidad en stock:</span>
                <div className="text-lg font-bold">{pantalon.cantidad} unidades</div>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Ruler className="h-4 w-4" /> Tallas disponibles ({tallasArray.length})
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {tallasArray.map((talla) => (
                    <div
                      key={talla}
                      className="flex flex-col items-center justify-center p-3 border-2 rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-[10px] font-medium text-muted-foreground uppercase mb-1">
                        Talla
                      </span>
                      <span className="text-2xl font-bold text-foreground leading-none">
                        {talla}
                      </span>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-lg font-semibold text-primary">
                          {tallasConCantidades[talla] || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          uds
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Análisis de Costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InsumosSection insumos={pantalon.insumos} total={insumosTotal} />
              <Separator />
              <ProcesosSection procesos={pantalon.procesos} total={procesosTotal} />
              <Separator />
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-primary">Precio unitario total:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(pantalon.precioTotal)}
                  </span>
                </div>
                <div className="text-xs text-primary/80 mt-1">Calculado automáticamente (insumos + procesos)</div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* === FIN COLUMNA DERECHA === */}
        
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Eliminar Pantalón"
        description="Esta acción eliminará permanentemente este pantalón y no se puede deshacer."
        itemName={pantalon.nombre}
        requiredReference={pantalon.referencia.toString()}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
      />
    </div>
  );
}