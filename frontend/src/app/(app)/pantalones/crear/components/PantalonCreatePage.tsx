"use client";

import {
  useState,
  useCallback,
  useEffect,
  memo,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Icons
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// Hooks
import { usePantalonFormEnhanced } from "@/hooks/usePantalonFormEnhanced";
import { validateTallasQuantities } from "@/types/pantalones";

const BasicInfoStepEnhanced = lazy(() =>
  import("./wizard-steps/BasicInfoStepEnhanced").then((m) => ({
    default: m.BasicInfoStepEnhanced,
  }))
);
const ImageStepEnhanced = lazy(() =>
  import("./wizard-steps/ImageStepEnhanced").then((m) => ({
    default: m.ImageStepEnhanced,
  }))
);
const InsumosStepEnhanced = lazy(() =>
  import("./wizard-steps/InsumosStepEnhanced").then((m) => ({
    default: m.InsumosStepEnhanced,
  }))
);
const ManoDeObraStepEnhanced = lazy(() =>
  import("./wizard-steps/ManoDeObraStepEnhanced").then((m) => ({
    default: m.ManoDeObraStepEnhanced,
  }))
);
const ReviewStepEnhanced = lazy(() =>
  import("./wizard-steps/ReviewStepEnhanced").then((m) => ({
    default: m.ReviewStepEnhanced,
  }))
);

// Move outside component to prevent recreation on every render
const STEPS = [
  {
    id: 1,
    title: "Información Básica",
    description: "Nombre, cantidad y tallas del pantalón",
  },
  {
    id: 2,
    title: "Imagen del Producto",
    description: "Sube una foto del pantalón",
  },
  {
    id: 3,
    title: "Seleccionar Insumos",
    description: "Elige los materiales necesarios",
  },
  {
    id: 4,
    title: "Mano de Obra",
    description: "Selecciona los tipos de confección",
  },
  {
    id: 5,
    title: "Revisar y Crear",
    description: "Confirma los detalles del pantalón",
  },
] as const;

export const PantalonCreatePage = memo(function PantalonCreatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const {
    // State
    loading,
    loadingData,
    insumos,
    manosDeObra,
    nombre,
    cantidad,
    tallasSeleccionadas, // Cambiado de talla a tallasSeleccionadas
    tallasConCantidades, // NUEVO: distribución por talla
    insumosSeleccionados,
    manosDeObraSeleccionadas, // Cambiado de manoDeObraSeleccionada a manosDeObraSeleccionadas
    imagenPreview,
    costoTotal,

    // Actions
    setNombre,
    setCantidad,
    setTallasSeleccionadas, // Nueva función para manejar múltiples tallas
    setManosDeObraSeleccionadas, // Nueva función para manejar múltiples manos de obra
    setImagenPreview,
    cargarDatos,
    agregarInsumo,
    removerInsumo,
    actualizarCantidadInsumo,
    manejarCambioImagen,
    distribuirEquitativamente, // NUEVO
    actualizarCantidadTalla, // NUEVO
    validarFormulario,
    crearPantalon,
  } = usePantalonFormEnhanced();

  // Cargar datos cuando se monta el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cambiar el título de la página según el paso actual
  useEffect(() => {
    const stepData = STEPS[currentStep - 1];
    document.title = `${stepData.title} - Crear Pantalón | EGL`;
  }, [currentStep]);

  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1: {
        if (!nombre.trim()) {
          toast.error("El nombre del pantalón es requerido");
          return false;
        }
        const cantidadNum = parseInt(cantidad, 10);
        if (isNaN(cantidadNum) || cantidadNum < 1) {
          toast.error("La cantidad debe ser al menos 1");
          return false;
        }
        if (tallasSeleccionadas.length === 0) {
          toast.error("Debes seleccionar al menos una talla");
          return false;
        }

        // Validar distribución de tallas
        const validacion = validateTallasQuantities(tallasConCantidades, cantidadNum);
        if (!validacion.isValid) {
          if (validacion.difference > 0) {
            toast.error(`La distribución tiene ${validacion.difference} unidades de más. Ajusta las cantidades.`);
          } else {
            toast.error(`La distribución tiene ${Math.abs(validacion.difference)} unidades de menos. Ajusta las cantidades.`);
          }
          return false;
        }

        return true;
      }
      case 2: {
        // La imagen es opcional
        return true;
      }
      case 3: {
        if (insumosSeleccionados.length === 0) {
          toast.error("Debes seleccionar al menos un insumo");
          return false;
        }
        return true;
      }
      case 4: {
        if (manosDeObraSeleccionadas.length === 0) {
          toast.error("Debes seleccionar al menos un tipo de mano de obra");
          return false;
        }
        return true;
      }
      case 5: {
        return validarFormulario();
      }
      default:
        return true;
    }
  }, [
    currentStep,
    nombre,
    cantidad,
    tallasSeleccionadas,
    tallasConCantidades, // NUEVO: necesario para validación
    insumosSeleccionados,
    manosDeObraSeleccionadas,
    validarFormulario,
  ]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCompletedSteps((prev) => [
        ...prev.filter((step) => step !== currentStep),
        currentStep,
      ]);
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (stepNumber: number) => {
      // Solo permitir navegar a pasos completados o el siguiente paso
      if (completedSteps.includes(stepNumber) || stepNumber === currentStep) {
        setCurrentStep(stepNumber);
      }
    },
    [completedSteps, currentStep]
  );

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }

    try {
      // Get the image file if exists
      let imageFile: File | undefined;
      if (imagenPreview) {
        try {
          const response = await fetch(imagenPreview);
          if (!response.ok) throw new Error("Failed to fetch image");
          const blob = await response.blob();
          imageFile = new File([blob], "pantalon.jpg", {
            type: blob.type || "image/jpeg",
          });
        } catch (imageError) {
          console.warn(
            "Failed to process image, continuing without it:",
            imageError
          );
          toast.warning("No se pudo procesar la imagen, continuando sin ella");
        }
      }

      const result = await crearPantalon(imageFile);

      if (result) {
        // Redirect to pantalones list
        router.push("/pantalones");
      }
    } catch (error) {
      console.error("Error creating pantalon:", error);
      toast.error("Error al crear el pantalón. Por favor, intenta nuevamente.");
    }
  }, [validateCurrentStep, crearPantalon, imagenPreview, router]);

  const handleCancel = useCallback(() => {
    router.push("/pantalones");
  }, [router]);

  const progress = useMemo(
    () => (currentStep / STEPS.length) * 100,
    [currentStep]
  );
  const currentStepData = useMemo(() => STEPS[currentStep - 1], [currentStep]);

  const handleImagenRemove = useCallback(() => {
    setImagenPreview(null);
  }, [setImagenPreview]);

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStepEnhanced
            nombre={nombre}
            cantidad={cantidad}
            tallasSeleccionadas={tallasSeleccionadas}
            tallasConCantidades={tallasConCantidades}
            onNombreChange={setNombre}
            onCantidadChange={setCantidad}
            onTallasChange={setTallasSeleccionadas}
            onDistribucionChange={actualizarCantidadTalla}
            onDistribuirEquitativamente={distribuirEquitativamente}
          />
        );
      case 2:
        return (
          <ImageStepEnhanced
            imagenPreview={imagenPreview}
            onImagenChange={manejarCambioImagen}
            onImagenRemove={handleImagenRemove}
          />
        );
      case 3:
        return (
          <InsumosStepEnhanced
            insumos={insumos}
            insumosSeleccionados={insumosSeleccionados}
            loadingData={loadingData}
            onAgregarInsumo={agregarInsumo}
            onRemoverInsumo={removerInsumo}
            onActualizarCantidad={actualizarCantidadInsumo}
          />
        );
      case 4:
        return (
          <ManoDeObraStepEnhanced
            manosDeObra={manosDeObra}
            manosDeObraSeleccionadas={manosDeObraSeleccionadas}
            loadingData={loadingData}
            onSeleccionar={setManosDeObraSeleccionadas}
          />
        );
      case 5:
        return (
          <ReviewStepEnhanced
            nombre={nombre}
            tallasSeleccionadas={tallasSeleccionadas}
            imagenPreview={imagenPreview}
            insumosSeleccionados={insumosSeleccionados}
            manosDeObraSeleccionadas={manosDeObraSeleccionadas}
            costoTotal={costoTotal}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    nombre,
    cantidad,
    tallasSeleccionadas,
    tallasConCantidades, // NUEVO
    setNombre,
    setCantidad,
    setTallasSeleccionadas,
    actualizarCantidadTalla, // NUEVO
    distribuirEquitativamente, // NUEVO
    imagenPreview,
    manejarCambioImagen,
    handleImagenRemove,
    insumos,
    insumosSeleccionados,
    loadingData,
    agregarInsumo,
    removerInsumo,
    actualizarCantidadInsumo,
    manosDeObra,
    manosDeObraSeleccionadas,
    setManosDeObraSeleccionadas,
    costoTotal,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                  {currentStepData.title}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {currentStepData.description}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm font-medium text-muted-foreground">
                  Paso {currentStep} de {STEPS.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(progress)}% completado
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigation - Responsive */}
          <div className="mb-6 sm:mb-8">
            {/* Mobile: Simple dots indicator */}
            <div className="flex sm:hidden justify-center items-center gap-2 py-4">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    step.id === currentStep
                      ? "bg-slate-800 scale-125"
                      : completedSteps.includes(step.id)
                      ? "bg-slate-600"
                      : "bg-slate-300"
                  }`}
                  disabled={
                    !completedSteps.includes(step.id) && step.id !== currentStep
                  }
                  aria-label={`Ir al paso ${step.id}: ${step.title}`}
                />
              ))}
            </div>

            {/* Desktop: Full width */}
            <div className="hidden sm:flex justify-between items-center p-4 bg-card rounded-lg border">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`flex flex-col items-center space-y-2 px-3 py-2 rounded-lg transition-colors ${
                    step.id === currentStep
                      ? "bg-accent text-primary"
                      : completedSteps.includes(step.id)
                      ? "text-primary hover:bg-accent/50"
                      : "text-muted-foreground"
                  }`}
                  disabled={
                    !completedSteps.includes(step.id) && step.id !== currentStep
                  }
                  aria-current={step.id === currentStep ? "step" : undefined}
                  aria-label={`Paso ${step.id}: ${step.title}${
                    completedSteps.includes(step.id) ? " (completado)" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold ${
                      step.id === currentStep
                        ? "bg-slate-800 text-white"
                        : completedSteps.includes(step.id)
                        ? "bg-slate-700 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-sm font-medium text-center">
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">
                    Cargando paso...
                  </span>
                </div>
              }
            >
              {renderStepContent()}
            </Suspense>
          </div>

          {/* Navigation Buttons - Mobile Optimized */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pt-4 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              {/* Mobile: Stack buttons vertically */}
              <div className="flex sm:hidden flex-col gap-3">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      {loading ? "Creando..." : "Crear Pantalón"}
                    </Button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>

              {/* Desktop: Original layout */}
              <div className="hidden sm:flex justify-between items-center w-full">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={handleCancel}>
                    Cancelar
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button
                      onClick={handleNext}
                      className="flex items-center gap-2"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? "Creando..." : "Crear Pantalón"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
