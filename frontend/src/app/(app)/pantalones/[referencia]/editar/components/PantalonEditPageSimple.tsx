"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Save,
  DollarSign,
  Package,
  Loader2,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Hash,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { PantalonAPIWithPrice } from "@/types/pantalones";
import Image from "next/image";
import { useImageWithFallback } from "@/hooks/useImageWithFallback";
import { PLACEHOLDER_IMAGE_URL } from "@/constants/pantalones";

interface InsumoSeleccionado {
  referencia: string;
  nombre: string;
  cantidad_usada: number;
  precio_unitario: number;
}

interface ManoDeObraSeleccionada {
  referencia: string;
  nombre: string;
  precio: number;
}

interface PantalonEditPageSimpleProps {
  referencia: string;
}

export function PantalonEditPageSimple({ referencia }: PantalonEditPageSimpleProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Pantalon data
  const [pantalon, setPantalon] = useState<PantalonAPIWithPrice | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>([]);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([]);
  const [manosDeObraSeleccionadas, setManosDeObraSeleccionadas] = useState<ManoDeObraSeleccionada[]>([]);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  interface InsumoAPI {
    referencia: number;
    nombre: string;
    tipo: string;
    preciounidad: string;
    cantidad: number;
  }

  interface ManoObraAPI {
    referencia: number;
    nombre: string;
    descripcion?: string;
    precio: number;
  }

  const [insumos, setInsumos] = useState<InsumoAPI[]>([]);
  const [manosDeObra, setManosDeObra] = useState<ManoObraAPI[]>([]);
  const [insumoSearchTerm, setInsumoSearchTerm] = useState("");
  const [manoObraSearchTerm, setManoObraSearchTerm] = useState("");

  const loadPantalonData = useCallback(async () => {
    try {
      setLoadingData(true);
      const token = await getToken();
      if (!token) {
        toast.error("No se pudo obtener el token de autenticación");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pantalones/${referencia}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar los datos del pantalón");
      }

      const data = await response.json();
      setPantalon(data);

      setNombre(data.nombre);
      setCantidad(parseInt(data.cantidad) || 1);
      setTallasSeleccionadas(data.tallas_disponibles || []);
      setImagenPreview(data.imagen_url || null);

      const insumosFormateados = data.insumos?.map((insumo: { referencia: number; nombre: string; preciounidad: string; PantalonInsumo?: { cantidad_usada: number } }) => ({
        referencia: insumo.referencia.toString(),
        nombre: insumo.nombre,
        cantidad_usada: insumo.PantalonInsumo?.cantidad_usada || 0,
        precio_unitario: parseFloat(insumo.preciounidad) || 0,
      })) || [];
      setInsumosSeleccionados(insumosFormateados);

      const manosFormateadas = data.procesos?.map((proceso: { referencia: number; nombre: string; precio: number }) => ({
        referencia: proceso.referencia.toString(),
        nombre: proceso.nombre,
        precio: proceso.precio || 0,
      })) || [];
      setManosDeObraSeleccionadas(manosFormateadas);

    } catch (error) {
      console.error("Error loading pantalon:", error);
      toast.error("Error al cargar los datos del pantalón");
      router.push("/pantalones");
    } finally {
      setLoadingData(false);
    }
  }, [referencia, getToken, router]);

  const loadAvailableData = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

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
        setInsumos(insumosData as InsumoAPI[]);
      }

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
        setManosDeObra(manoObraData as ManoObraAPI[]);
      }
    } catch (error) {
      console.error("Error loading available data:", error);
      toast.error("Error al cargar los datos disponibles");
    }
  }, [getToken]);

  useEffect(() => {
    loadPantalonData();
    loadAvailableData();
  }, [loadPantalonData, loadAvailableData]);

  const costoTotal = useMemo(() => {
    const costoInsumos = insumosSeleccionados.reduce(
      (total, insumo) => total + (insumo.precio_unitario * insumo.cantidad_usada),
      0
    );
    const costoManoObra = manosDeObraSeleccionadas.reduce(
      (total, mano) => total + mano.precio,
      0
    );
    return costoInsumos + costoManoObra;
  }, [insumosSeleccionados, manosDeObraSeleccionadas]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten archivos de imagen");
        return;
      }

      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagenPreview(preview);
    }
  };

  const handleRemoveTalla = (talla: string) => {
    setTallasSeleccionadas(tallasSeleccionadas.filter(t => t !== talla));
  };

  const filteredInsumos = useMemo(() => {
    const availableInsumos = insumos.filter(insumo => {
      if (!insumo?.referencia || !insumo?.nombre) return false;
      return !insumosSeleccionados.some(s => s.referencia === insumo.referencia.toString());
    });

    if (!insumoSearchTerm) {
      return availableInsumos.slice(0, 10);
    }
    
    const searchTerm = insumoSearchTerm.toLowerCase();
    return availableInsumos.filter(insumo => 
      String(insumo.referencia).toLowerCase().includes(searchTerm) ||
      String(insumo.nombre).toLowerCase().includes(searchTerm) ||
      (insumo.tipo && String(insumo.tipo).toLowerCase().includes(searchTerm))
    );
  }, [insumos, insumoSearchTerm, insumosSeleccionados]);

  const handleAddInsumo = (insumoRef: string) => {
    const insumo = insumos.find(i => i && i.referencia.toString() === insumoRef);
    if (insumo && !insumosSeleccionados.find(i => i.referencia === insumoRef)) {
      setInsumosSeleccionados([...insumosSeleccionados, {
        referencia: insumoRef,
        cantidad_usada: 1,
        nombre: insumo.nombre || 'Sin nombre',
        precio_unitario: parseFloat(insumo.preciounidad) || 0,
      }]);
      setInsumoSearchTerm("");
    }
  };

  const handleRemoveInsumo = (referencia: string) => {
    setInsumosSeleccionados(insumosSeleccionados.filter(i => i.referencia !== referencia));
  };

  const handleInsumoQuantityChange = (referencia: string, cantidad: number) => {
    setInsumosSeleccionados(insumosSeleccionados.map(insumo => 
      insumo.referencia === referencia 
        ? { ...insumo, cantidad_usada: cantidad }
        : insumo
    ));
  };

  const filteredManoObra = useMemo(() => {
    const availableManoObra = manosDeObra.filter(mano => {
      if (!mano?.referencia) return false;
      return !manosDeObraSeleccionadas.some(s => s.referencia === mano.referencia.toString());
    });

    if (!manoObraSearchTerm) {
      // Mostrar los primeros 10 procesos disponibles por defecto
      return availableManoObra.slice(0, 10);
    }
    
    const searchTerm = manoObraSearchTerm.toLowerCase();
    return availableManoObra.filter(mano => 
      String(mano.referencia).toLowerCase().includes(searchTerm) ||
      String(mano.descripcion || mano.nombre || '').toLowerCase().includes(searchTerm)
    );
  }, [manosDeObra, manoObraSearchTerm, manosDeObraSeleccionadas]);

  const handleAddManoObra = (manoObraRef: string) => {
    const manoObra = manosDeObra.find(m => m && m.referencia.toString() === manoObraRef);
    if (manoObra && !manosDeObraSeleccionadas.find(m => m.referencia === manoObraRef)) {
      setManosDeObraSeleccionadas([...manosDeObraSeleccionadas, {
        referencia: manoObraRef,
        nombre: manoObra.descripcion || manoObra.nombre || 'Sin descripción',
        precio: manoObra.precio || 0,
      }]);
      setManoObraSearchTerm("");
    }
  };

  const handleRemoveManoObra = (referencia: string) => {
    setManosDeObraSeleccionadas(manosDeObraSeleccionadas.filter(m => m.referencia !== referencia));
  };

  const validateForm = useCallback(() => {
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }

    if (tallasSeleccionadas.length === 0) {
      toast.error("Debe seleccionar al menos una talla");
      return false;
    }

    if (insumosSeleccionados.length === 0) {
      toast.error("Debe seleccionar al menos un insumo");
      return false;
    }

    if (manosDeObraSeleccionadas.length === 0) {
      toast.error("Debe seleccionar al menos un proceso de mano de obra");
      return false;
    }

    return true;
  }, [nombre, tallasSeleccionadas, insumosSeleccionados, manosDeObraSeleccionadas]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !pantalon) {
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      let imageUrl = pantalon.imagen_url;

      if (imageFile) {
        try {
          const formData = new FormData();
          formData.append("image", imageFile);

          const uploadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/uploads/image`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            imageUrl = uploadData.imageUrl;
          }
        } catch (imageError) {
          console.warn("Failed to upload image:", imageError);
          toast.warning("No se pudo subir la nueva imagen, se mantendrá la anterior");
        }
      }

      const updateData = {
        nombre: nombre.trim(),
        cantidad: cantidad,
        imagen_url: imageUrl,
        tallas_disponibles: tallasSeleccionadas,
        insumos: insumosSeleccionados.map(insumo => ({
          insumo_referencia: insumo.referencia,
          cantidad_requerida: insumo.cantidad_usada
        })),
        manos_de_obra: manosDeObraSeleccionadas.map(manoObra => ({
          mano_de_obra_referencia: manoObra.referencia
        }))
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pantalones/${referencia}`,
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
      router.push("/pantalones");
    } catch (error) {
      console.error("Error updating pantalon:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el pantalón"
      );
    } finally {
      setLoading(false);
    }
  }, [validateForm, pantalon, getToken, imageFile, nombre, cantidad, tallasSeleccionadas, insumosSeleccionados, manosDeObraSeleccionadas, referencia, router]);

  const handleCancel = () => {
    router.push("/pantalones");
  };

  const formatDateDetailed = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const imageProps = useImageWithFallback({
    src: imagenPreview || pantalon?.imagen_url || PLACEHOLDER_IMAGE_URL,
    fallback: PLACEHOLDER_IMAGE_URL,
    alt: `${pantalon?.nombre || 'Pantalón'} - Referencia ${referencia}`,
  });

  if (loadingData || !pantalon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg text-muted-foreground">Cargando datos del pantalón...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold">
                      {pantalon.nombre}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        <span>Referencia: {pantalon.referencia}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Creado: {formatDateDetailed(pantalon.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="min-w-[120px]"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referencia">Referencia</Label>
                  <Input
                    id="referencia"
                    value={pantalon.referencia}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre del pantalón"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad en Stock</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    min="0"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Precio Unitario</Label>
                  <Input
                    value={`$${new Intl.NumberFormat('es-CO').format(costoTotal)}`}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tallas Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {tallasSeleccionadas.map((talla, index) => (
                    <Badge key={index} variant="secondary" className="text-sm flex items-center gap-1.5 px-3 py-1">
                      {talla}
                      <button
                        type="button"
                        onClick={() => handleRemoveTalla(talla)}
                        disabled={loading}
                        className="ml-1 hover:bg-destructive/20 hover:text-destructive rounded-full p-0.5"
                        aria-label={`Eliminar talla ${talla}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {['28', '30', '32', '34', '36', '38', '40'].map((talla) => {
                    const isSelected = tallasSeleccionadas.includes(talla);
                    return (
                      <button
                        key={talla}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveTalla(talla);
                          } else {
                            setTallasSeleccionadas([...tallasSeleccionadas, talla]);
                          }
                        }}
                        disabled={loading}
                        className={`px-3 py-2 rounded border ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background hover:bg-muted border-border'
                        }`}
                        aria-label={`${isSelected ? 'Deseleccionar' : 'Seleccionar'} talla ${talla}`}
                      >
                        {talla}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imagen del Pantalón</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col xl:flex-row gap-10">
                <div className="flex-shrink-0 w-full max-w-sm mx-auto xl:mx-0 xl:w-96">
                  <div className="w-full aspect-square mx-auto border-2 border-dashed border-muted-foreground/20 rounded-lg overflow-hidden bg-muted/10">
                    <Image
                      src={imageProps.src}
                      alt={imageProps.alt}
                      onError={imageProps.onError}
                      onLoad={imageProps.onLoad}
                      width={384}
                      height={384}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="image-upload" className="text-sm font-medium">
                      Cambiar imagen
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Formatos soportados: PNG, JPG, WebP (máximo 5MB)
                    </p>
                  </div>
                  
                  {/* === INICIO DE LA SECCIÓN CORREGIDA === */}
                  <div className="relative">
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={loading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      // MODIFICADO: Se añade el aria-label
                      aria-label="Subir una nueva imagen para el pantalón"
                    />
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors bg-muted/5 hover:bg-muted/10 cursor-pointer">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Haz clic aquí para seleccionar una imagen
                          </p>
                          <p className="text-sm text-muted-foreground">
                            o arrastra y suelta un archivo
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* === FIN DE LA SECCIÓN CORREGIDA === */}

                  {imageFile && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded">
                          <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{imageFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setImageFile(null);
                            setImagenPreview(pantalon?.imagen_url || null);
                          }}
                          disabled={loading}
                          className="hover:bg-destructive/20 hover:text-destructive"
                          aria-label="Quitar imagen seleccionada"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <Card>
              <CardHeader>
                <CardTitle>Insumos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Buscar insumos... (mostrando los primeros 10)"
                  value={insumoSearchTerm}
                  onChange={(e) => setInsumoSearchTerm(e.target.value)}
                />
                
                {filteredInsumos.length > 0 && (
                  <div className="border rounded max-h-48 overflow-y-auto">
                    {filteredInsumos.map((insumo) => (
                      <button
                        key={insumo.referencia}
                        type="button"
                        onClick={() => handleAddInsumo(insumo.referencia.toString())}
                        className="w-full px-4 py-3 text-left hover:bg-muted border-b last:border-b-0"
                      >
                        <div className="font-medium">{insumo.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          Ref: {insumo.referencia} • <span className="text-slate-700 dark:text-slate-300 font-medium">${new Intl.NumberFormat('es-CO').format(parseFloat(insumo.preciounidad) || 0)}</span> • <span className="text-slate-600 dark:text-slate-400">Stock: {insumo.cantidad || 0}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {insumosSeleccionados.map((insumo) => {
                    const insumoDisponible = insumos.find(i => i.referencia.toString() === insumo.referencia);
                    const stockDisponible = insumoDisponible?.cantidad || 0;
                    
                    return (
                      <div key={insumo.referencia} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{insumo.nombre}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Ref: {insumo.referencia} • <span className="text-slate-800 dark:text-slate-200 font-semibold">${new Intl.NumberFormat('es-CO').format(insumo.precio_unitario)}</span> • <span className={`font-medium ${stockDisponible >= insumo.cantidad_usada ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>Stock: {stockDisponible}</span>
                            </div>
                            {stockDisponible < insumo.cantidad_usada && (
                              <Badge variant="destructive" className="text-xs mt-2">Stock insuficiente</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={insumo.cantidad_usada}
                              onChange={(e) => handleInsumoQuantityChange(insumo.referencia, Number(e.target.value))}
                              className="w-20"
                              disabled={loading}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveInsumo(insumo.referencia)}
                              disabled={loading}
                              className="border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-400"
                              aria-label={`Eliminar insumo ${insumo.nombre}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {insumosSeleccionados.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded">
                      <p>No hay insumos asociados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mano de Obra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Buscar procesos... (mostrando los primeros 10)"
                  value={manoObraSearchTerm}
                  onChange={(e) => setManoObraSearchTerm(e.target.value)}
                />
                
                {filteredManoObra.length > 0 && (
                  <div className="border rounded max-h-48 overflow-y-auto">
                    {filteredManoObra.map((mano) => (
                      <button
                        key={mano.referencia}
                        type="button"
                        onClick={() => handleAddManoObra(mano.referencia.toString())}
                        className="w-full px-4 py-3 text-left hover:bg-muted border-b last:border-b-0"
                      >
                        <div className="font-medium">{mano.descripcion || mano.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          Ref: {mano.referencia} • <span className="text-slate-700 dark:text-slate-300 font-medium">${new Intl.NumberFormat('es-CO').format(mano.precio || 0)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {manosDeObraSeleccionadas.map((mano) => (
                    <div key={mano.referencia} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50/30 dark:bg-slate-800/20 hover:bg-slate-100/40 dark:hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{mano.nombre}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Ref: {mano.referencia}</div>
                        </div>
                        <div className="font-bold text-lg text-slate-800 dark:text-slate-200">
                          ${new Intl.NumberFormat('es-CO').format(mano.precio)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveManoObra(mano.referencia)}
                          disabled={loading}
                          className="border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-400"
                          aria-label={`Eliminar proceso ${mano.nombre}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {manosDeObraSeleccionadas.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded">
                      <p>No hay procesos de mano de obra</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Insumos
                  </h4>
                  <div className="space-y-2">
                    {insumosSeleccionados.map((insumo) => (
                      <div key={insumo.referencia} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                        <span className="text-slate-700 dark:text-slate-300">{insumo.nombre} (×{insumo.cantidad_usada})</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">${new Intl.NumberFormat('es-CO').format(insumo.precio_unitario * insumo.cantidad_usada)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-3 border-t border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                      <span>Subtotal:</span>
                      <span>${new Intl.NumberFormat('es-CO').format(
                        insumosSeleccionados.reduce((total, insumo) => total + (insumo.precio_unitario * insumo.cantidad_usada), 0)
                      )}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Mano de Obra
                  </h4>
                  <div className="space-y-2">
                    {manosDeObraSeleccionadas.map((mano) => (
                      <div key={mano.referencia} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                        <span className="text-slate-700 dark:text-slate-300">{mano.nombre}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">${new Intl.NumberFormat('es-CO').format(mano.precio)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-3 border-t border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                      <span>Subtotal:</span>
                      <span>${new Intl.NumberFormat('es-CO').format(
                        manosDeObraSeleccionadas.reduce((total, mano) => total + mano.precio, 0)
                      )}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-primary">Total</h4>
                  <div className="text-center border border-primary/30 dark:border-primary/40 rounded p-4 bg-primary/5 dark:bg-primary/10">
                    <div className="text-2xl font-bold text-primary">
                      ${new Intl.NumberFormat('es-CO').format(costoTotal)}
                    </div>
                    <div className="text-sm text-primary/70">
                      Precio unitario total
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>
    </div>
  );
}