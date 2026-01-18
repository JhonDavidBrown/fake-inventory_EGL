"use client";

import {
  useCallback,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
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
import Image from "next/image";
import { useImageWithFallback } from "@/hooks/useImageWithFallback";
import { PLACEHOLDER_IMAGE_URL } from "@/constants/pantalones";

// Custom hooks
import { usePantalonForm } from "../hooks/usePantalonForm";
import { usePantalonEditData } from "../hooks/usePantalonEditData";
import { usePantalonSubmit } from "../hooks/usePantalonSubmit";
import { usePantalonSelectors } from "../hooks/usePantalonSelectors";
import { useSearchTerms } from "../hooks/useSearchTerms";

interface PantalonEditPageSimpleProps {
  referencia: string;
}

export function PantalonEditPageSimpleRefactored({ referencia }: PantalonEditPageSimpleProps) {
  const router = useRouter();
  
  // Data loading hook
  const { pantalon, insumos, manosDeObra, loadingData } = usePantalonEditData(referencia);
  
  // Form management hook
  const form = usePantalonForm();
  
  // Submit hook
  const { loading: submitting, submitPantalon } = usePantalonSubmit({ referencia, pantalon });
  
  // Search terms hook
  const searchTerms = useSearchTerms();
  
  // Selectors and calculations hook
  const selectors = usePantalonSelectors({
    insumos,
    manosDeObra,
    insumosSeleccionados: form.formData.insumosSeleccionados,
    manosDeObraSeleccionadas: form.formData.manosDeObraSeleccionadas,
    insumoSearchTerm: searchTerms.insumoSearchTerm,
    manoObraSearchTerm: searchTerms.manoObraSearchTerm,
  });

  // Update form when pantalon data loads
  useEffect(() => {
    if (pantalon) {
      // Transforma los datos del pantalón para que coincidan con el formato del formulario
      const pantalonParaFormulario = {
        ...pantalon,
        tallas_disponibles: pantalon.tallas_disponibles 
          ? Object.keys(pantalon.tallas_disponibles) 
          : [],
      };
      form.updateFormData(pantalonParaFormulario);
    }
  }, [pantalon]);

  // Helper functions for handlers
  const handleAddInsumoByRef = useCallback((insumoRef: string) => {
    const insumo = selectors.createInsumoFromAPI(insumoRef);
    if (insumo) {
      form.handleAddInsumo(insumo);
      searchTerms.clearInsumoSearch();
    }
  }, [form.handleAddInsumo, selectors.createInsumoFromAPI, searchTerms.clearInsumoSearch]);

  const handleAddManoObraByRef = useCallback((manoObraRef: string) => {
    const manoObra = selectors.createManoObraFromAPI(manoObraRef);
    if (manoObra) {
      form.handleAddManoObra(manoObra);
      searchTerms.clearManoObraSearch();
    }
  }, [form.handleAddManoObra, selectors.createManoObraFromAPI, searchTerms.clearManoObraSearch]);

  const handleSubmit = useCallback(async () => {
    if (!form.validateForm()) return;
    const formData = form.getFormData();
    await submitPantalon(formData);
  }, [form.validateForm, form.getFormData, submitPantalon]);

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
    src: form.formData.imagenPreview || pantalon?.imagen_url || PLACEHOLDER_IMAGE_URL,
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
            {/* Header Card */}
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
                      disabled={submitting}
                      className="min-w-[120px]"
                    >
                      {submitting ? (
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
          
            {/* Basic Info Card */}
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
                      value={form.formData.nombre}
                      onChange={(e) => form.setNombre(e.target.value)}
                      placeholder="Nombre del pantalón"
                      disabled={submitting}
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
                      value={form.formData.cantidad}
                      onChange={(e) => form.setCantidad(parseInt(e.target.value) || 0)}
                      disabled={submitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Precio Unitario</Label>
                    <Input
                      value={`$${new Intl.NumberFormat('es-CO').format(selectors.costoTotal)}`}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tallas Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tallas Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.formData.tallasSeleccionadas.map((talla, index) => (
                      <Badge key={index} variant="secondary" className="text-sm flex items-center gap-1.5 px-3 py-1">
                        {talla}
                        <button
                          type="button"
                          onClick={() => form.handleRemoveTalla(talla)}
                          disabled={submitting}
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
                      const isSelected = form.formData.tallasSeleccionadas.includes(talla);
                      return (
                        <button
                          key={talla}
                          type="button"
                          onClick={() => form.handleToggleTalla(talla)}
                          disabled={submitting}
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

            {/* Image Card */}
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
                    
                    <div className="relative">
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={form.handleFileSelect}
                        disabled={submitting}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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

                    {form.formData.imageFile && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/20 rounded">
                            <ImageIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{form.formData.imageFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(form.formData.imageFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => form.handleRemoveImage(pantalon?.imagen_url)}
                            disabled={submitting}
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
              
              {/* Insumos Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Insumos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Buscar insumos... (mostrando los primeros 10)"
                    value={searchTerms.insumoSearchTerm}
                    onChange={(e) => searchTerms.setInsumoSearchTerm(e.target.value)}
                  />
                  
                  {selectors.filteredInsumos.length > 0 && (
                    <div className="border rounded max-h-48 overflow-y-auto">
                      {selectors.filteredInsumos.map((insumo) => (
                        <button
                          key={insumo.referencia}
                          type="button"
                          onClick={() => handleAddInsumoByRef(insumo.referencia.toString())}
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
                    {form.formData.insumosSeleccionados.map((insumo) => {
                      const insumoDisponible = selectors.getInsumoByRef(insumo.referencia);
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
                                onChange={(e) => form.handleInsumoQuantityChange(insumo.referencia, Number(e.target.value))}
                                className="w-20"
                                disabled={submitting}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => form.handleRemoveInsumo(insumo.referencia)}
                                disabled={submitting}
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
                    
                    {form.formData.insumosSeleccionados.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded">
                        <p>No hay insumos asociados</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Mano de Obra Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Mano de Obra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Buscar procesos..."
                    value={searchTerms.manoObraSearchTerm}
                    onChange={(e) => searchTerms.setManoObraSearchTerm(e.target.value)}
                  />
                  
                  {searchTerms.manoObraSearchTerm && selectors.filteredManoObra.length > 0 && (
                    <div className="border rounded max-h-48 overflow-y-auto">
                      {selectors.filteredManoObra.map((mano) => (
                        <button
                          key={mano.referencia}
                          type="button"
                          onClick={() => handleAddManoObraByRef(mano.referencia.toString())}
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
                    {form.formData.manosDeObraSeleccionadas.map((mano) => (
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
                            onClick={() => form.handleRemoveManoObra(mano.referencia)}
                            disabled={submitting}
                            className="border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-600 hover:text-red-700 dark:hover:text-red-400"
                            aria-label={`Eliminar proceso ${mano.nombre}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {form.formData.manosDeObraSeleccionadas.length === 0 && (
                      <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded">
                        <p>No hay procesos de mano de obra</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary Card */}
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
                      {form.formData.insumosSeleccionados.map((insumo) => (
                        <div key={insumo.referencia} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                          <span className="text-slate-700 dark:text-slate-300">{insumo.nombre} (×{insumo.cantidad_usada})</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">${new Intl.NumberFormat('es-CO').format(insumo.precio_unitario * insumo.cantidad_usada)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-3 border-t border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                        <span>Subtotal:</span>
                        <span>${new Intl.NumberFormat('es-CO').format(
                          form.formData.insumosSeleccionados.reduce((total, insumo) => total + (insumo.precio_unitario * insumo.cantidad_usada), 0)
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
                      {form.formData.manosDeObraSeleccionadas.map((mano) => (
                        <div key={mano.referencia} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-800/50 rounded-md p-2">
                          <span className="text-slate-700 dark:text-slate-300">{mano.nombre}</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">${new Intl.NumberFormat('es-CO').format(mano.precio)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-3 border-t border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                        <span>Subtotal:</span>
                        <span>${new Intl.NumberFormat('es-CO').format(
                          form.formData.manosDeObraSeleccionadas.reduce((total, mano) => total + mano.precio, 0)
                        )}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Total</h4>
                    <div className="text-center border border-primary/30 dark:border-primary/40 rounded p-4 bg-primary/5 dark:bg-primary/10">
                      <div className="text-2xl font-bold text-primary">
                        ${new Intl.NumberFormat('es-CO').format(selectors.costoTotal)}
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
