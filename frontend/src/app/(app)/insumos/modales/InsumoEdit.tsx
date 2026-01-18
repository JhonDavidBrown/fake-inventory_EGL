"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Tipo basado en los datos reales de la API
interface InsumoReal {
  referencia: number;
  nombre: string;
  tipo: string;
  estado: string | null;
  cantidad: string;
  proveedor: string | null;
  unidad: string;
  preciounidad: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  insumo: InsumoReal | null;
  onUpdated: () => void;
}

export default function InsumoEdit({
  open,
  onClose,
  insumo,
  onUpdated,
}: Props) {
  const api = useApi({ showErrorToast: false });
  const [formData, setFormData] = useState<InsumoReal | null>(insumo);

  useEffect(() => {
    setFormData(insumo);
  }, [insumo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData) return;

    const result = await api.put(`/insumos/${formData.referencia}`, formData);

    if (result) {
      toast.success("Insumo actualizado correctamente");
      onUpdated();
      onClose();
    } else {
      toast.error(api.error?.message || "Error al actualizar el insumo");
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Insumo #{formData.referencia}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Unidad</Label>
            <Input
              name="unidad"
              value={formData.unidad}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Cantidad</Label>
            <Input
              name="cantidad"
              type="number"
              min={0}
              step="any"
              value={formData.cantidad}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Precio Unidad</Label>
            <Input
              name="preciounidad"
              min={0}
              step="any"
              type="number"
              value={formData.preciounidad}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Input
              name="proveedor"
              value={formData.proveedor || ""}
              onChange={handleChange}
              placeholder="Nombre del proveedor (opcional)"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={api.loading} className="w-full">
          {api.loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
