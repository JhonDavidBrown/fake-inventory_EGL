"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApi } from "@/hooks/useApi";
import { Save } from "lucide-react";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  manoObra: {
    referencia: string;
    nombre: string;
    precio: number;
    proveedor?: string;
    created_at?: string;
    updated_at?: string;
  };
  onUpdated: () => void;
}

export default function ManoObraEdit({
  open,
  setOpen,
  manoObra,
  onUpdated,
}: Props) {
  const api = useApi({ showErrorToast: false });
  const [referencia, setReferencia] = useState(manoObra.referencia);
  const [nombre, setNombre] = useState(manoObra.nombre);
  const [precio, setPrecio] = useState(manoObra.precio.toString());
  const [proveedor, setProveedor] = useState(manoObra.proveedor || "");

  useEffect(() => {
    setReferencia(manoObra.referencia);
    setNombre(manoObra.nombre);
    setPrecio(manoObra.precio.toString());
    setProveedor(manoObra.proveedor || "");
  }, [manoObra]);

  const handleUpdate = async () => {
    const result = await api.put(`/manos-de-obra/${manoObra.referencia}`, {
      referencia,
      nombre,
      precio: parseFloat(precio),
      proveedor: proveedor.trim() || null,
    });

    if (result) {
      toast.success("Mano de obra actualizada");
      onUpdated();
      setOpen(false);
    } else {
      toast.error(api.error?.message || "Error al actualizar mano de obra.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Mano de Obra</DialogTitle>
          <DialogDescription>
            Modifica los datos y guarda los cambios
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="referencia">Referencia</Label>
            <Input
              id="referencia"
              value={referencia}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              La referencia no se puede modificar
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="precio">Precio</Label>
            <Input
              id="precio"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proveedor">Proveedor</Label>
            <Input
              id="proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor (opcional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={api.loading}>
            <Save className="mr-2 h-4 w-4" />
            {api.loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
