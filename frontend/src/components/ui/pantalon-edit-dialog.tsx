"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
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

import { Badge } from "@/components/ui/badge";
import { Save, X, Package, DollarSign, Upload, Image as ImageIcon, Trash2, Minus } from "lucide-react";
import { PantalonAPIWithPrice } from "@/types/pantalones";

// Interfaces for type safety
interface InsumoAPI {
  referencia: number;
  nombre: string;
  preciounidad: string;
  tipo?: string;
  cantidad?: number;
}

interface ManoObraAPI {
  referencia: number;
  nombre?: string;
  descripcion?: string;
  precio: number;
}
import Image from "next/image";
import { useImageWithFallback } from "@/hooks/useImageWithFallback";
import { PLACEHOLDER_IMAGE_URL } from "@/constants/pantalones";
// Removed unused Select import

interface PantalonEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pantalon: PantalonAPIWithPrice;
  onUpdated: () => void;
}

export function PantalonEditDialog({
  open,
  onOpenChange,
  pantalon,
  onUpdated,
}: PantalonEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: pantalon.nombre,
    cantidad: pantalon.cantidad?.toString() || "",
    imagen_url: pantalon.imagen_url || "",
    tallas_disponibles: Array.isArray(pantalon.tallas_disponibles)
      ? pantalon.tallas_disponibles
      : Object.keys(pantalon.tallas_disponibles || {}),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTalla, setNewTalla] = useState("");
  
  // Estados para insumos y mano de obra
  const [availableInsumos, setAvailableInsumos] = useState<InsumoAPI[]>([]);
  const [availableManoObra, setAvailableManoObra] = useState<ManoObraAPI[]>([]);
  const [selectedInsumos, setSelectedInsumos] = useState<{referencia: number, cantidad_usada: number, nombre?: string}[]>([]);
  const [selectedManoObra, setSelectedManoObra] = useState<{referencia: number, nombre?: string}[]>([]);
  
  // Estados para búsqueda de insumos
  const [insumoSearchTerm, setInsumoSearchTerm] = useState("");
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false);
  const [manoObraSearchTerm, setManoObraSearchTerm] = useState("");
  const [showManoObraDropdown, setShowManoObraDropdown] = useState(false);

  const { getToken } = useAuth();

  // Calcular precio dinámicamente basado en insumos y mano de obra seleccionados
  const calculatedPrice = useMemo(() => {
    const insumosTotal = selectedInsumos.reduce((total, insumo) => {
      const insumoData = availableInsumos.find(i => i.referencia === insumo.referencia);
      if (insumoData) {
        return total + (parseFloat(insumoData.preciounidad) * insumo.cantidad_usada);
      }
      return total;
    }, 0);

    const manoObraTotal = selectedManoObra.reduce((total, mano) => {
      const manoData = availableManoObra.find(m => m.referencia === mano.referencia);
      if (manoData) {
        return total + manoData.precio;
      }
      return total;
    }, 0);

    return insumosTotal + manoObraTotal;
  }, [selectedInsumos, selectedManoObra, availableInsumos, availableManoObra]);

  useEffect(() => {
    if (pantalon) {
      setFormData({
        nombre: pantalon.nombre,
        cantidad: pantalon.cantidad?.toString() || "",
        imagen_url: pantalon.imagen_url || "",
        tallas_disponibles: Array.isArray(pantalon.tallas_disponibles)
          ? pantalon.tallas_disponibles
          : Object.keys(pantalon.tallas_disponibles || {}),
      });
      setImagePreview("");
      setImageFile(null);
      
      // Inicializar insumos y mano de obra seleccionados
      setSelectedInsumos(pantalon.insumos?.map(insumo => ({
        referencia: insumo.referencia,
        cantidad_usada: insumo.PantalonInsumo?.cantidad_usada || 0,
        nombre: insumo.nombre
      })) || []);
      
      setSelectedManoObra(pantalon.procesos?.map(proceso => ({
        referencia: proceso.referencia,
        nombre: (proceso as {descripcion?: string; nombre?: string}).descripcion || (proceso as {descripcion?: string; nombre?: string}).nombre || 'Sin descripción'
      })) || []);
    }
  }, [pantalon]);

  const loadAvailableData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Cargar insumos disponibles
      const insumosResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/insumos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (insumosResponse.ok) {
        const insumosData = await insumosResponse.json();
        setAvailableInsumos(insumosData);
      }

      // Cargar mano de obra disponible
      const manoObraResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manos-de-obra`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (manoObraResponse.ok) {
        const manoObraData = await manoObraResponse.json();
        setAvailableManoObra(manoObraData);
      }
    } catch (error) {
      console.error("Error loading available data:", error);
    }
  }, [getToken]);

  // Cargar datos disponibles al abrir el modal
  useEffect(() => {
    if (open) {
      loadAvailableData();
    }
  }, [open, loadAvailableData]);

  const imageWithFallback = useImageWithFallback({
    src: imagePreview || formData.imagen_url || PLACEHOLDER_IMAGE_URL,
    fallback: PLACEHOLDER_IMAGE_URL,
    alt: `${pantalon.nombre} - Referencia ${pantalon.referencia}`,
  });

  // Solo extraer las props que necesita el componente Image
  const imageProps = {
    src: imageWithFallback.src,
    alt: imageWithFallback.alt,
    onError: imageWithFallback.onError,
    onLoad: imageWithFallback.onLoad,
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error uploading image: ${response.status}`);
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten archivos de imagen");
        return;
      }

      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleAddTalla = () => {
    const tallaNumber = Number(newTalla.trim());
    if (!isNaN(tallaNumber) && tallaNumber > 0 && !formData.tallas_disponibles.includes(newTalla.trim())) {
      handleInputChange("tallas_disponibles", [...formData.tallas_disponibles, newTalla.trim()]);
      setNewTalla("");
    }
  };

  const handleRemoveTalla = (talla: string) => {
    handleInputChange("tallas_disponibles", formData.tallas_disponibles.filter(t => t !== talla));
  };

  // Funciones para filtrado de insumos - OPTIMIZADO
  const filteredInsumos = useMemo(() => {
    if (!insumoSearchTerm) return [];
    
    return availableInsumos.filter(insumo => {
      // Validación eficiente
      if (!insumo?.referencia || !insumo?.nombre) return false;
      
      // Verificar si ya está seleccionado
      if (selectedInsumos.some(s => s.referencia === insumo.referencia)) return false;
      
      const searchTerm = insumoSearchTerm.toLowerCase();
      
      // Búsqueda optimizada
      return (
        String(insumo.referencia).toLowerCase().includes(searchTerm) ||
        String(insumo.nombre).toLowerCase().includes(searchTerm) ||
        (insumo.tipo && String(insumo.tipo).toLowerCase().includes(searchTerm))
      );
    });
  }, [availableInsumos, insumoSearchTerm, selectedInsumos]);

  // Filtrado de mano de obra - OPTIMIZADO
  const filteredManoObra = useMemo(() => {
    if (!manoObraSearchTerm) return [];
    
    return availableManoObra.filter(mano => {
      // Validación eficiente
      if (!mano?.referencia) return false;
      
      // Verificar si ya está seleccionado
      if (selectedManoObra.some(s => s.referencia === mano.referencia)) return false;
      
      const searchTerm = manoObraSearchTerm.toLowerCase();
      
      // Búsqueda optimizada
      return (
        String(mano.referencia).toLowerCase().includes(searchTerm) ||
        String(mano.descripcion || mano.nombre || '').toLowerCase().includes(searchTerm)
      );
    });
  }, [availableManoObra, manoObraSearchTerm, selectedManoObra]);

  // Funciones para manejo de insumos
  const handleAddInsumo = (insumoRef: number) => {
    const insumo = availableInsumos.find(i => i && i.referencia === insumoRef);
    if (insumo && !selectedInsumos.find(i => i.referencia === insumoRef)) {
      setSelectedInsumos([...selectedInsumos, {
        referencia: insumoRef,
        cantidad_usada: 1,
        nombre: insumo.nombre || 'Sin nombre'
      }]);
      setInsumoSearchTerm("");
      setShowInsumoDropdown(false);
    }
  };

  const handleRemoveInsumo = (referencia: number) => {
    setSelectedInsumos(selectedInsumos.filter(i => i.referencia !== referencia));
  };

  const handleInsumoQuantityChange = (referencia: number, cantidad: number) => {
    setSelectedInsumos(selectedInsumos.map(insumo => 
      insumo.referencia === referencia 
        ? { ...insumo, cantidad_usada: cantidad }
        : insumo
    ));
  };

  // Funciones para manejo de mano de obra
  const handleAddManoObra = (manoObraRef: number) => {
    const manoObra = availableManoObra.find(m => m && m.referencia === manoObraRef);
    if (manoObra && !selectedManoObra.find(m => m.referencia === manoObraRef)) {
      setSelectedManoObra([...selectedManoObra, {
        referencia: manoObraRef,
        nombre: manoObra.descripcion || manoObra.nombre || 'Sin descripción'
      }]);
      setManoObraSearchTerm("");
      setShowManoObraDropdown(false);
    }
  };

  const handleRemoveManoObra = (referencia: number) => {
    setSelectedManoObra(selectedManoObra.filter(m => m.referencia !== referencia));
  };

  const handleUpdate = async () => {
    if (!formData.nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    if (!formData.cantidad || isNaN(Number(formData.cantidad))) {
      toast.error("La cantidad debe ser un número válido");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      let imageUrl = formData.imagen_url;
      
      // Upload new image if selected
      if (imageFile) {
        try {
          imageUrl = await handleImageUpload(imageFile);
        } catch (error) {
          toast.error("Error al subir la imagen");
          throw error;
        }
      }

      const updateData = {
        nombre: formData.nombre.trim(),
        cantidad: Number(formData.cantidad),
        imagen_url: imageUrl,
        tallas_disponibles: formData.tallas_disponibles,
        // Usar datos editados de relaciones
        insumos: selectedInsumos.map(insumo => ({
          insumo_referencia: insumo.referencia,
          cantidad_requerida: insumo.cantidad_usada
        })),
        manos_de_obra: selectedManoObra.map(manoObra => ({
          mano_de_obra_referencia: manoObra.referencia
        }))
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pantalones/${pantalon.referencia}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${response.status}: ${response.statusText}`
        );
      }

      toast.success("Pantalón actualizado exitosamente");
      onUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating pantalon:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el pantalón"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: pantalon.nombre,
      cantidad: pantalon.cantidad?.toString() || "",
      imagen_url: pantalon.imagen_url || "",
      tallas_disponibles: Array.isArray(pantalon.tallas_disponibles)
        ? pantalon.tallas_disponibles
        : Object.keys(pantalon.tallas_disponibles || {}),
    });
    setImageFile(null);
    setImagePreview("");
    setNewTalla("");
    
    // Reset insumos y mano de obra
    setSelectedInsumos(pantalon.insumos?.map(insumo => ({
      referencia: insumo.referencia,
      cantidad_usada: insumo.PantalonInsumo?.cantidad_usada || 0,
      nombre: insumo.nombre
    })) || []);
    
    setSelectedManoObra(pantalon.procesos?.map(proceso => ({
      referencia: proceso.referencia,
      nombre: (proceso as {descripcion?: string; nombre?: string}).descripcion || (proceso as {descripcion?: string; nombre?: string}).nombre || 'Sin descripción'
    })) || []);
    
    // Reset search terms
    setInsumoSearchTerm("");
    setManoObraSearchTerm("");
    setShowInsumoDropdown(false);
    setShowManoObraDropdown(false);
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Editar Pantalón
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del pantalón. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagen del pantalón */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Imagen del pantalón
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative w-full h-48 border border-dashed border-muted-foreground/25 rounded-lg overflow-hidden bg-muted/10">
                  <Image
                    src={imageProps.src}
                    alt={imageProps.alt}
                    onError={imageProps.onError}
                    onLoad={imageProps.onLoad}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm">Subiendo imagen...</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Cambiar imagen
                  </Label>
                  
                  {/* Drop zone estilizada */}
                  <div className="relative">
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={loading || uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors bg-muted/5 hover:bg-muted/10">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Haz clic o arrastra una imagen
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP hasta 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {imageFile && (
                  <div className="bg-muted/20 rounded-lg p-3 border">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{imageFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        disabled={loading || uploadingImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referencia" className="text-sm font-medium">
                Referencia
              </Label>
              <Input
                id="referencia"
                value={pantalon.referencia}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                La referencia no se puede modificar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Nombre del pantalón"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad" className="text-sm font-medium">
                Cantidad en Stock *
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="0"
                value={formData.cantidad}
                onChange={(e) => handleInputChange("cantidad", e.target.value)}
                placeholder="0"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Precio Individual (Calculado automáticamente)
              </Label>
              <Input
                value={`$${new Intl.NumberFormat('es-CO').format(calculatedPrice)}`}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                El precio se calcula automáticamente basado en insumos y mano de obra
              </p>
            </div>
          </div>

          {/* Gestión de tallas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tallas disponibles</Label>
            
            <div className="flex flex-wrap gap-2">
              {formData.tallas_disponibles.map((talla, index) => (
                <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                  {talla}
                  <button
                    type="button"
                    onClick={() => handleRemoveTalla(talla)}
                    disabled={loading}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="100"
                value={newTalla}
                onChange={(e) => setNewTalla(e.target.value)}
                placeholder="Nueva talla (ej: 28, 30, 32, 34...)"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTalla();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTalla}
                disabled={loading || !newTalla.trim() || isNaN(Number(newTalla)) || Number(newTalla) <= 0}
                size="sm"
              >
                Agregar
              </Button>
            </div>
          </div>

          {/* Gestión de insumos */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Insumos asociados</Label>
              
              {/* Buscador de insumos */}
              <div className="relative">
                <Input
                  placeholder="Buscar insumos por referencia, nombre o tipo..."
                  value={insumoSearchTerm}
                  onChange={(e) => {
                    setInsumoSearchTerm(e.target.value);
                    setShowInsumoDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowInsumoDropdown(insumoSearchTerm.length > 0)}
                  className="pr-10"
                />
                
                {/* Dropdown de resultados */}
                {showInsumoDropdown && insumoSearchTerm.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredInsumos.length > 0 ? (
                      filteredInsumos.map((insumo) => (
                        <button
                          key={insumo.referencia}
                          type="button"
                          onClick={() => handleAddInsumo(insumo.referencia)}
                          className="w-full px-3 py-2 text-left hover:bg-muted/50 focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                        >
                          <div className="font-medium text-sm">{insumo.nombre || 'Sin nombre'}</div>
                          <div className="text-xs text-muted-foreground">
                            Ref: {insumo.referencia || 'N/A'} • Tipo: {insumo.tipo || 'N/A'} • Stock: {insumo.cantidad || 0}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No se encontraron insumos
                      </div>
                    )}
                  </div>
                )}
                
                {/* Click outside handler */}
                {showInsumoDropdown && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowInsumoDropdown(false)}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              {selectedInsumos.map((insumo) => (
                <div key={insumo.referencia} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{insumo.nombre}</div>
                    <div className="text-xs text-muted-foreground">Ref: {insumo.referencia}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Cantidad:</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={insumo.cantidad_usada}
                      onChange={(e) => handleInsumoQuantityChange(insumo.referencia, Number(e.target.value))}
                      className="w-20"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveInsumo(insumo.referencia)}
                    disabled={loading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {selectedInsumos.length === 0 && (
                <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-lg">
                  No hay insumos asociados
                </div>
              )}
            </div>
          </div>

          {/* Gestión de mano de obra */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mano de obra asociada</Label>
              
              {/* Buscador de mano de obra */}
              <div className="relative">
                <Input
                  placeholder="Buscar procesos por referencia o descripción..."
                  value={manoObraSearchTerm}
                  onChange={(e) => {
                    setManoObraSearchTerm(e.target.value);
                    setShowManoObraDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowManoObraDropdown(manoObraSearchTerm.length > 0)}
                  className="pr-10"
                />
                
                {/* Dropdown de resultados */}
                {showManoObraDropdown && manoObraSearchTerm.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredManoObra.length > 0 ? (
                      filteredManoObra.map((mano) => (
                        <button
                          key={mano.referencia}
                          type="button"
                          onClick={() => handleAddManoObra(mano.referencia)}
                          className="w-full px-3 py-2 text-left hover:bg-muted/50 focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                        >
                          <div className="font-medium text-sm">{mano.descripcion || mano.nombre || 'Sin descripción'}</div>
                          <div className="text-xs text-muted-foreground">
                            Ref: {mano.referencia || 'N/A'} • Precio: ${new Intl.NumberFormat('es-CO').format(mano.precio || 0)}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No se encontraron procesos
                      </div>
                    )}
                  </div>
                )}
                
                {/* Click outside handler */}
                {showManoObraDropdown && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowManoObraDropdown(false)}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              {selectedManoObra.map((mano) => (
                <div key={mano.referencia} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{mano.nombre}</div>
                    <div className="text-xs text-muted-foreground">Ref: {mano.referencia}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveManoObra(mano.referencia)}
                    disabled={loading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {selectedManoObra.length === 0 && (
                <div className="text-center p-4 text-muted-foreground text-sm border border-dashed rounded-lg">
                  No hay procesos de mano de obra asociados
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading || uploadingImage}
            className="min-w-[120px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Guardando...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}