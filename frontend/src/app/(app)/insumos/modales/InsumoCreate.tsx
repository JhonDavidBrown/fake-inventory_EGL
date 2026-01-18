"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useApi } from "@/hooks/useApi";
import { Save } from "lucide-react";

const tipos = ["Tela", "Botones", "Taches", "Hilos", "Cierres"];
const unidadesMedida = ["Metros", "Unidades", "Kilogramos", "Cajas", "Rollos"];

interface InsumoCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

// ✅ EXTRAER FormContent FUERA del componente principal
interface FormContentProps {
  form: {
    nombre: string;
    cantidad: string;
    unidad: string;
    tipo: string;
    preciounidad: string;
    proveedor: string;
  };
  loading: boolean;
  onFormChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

function FormContent({ form, loading, onFormChange, onSubmit, onCancel }: FormContentProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del Insumo */}
        <div className="md:col-span-2">
          <label htmlFor="nombre-insumo" className="text-sm font-medium">Nombre del Insumo *</label>
          <input
            id="nombre-insumo"
            name="nombre"
            type="text"
            title="Ingresa el nombre del insumo"
            aria-label="Nombre del insumo"
            required
            value={form.nombre}
            onChange={(e) => onFormChange("nombre", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="Ej: Hilo de algodón"
          />
        </div>

        {/* Cantidad */}
        <div>
          <label htmlFor="cantidad-insumo" className="text-sm font-medium">Cantidad *</label>
          <input
            id="cantidad-insumo"
            name="cantidad"
            type="number"
            title="Ingresa la cantidad inicial"
            aria-label="Cantidad del insumo"
            required
            min="0"
            step="1"
            value={form.cantidad}
            onChange={(e) => onFormChange("cantidad", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="0"
          />
        </div>

        {/* Unidad de Medida */}
        <div>
          <label htmlFor="unidad-medida" className="text-sm font-medium">Unidad de Medida *</label>
          <select
            id="unidad-medida"
            name="unidad"
            title="Selecciona la unidad de medida"
            aria-label="Seleccionar unidad de medida"
            required
            value={form.unidad}
            onChange={(e) => onFormChange("unidad", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
          >
            <option value="">Seleccionar unidad</option>
            {unidadesMedida.map((unidad) => (
              <option key={unidad} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="tipo-insumo" className="text-sm font-medium">Tipo *</label>
          <select
            id="tipo-insumo"
            name="tipo"
            title="Selecciona el tipo de insumo"
            aria-label="Seleccionar tipo de insumo"
            required
            value={form.tipo}
            onChange={(e) => onFormChange("tipo", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
          >
            <option value="">Seleccionar tipo</option>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Precio por Unidad */}
        <div>
          <label htmlFor="precio-unidad" className="text-sm font-medium">Precio por Unidad sin comas y puntos *</label>
          <input
            id="precio-unidad"
            name="preciounidad"
            type="number"
            title="Ingresa el precio por unidad"
            aria-label="Precio por unidad del insumo"
            required
            min="0"
            step="0.01"
            value={form.preciounidad}
            onChange={(e) => onFormChange("preciounidad", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="0.00"
          />
        </div>

        {/* Proveedor */}
        <div className="md:col-span-2">
          <label htmlFor="proveedor-insumo" className="text-sm font-medium">Proveedor</label>
          <input
            id="proveedor-insumo"
            name="proveedor"
            type="text"
            title="Ingresa el nombre del proveedor (opcional)"
            aria-label="Proveedor del insumo"
            value={form.proveedor}
            onChange={(e) => onFormChange("proveedor", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="Nombre del proveedor (opcional)"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            "Guardando..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Insumo
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function InsumoCreate({ open, onOpenChange, onCreated }: InsumoCreateProps) {
  const api = useApi({ showErrorToast: false });
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    unidad: "",
    tipo: "",
    preciounidad: "",
    proveedor: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      cantidad: "",
      unidad: "",
      tipo: "",
      preciounidad: "",
      proveedor: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.nombre || !form.cantidad || !form.unidad || !form.tipo || !form.preciounidad) {
      toast.error("Todos los campos obligatorios deben estar llenos");
      return;
    }

    const result = await api.post("/insumos", {
      nombre: form.nombre,
      cantidad: parseFloat(form.cantidad),
      unidad: form.unidad,
      tipo: form.tipo,
      preciounidad: parseFloat(form.preciounidad),
      proveedor: form.proveedor || "Sin proveedor",
    });

    if (result) {
      toast.success("Insumo creado correctamente");
      await onCreated();
      onOpenChange(false);
      resetForm();
    } else {
      toast.error(api.error?.message || "Error al crear el insumo");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Responsive: Dialog para desktop, Drawer para móvil
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Insumo</DialogTitle>
            <DialogDescription>
              Agrega un nuevo insumo al inventario. Los campos marcados con * son
              obligatorios.
            </DialogDescription>
          </DialogHeader>
          <FormContent
            form={form}
            loading={api.loading}
            onFormChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Crear Nuevo Insumo</DrawerTitle>
          <DrawerDescription>
            Agrega un nuevo insumo al inventario. Los campos marcados con * son
            obligatorios.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
          <FormContent
            form={form}
            loading={api.loading}
            onFormChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
