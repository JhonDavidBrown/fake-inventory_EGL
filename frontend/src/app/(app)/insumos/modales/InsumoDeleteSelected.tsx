"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { Insumo } from "../types";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useCompany } from "@/context/CompanyContext";

interface InsumoDeleteSelectedProps {
  selected: Insumo[];
  fetchData: () => Promise<void>;
  clearSelection: () => void;
}

export function InsumoDeleteSelected({
  selected,
  fetchData,
  clearSelection,
}: InsumoDeleteSelectedProps) {
  const api = useApi({ showErrorToast: false });
  const { getToken } = useAuth();
  const { selectedCompany } = useCompany();
  const [isDeleting, setIsDeleting] = useState(false);

  // Log de datos recibidos al renderizar
  console.log(`🎯 [InsumoDeleteSelected] Renderizado`, {
    selectedCount: selected.length,
    selectedItems: selected.map(s => ({
      referencia: s.referencia,
      nombre: s.nombre,
      tipoReferencia: typeof s.referencia
    }))
  });

  // Memoize expensive calculations
  const valorTotal = useMemo(() => {
    return selected.reduce((acc, item) => {
      // CORREGIDO: Usar los nombres reales de la API
      const cantidad = typeof item.cantidad === "string"
        ? parseFloat(item.cantidad)
        : item.cantidad;
      const precio = typeof item.preciounidad === "string"
        ? parseFloat(item.preciounidad)
        : item.preciounidad;

      return acc + (cantidad * precio);
    }, 0);
  }, [selected]);

  const handleDelete = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsDeleting(true);

      console.log(`🚀 [InsumoDeleteSelected] Iniciando eliminación`, {
        totalItems: selected.length,
        items: selected.map(item => ({
          referencia: item.referencia,
          nombre: item.nombre,
          url: `/insumos/${item.referencia}`
        }))
      });

      try {
        const token = await getToken();

        const results = await Promise.allSettled(
          selected.map(async (item) => {
            console.log(`📤 [InsumoDeleteSelected] Enviando DELETE para:`, {
              referencia: item.referencia,
              nombre: item.nombre,
              url: `/insumos/${item.referencia}`
            });

            try {
              const response = await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/insumos/${item.referencia}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "X-Company-Id": selectedCompany,
                  },
                }
              );

              console.log(`✅ [InsumoDeleteSelected] Eliminado exitosamente:`, {
                referencia: item.referencia,
                response: response.data
              });

              return {
                referencia: item.referencia,
                nombre: item.nombre,
                success: true,
              };
            } catch (error) {
              console.error(`❌ [InsumoDeleteSelected] Error al eliminar:`, {
                referencia: item.referencia,
                nombre: item.nombre,
                error: error,
                response: axios.isAxiosError(error) ? error.response?.data : null
              });

              return {
                referencia: item.referencia,
                nombre: item.nombre,
                success: false,
                error,
              };
            }
          })
        );

        console.log(`📊 [InsumoDeleteSelected] Resultados de eliminación:`, {
          total: results.length,
          results: results.map((r, idx) => ({
            index: idx,
            status: r.status,
            value: r.status === 'fulfilled' ? r.value : null,
            reason: r.status === 'rejected' ? r.reason : null
          }))
        });

        const fallidos: Array<{
          referencia: string;
          nombre: string;
          detalles?: string;
          pantalones?: Array<{ referencia: string; nombre: string }>;
        }> = [];
        const exitosos: Array<{ referencia: string; nombre: string }> = [];

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value.success) {
            exitosos.push({
              referencia: result.value.referencia.toString(),
              nombre: result.value.nombre,
            });
          } else if (result.status === "fulfilled" && !result.value.success) {
            const failedResult = result.value as { referencia: number; nombre: string; success: boolean; error: any };
            let errorData = null;

            if (axios.isAxiosError(failedResult.error)) {
              errorData = failedResult.error.response?.data;
            }

            console.log(`📋 Error data para insumo ${failedResult.referencia}:`, {
              errorData,
              details: errorData?.details,
              pantalones: errorData?.details?.pantalones
            });

            fallidos.push({
              referencia: failedResult.referencia.toString(),
              nombre: failedResult.nombre,
              detalles: errorData?.details?.message || errorData?.error,
              pantalones: errorData?.details?.pantalones || [],
            });
          } else if (result.status === "rejected") {
            // Manejo de promesas rechazadas
            console.error('❌ Promise rejected:', result.reason);
            // No podemos obtener referencia/nombre aquí, así que mostramos error genérico
          }
        });

        if (exitosos.length > 0) {
          toast.success(
            `Se eliminaron ${exitosos.length} insumo(s) correctamente`
          );
        }

        if (fallidos.length > 0) {
          const tieneDetalles = fallidos.some(f => f.pantalones && f.pantalones.length > 0);

          if (tieneDetalles) {
            toast.error(
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base mb-1 text-red-900">
                      No se pudieron eliminar {fallidos.length} insumo{fallidos.length !== 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-red-700 mb-3">
                      Los siguientes insumos están siendo utilizados en pantalones:
                    </p>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {fallidos.map((item) => (
                        <div key={item.referencia} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-400">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-semibold text-sm text-gray-900">{item.nombre}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex-shrink-0">
                              Ref: {item.referencia}
                            </span>
                          </div>
                          {item.pantalones && item.pantalones.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs font-medium text-gray-600 mb-1.5">Usado en:</p>
                              <div className="space-y-1">
                                {item.pantalones.slice(0, 3).map((p, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 rounded px-2 py-1">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    <span className="font-medium">{p.nombre}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-500">Ref: {p.referencia}</span>
                                  </div>
                                ))}
                                {item.pantalones.length > 3 && (
                                  <div className="text-xs text-gray-500 italic pl-2 pt-1">
                                    + {item.pantalones.length - 3} pantalón{item.pantalones.length - 3 !== 1 ? 'es' : ''} más
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>,
              {
                className: "bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 shadow-lg w-[550px] p-5",
                duration: 6000,
              }
            );
          } else {
            toast.warning(
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1 text-yellow-900">
                      Insumos en uso
                    </h3>
                    <p className="text-sm text-yellow-800 mb-3">
                      Los siguientes insumos están relacionados con pantalones:
                    </p>
                    <div className="space-y-2">
                      {fallidos.map((item) => (
                        <div key={item.referencia} className="flex items-center justify-between bg-white rounded-md px-3 py-2 shadow-sm">
                          <span className="font-medium text-sm text-gray-900">{item.nombre}</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Ref: {item.referencia}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>,
              {
                className: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 shadow-lg w-[450px] p-5",
                duration: 5000,
              }
            );
          }
        }

        await fetchData();
        clearSelection();
      } catch (error) {
        console.error('❌ [InsumoDeleteSelected] Error inesperado:', error);
        toast.error("Error inesperado al eliminar insumos.");
      } finally {
        setIsDeleting(false);
      }
    },
    [selected, fetchData, clearSelection, getToken, selectedCompany]
  );

  // Early return if no items selected
  if (selected.length === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="w-full sm:w-auto flex items-center justify-center whitespace-nowrap"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar seleccionados
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            ¿Eliminar insumos seleccionados?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente {selected.length} insumo
            {selected.length !== 1 ? "s" : ""} con un valor total de $
            {valorTotal.toFixed(2)} COP. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="text-sm font-medium mb-2">Insumos a eliminar:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selected.slice(0, 5).map((item, index) => (
              <div key={index} className="text-xs">
                • {item.nombre} (Ref: {item.referencia})
              </div>
            ))}
            {selected.length > 5 && (
              <div className="text-xs text-muted-foreground">
                ... y {selected.length - 5} más
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 flex items-center justify-center"
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isDeleting ? "Eliminando..." : "Eliminar definitivamente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
