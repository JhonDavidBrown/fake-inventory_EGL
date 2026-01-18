"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
} from "@/components/animate-ui/components/buttons/ripple";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApi } from "@/hooks/useApi";
import { Save } from "lucide-react";

const procesosSugeridos = [
  "Corte",
  "Confección",
  "Lavandería",
  "Empaque",
  "Decoración",
  "Estampado",
];

export function ManoObraCreate({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const api = useApi({ showErrorToast: false }); // We'll handle errors manually for custom messages

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [proveedor, setProveedor] = useState("");

  const handleSubmit = async () => {
    if (!nombre || !precio) {
      toast.error("El nombre y precio son obligatorios.");
      return;
    }

    if (parseFloat(precio) < 0) {
      toast.error("El precio no puede ser negativo.");
      return;
    }

    const result = await api.post("/manos-de-obra", {
      nombre,
      precio: parseFloat(precio),
      proveedor: proveedor.trim() || null,
    });

    if (result) {
      toast.success("Mano de obra creada con éxito.");
      onCreated();
      setOpen(false);
      setNombre("");
      setPrecio("");
      setProveedor("");
    } else {
      toast.error("Error al crear mano de obra.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RippleButton variant="default" size="lg" className="w-full sm:w-auto whitespace-nowrap">
          <span className="hidden sm:inline">Crear Mano de Obra</span>
          <span className="sm:hidden">Agregar</span>
          <RippleButtonRipples />
        </RippleButton>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Agregar Mano de Obra
          </DialogTitle>
          <DialogDescription className="text-sm">
            Registra un nuevo proceso de mano de obra. La referencia se asignará
            automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre" className="text-sm font-medium">
              Proceso
            </Label>
            <Input
              id="nombre"
              list="procesos-list"
              placeholder="Escriba el nombre del proceso"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="h-10"
            />
            <datalist id="procesos-list">
              {procesosSugeridos.map((proceso) => (
                <option key={proceso} value={proceso} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="precio" className="text-sm font-medium">
              Precio
            </Label>
            <Input
              id="precio"
              placeholder="Ej: 120000"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="proveedor" className="text-sm font-medium">
              Proveedor
            </Label>
            <Input
              id="proveedor"
              placeholder="Nombre del proveedor (opcional)"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={api.loading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <Save className="mr-2 h-4 w-4" />
            {api.loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
