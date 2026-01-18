"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import InsumoHeader from "./Header";
import InsumoMainCard from "./MainCard";
import InsumoSummary from "./Summary";
import InsumoEdit from "../modales/InsumoEdit";
// Reemplazado: usar el tipo centralizado en lugar de la interfaz local
import type { Insumo } from "../types";

export default function InsumoDetailsClient({ insumo }: { insumo: Insumo }) {
  const [currentInsumo, setCurrentInsumo] = useState<Insumo>(insumo);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  const fetchInsumo = async () => {
    const token = await getToken();
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/insumos/${currentInsumo.referencia}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setCurrentInsumo(res.data);
  };

  const handleDelete = async () => {
    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/insumos/${currentInsumo.referencia}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Insumo eliminado correctamente");
      router.push("/insumos");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.warning("Este insumo está en uso y no se puede eliminar.");
      } else {
        toast.error("Error al eliminar el insumo");
      }
    }
  };

  const valorTotal =
    Number(currentInsumo.cantidad) * Number(currentInsumo.preciounidad);

  const formatCurrency = (valor: string | number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "COP",
    }).format(Number(valor));

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const stockBajo = Number(currentInsumo.cantidad) < 20;

  return (
    <>
      <InsumoHeader
        referencia={currentInsumo.referencia.toString()}
        onDelete={handleDelete}
        onEdit={() => setEditOpen(true)}
      />

      {stockBajo && currentInsumo.estado !== "agotado" && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Advertencia:</strong> El stock de este insumo está bajo.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <InsumoMainCard
            insumo={currentInsumo}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            valorTotal={valorTotal}
          />
        </div>
        <div className="space-y-6 order-1 lg:order-2">
          <InsumoSummary
            cantidad={currentInsumo.cantidad}
            unidad={currentInsumo.unidad}
            valorTotalFormatted={formatCurrency(valorTotal)}
            tipo={currentInsumo.tipo}
          />
          <InsumoEdit
            open={editOpen}
            onClose={() => setEditOpen(false)}
            insumo={currentInsumo}
            onUpdated={fetchInsumo}
          />
        </div>
      </div>
    </>
  );
}
