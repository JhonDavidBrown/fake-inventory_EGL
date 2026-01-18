"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader2, Check, Edit } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { Insumo } from "@/types/dashboard";

interface InsumoAddStockProps {
  insumos: Insumo[];
  onStockAdded: () => void;
  onClose: () => void;
  initialInsumo?: Insumo | null;
}

export function InsumoAddStock({ insumos, onStockAdded, onClose, initialInsumo }: InsumoAddStockProps) {
  const api = useApi({ showErrorToast: false });
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(initialInsumo || null);
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(()=>{
    setSelectedInsumo(initialInsumo || null);
  },[initialInsumo]);

  const filteredInsumos = useMemo(() => {
    if (!searchTerm) {
      return insumos;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return insumos.filter(insumo =>
      insumo.nombre.toLowerCase().includes(lowercasedFilter) ||
      insumo.referencia.toString().toLowerCase().includes(lowercasedFilter)
    );
  }, [insumos, searchTerm]);

  const resetForm = useCallback(() => {
    // Si hay un insumo inicial, no lo reseteamos para mantener el contexto
    if (!initialInsumo) {
        setSelectedInsumo(null);
    }
    setCantidad("");
    setPrecio("");
  }, [initialInsumo]);

  const handleSubmit = async () => {
    if (!selectedInsumo || !cantidad || !precio) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }
    const cantidadNum = Number(cantidad);
    const precioNum = Number(precio);

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      toast.error("La cantidad comprada debe ser un número positivo.");
      return;
    }
    if (isNaN(precioNum) || precioNum <= 0) {
      toast.error("El precio de compra debe ser un número positivo.");
      return;
    }

    const payload = {
      cantidadComprada: cantidadNum,
      precioDeCompra: precioNum,
    };

    const result = await api.post(
      `/insumos/${selectedInsumo.referencia}/add-stock`,
      payload
    );

    if (result) {
      toast.success(`Stock añadido a "${selectedInsumo.nombre}" exitosamente.`);
      resetForm();
      await onStockAdded();
      onClose();
    } else {
      toast.error(api.error?.message || "No se pudo añadir el stock. Intenta de nuevo.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Insumo Existente *</Label>
        {!selectedInsumo ? (
          <Command className="rounded-lg border shadow-sm">
            <CommandInput
              placeholder="Buscar insumo por nombre o referencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <CommandList>
                {filteredInsumos.length === 0 &&(
                    <CommandEmpty>No se encontraron insumos.</CommandEmpty>
                )}
              <CommandGroup>
                {filteredInsumos.map((insumo) => (
                  <CommandItem
                    key={insumo.referencia}
                    onSelect={() => {
                      setSelectedInsumo(insumo);
                      setSearchTerm("");
                    }}
                  >
                    <Check className="mr-2 h-4 w-4 opacity-0" />
                    <span>{insumo.nombre} <span className="text-xs text-muted-foreground">(Ref: {insumo.referencia})</span></span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <p className="font-medium">{selectedInsumo.nombre}</p>
            {!initialInsumo && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedInsumo(null)}>
                <Edit className="h-3 w-3 mr-2" />
                Cambiar
              </Button>
            )}
          </div>
        )}
      </div>

      {selectedInsumo && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in-50">
          <div className="space-y-2">
            <Label htmlFor="cantidadComprada">Cantidad Comprada *</Label>
            <Input
              id="cantidadComprada"
              type="number"
              placeholder="Ej: 50"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              disabled={api.loading}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precioDeCompra">Precio de Compra *</Label>
            <Input
              id="precioDeCompra"
              type="number"
              placeholder="Ej: 12000"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              disabled={api.loading}
            />
          </div>
        </div>
      )}
      
      <div className="pt-4">
        <Button onClick={handleSubmit} disabled={!selectedInsumo || api.loading} className="w-full">
          {api.loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar y Actualizar Stock
        </Button>
      </div>
    </div>
  );
}