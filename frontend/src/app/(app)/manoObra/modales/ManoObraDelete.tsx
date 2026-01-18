"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";

interface ManoObra {
  referencia: string;
  nombre: string;
  precio: number;
  proveedor?: string;
}

interface ManoObraDeleteProps {
  manoObra: ManoObra;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function ManoObraDelete({
  manoObra,
  open,
  onOpenChange,
  onDeleted,
}: ManoObraDeleteProps) {
  const [loading, setLoading] = useState(false);
  const api = useApi({ showErrorToast: false });

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      console.log('🗑️ Intentando eliminar mano de obra:', {
        referencia: manoObra.referencia,
        nombre: manoObra.nombre
      });

      // Usar la REFERENCIA como en insumos: /manos-de-obra/{referencia}
      await api.delete(`/manos-de-obra/${manoObra.referencia}`);
      
      // Si llegamos aquí, la eliminación fue exitosa (no hubo excepción)
      console.log('✅ Mano de obra eliminada exitosamente');
      toast.success(`Mano de obra "${manoObra.nombre}" eliminada correctamente.`);
      onDeleted();
      onOpenChange(false);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            error?: string;
            message?: string;
            details?: {
              message?: string;
              pantalones?: Array<{ referencia: string; nombre: string }>;
              totalPantalones?: number;
              sugerencia?: string;
            };
          }
        };
        message?: string
      };

      console.error('❌ Error al eliminar mano de obra:', error);
      console.error('❌ Error response:', axiosError?.response);

      if (axiosError?.response?.status === 409) {
        const errorData = axiosError.response.data;
        const pantalones = errorData?.details?.pantalones || [];
        const total = errorData?.details?.totalPantalones || pantalones.length;

        if (pantalones.length > 0) {
          const pantalonesStr = pantalones
            .map(p => `${p.nombre} (Ref: ${p.referencia})`)
            .join(', ');

          toast.error(
            <>
              <div className="font-medium mb-2">
                {errorData?.error || "No se puede eliminar esta mano de obra"}
              </div>
              <div className="text-sm mb-2">
                Esta mano de obra es utilizada en {total} pantalón(es):
              </div>
              <ul className="text-sm list-disc list-inside max-h-24 overflow-y-auto">
                {pantalones.map((p, idx) => (
                  <li key={idx}>{p.nombre} (Ref: {p.referencia})</li>
                ))}
              </ul>
              {errorData?.details?.sugerencia && (
                <div className="text-sm mt-2 italic">
                  💡 {errorData.details.sugerencia}
                </div>
              )}
            </>,
            {
              className: "bg-red-50 text-red-900 border border-red-400 w-[450px] p-4",
              duration: 10000,
            }
          );
        } else {
          toast.error(errorData?.error || "No se puede eliminar esta mano de obra porque está relacionada con otros registros.");
        }
      } else if (axiosError?.response?.status === 404) {
        toast.error("La mano de obra no existe o ya fue eliminada.");
      } else {
        const errorMsg = axiosError?.response?.data?.error || axiosError?.response?.data?.message || axiosError?.message || "Error inesperado";
        toast.error(`Error al eliminar la mano de obra: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            ¿Eliminar mano de obra?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente la mano de obra{" "}
            <span className="font-medium">&quot;{manoObra.nombre}&quot;</span> con referencia{" "}
            <span className="font-medium">{manoObra.referencia}</span>. Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="text-sm font-medium mb-2">Detalles del registro:</div>
          <div className="space-y-1 text-xs">
            <div>• <span className="font-medium">Proceso:</span> {manoObra.nombre}</div>
            <div>• <span className="font-medium">Referencia:</span> {manoObra.referencia}</div>
            <div>• <span className="font-medium">Precio:</span> ${manoObra.precio.toLocaleString()} COP</div>
            <div>• <span className="font-medium">Proveedor:</span> {manoObra.proveedor || "Sin proveedor"}</div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 flex items-center justify-center"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Eliminando..." : "Eliminar definitivamente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
