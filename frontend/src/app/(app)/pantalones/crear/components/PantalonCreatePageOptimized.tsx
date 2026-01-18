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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  usePantalonFormEnhanced,
} from "@/hooks/usePantalonFormEnhanced";
import {
  FORM_STEPS,
  VALIDATION_MESSAGES,
} from "@/constants/pantalon-form";
import { PantalonFormErrorBoundary } from "@/components/PantalonFormErrorBoundary";

// Lazy load wizard steps for better performance - preload next step
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

// Loading fallback component - memoized for performance
const StepLoadingFallback = memo(function StepLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Cargando paso...</span>
    </div>
  );
});

// Step navigation button component - extracted for better performance
const StepNavigationButton = memo(function StepNavigationButton({
  step,
  currentStep,
  completedSteps,
  onStepClick,
}: {
  step: { id: number; title: string };
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepNumber: number) => void;
}) {
  const isCurrentStep = step.id === currentStep;
  const isCompleted = completedSteps.includes(step.id);
  const isDisabled = !isCompleted && step.id !== currentStep;

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onStepClick(step.id);
    }
  }, [isDisabled, onStepClick, step.id]);

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center space-y-2 px-3 py-2 rounded-lg transition-colors ${
        isCurrentStep
          ? "bg-accent text-primary"
          : isCompleted
          ? "text-primary hover:bg-accent/50"
          : "text-muted-foreground"
      }`}
      disabled={isDisabled}
      aria-current={isCurrentStep ? "step" : undefined}
      aria-label={`Paso ${step.id}: ${step.title}${
        isCompleted ? " (completado)" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold ${
          isCurrentStep
            ? "bg-slate-800 text-white"
            : isCompleted
            ? "bg-slate-700 text-white"
            : "bg-slate-200 text-slate-600"
        }`}
      >
        {step.id}
      </div>
      <span className="text-sm font-medium text-center">{step.title}</span>
    </button>
  );
});

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
    tallasSeleccionadas,
    insumosSeleccionados,
    manosDeObraSeleccionadas,
    imagenPreview,
    costoTotal,

    tallasConCantidades,
    setTallasConCantidades,
    distribuirEquitativamente,
    actualizarCantidadTalla,
    // Actions
    setNombre,
    setCantidad,
    setTallasSeleccionadas,
    setManosDeObraSeleccionadas,
    setImagenPreview,
    cargarDatos,
    agregarInsumo,
    removerInsumo,
    actualizarCantidadInsumo,
    manejarCambioImagen,
    validarFormulario,
    crearPantalon,
  } = usePantalonFormEnhanced();

  // Load data when component mounts - only once
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Update page title based on current step
  useEffect(() => {
    const stepData = FORM_STEPS[currentStep - 1];
    if (stepData) {
      document.title = `${stepData.title} - Crear Pantalón | EGL`;
    }
  }, [currentStep]);

  // Memoized validation function for current step
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        if (!nombre.trim()) {
          toast.error(VALIDATION_MESSAGES.NOMBRE_REQUERIDO);
          return false;
        }
        if (tallasSeleccionadas.length === 0) {
          toast.error(VALIDATION_MESSAGES.TALLAS_REQUERIDAS);
          return false;
        }
        return true;

      case 2:
        // Image is optional
        return true;

      case 3:
        if (insumosSeleccionados.length === 0) {
          toast.error(VALIDATION_MESSAGES.INSUMOS_REQUERIDOS);
          return false;
        }
        return true;

      case 4:
        if (manosDeObraSeleccionadas.length === 0) {
          toast.error(VALIDATION_MESSAGES.MANO_OBRA_REQUERIDA);
          return false;
        }
        return true;

      case 5:
        return validarFormulario();

      default:
        return true;
    }
  }, [
    currentStep,
    nombre,
    tallasSeleccionadas,
    insumosSeleccionados,
    manosDeObraSeleccionadas,
    validarFormulario,
  ]);

  // Navigation handlers - memoized to prevent unnecessary re-renders
  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCompletedSteps((prev) => {
        const newCompleted = prev.filter((step) => step !== currentStep);
        return [...newCompleted, currentStep];
      });
      if (currentStep < FORM_STEPS.length) {
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
      // Only allow navigation to completed steps or current step
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
      // Get the image file if exists - more efficient handling
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

  // Memoized computed values
  const progress = useMemo(
    () => (currentStep / FORM_STEPS.length) * 100,
    [currentStep]
  );

  const currentStepData = useMemo(
    () => FORM_STEPS[currentStep - 1],
    [currentStep]
  );

  const handleImagenRemove = useCallback(() => {
    setImagenPreview(null);
  }, [setImagenPreview]);

  // Memoized step content renderer - split by step for better performance
  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStepEnhanced
            nombre={nombre}
            tallasSeleccionadas={tallasSeleccionadas}
            tallasConCantidades={tallasConCantidades}
            cantidad={cantidad}
            onNombreChange={setNombre}
            onTallasChange={setTallasSeleccionadas}
            onCantidadChange={setCantidad}
            onDistribucionChange={actualizarCantidadTalla}
            onDistribuirEquitativamente={distribuirEquitativamente}
            isLoading={loading}
          />
        );
      case 2:
        return (
          <ImageStepEnhanced
            imagenPreview={imagenPreview}
            onImagenChange={manejarCambioImagen}
            onImagenRemove={handleImagenRemove}
            isLoading={loading}
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
    tallasSeleccionadas,
    cantidad,
    imagenPreview,
    insumosSeleccionados,
    manosDeObraSeleccionadas,
    costoTotal,
    loadingData,
    loading,
    insumos,
    manosDeObra,
    setNombre,
    setTallasSeleccionadas,
    setCantidad,
    manejarCambioImagen,
    handleImagenRemove,
    agregarInsumo,
    removerInsumo,
    actualizarCantidadInsumo,
    setManosDeObraSeleccionadas,
  ]);

  // Early return if no step data
  if (!currentStepData) {
    return null;
  }

  return (
    <PantalonFormErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-4" aria-label="Breadcrumb">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                  aria-label="Volver a la lista de pantalones"
                >
                  <Home className="h-4 w-4" />
                  Pantalones
                </Button>
                <div
                  className="text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  /
                </div>
                <h1 className="text-xl font-semibold">Crear Nuevo Pantalón</h1>
              </nav>

              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Progress Section */}
            <section className="mb-8" aria-labelledby="progress-title">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2
                    id="progress-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    {currentStepData.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentStepData.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground">
                    Paso {currentStep} de {FORM_STEPS.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(progress)}% completado
                  </div>
                </div>
              </div>
              <Progress
                value={progress}
                className="h-2"
                aria-label={`Progreso del formulario: ${Math.round(progress)}%`}
              />
            </section>

            {/* Steps Navigation */}
            <nav
              className="flex justify-between items-center mb-8 p-4 bg-card rounded-lg border"
              aria-label="Navegación de pasos"
            >
              {FORM_STEPS.map((step) => (
                <StepNavigationButton
                  key={step.id}
                  step={step}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  onStepClick={handleStepClick}
                />
              ))}
            </nav>

            {/* Step Content */}
            <section className="mb-8" aria-live="polite">
              <Suspense fallback={<StepLoadingFallback />}>
                {stepContent}
              </Suspense>
            </section>

            {/* Navigation Buttons */}
            <nav className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
                aria-label="Ir al paso anterior"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={handleCancel}>
                  Cancelar
                </Button>

                {currentStep < FORM_STEPS.length ? (
                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2"
                    aria-label="Ir al siguiente paso"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2"
                    aria-label={
                      loading ? "Creando pantalón..." : "Crear pantalón"
                    }
                  >
                    {loading ? "Creando..." : "Crear Pantalón"}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </main>
      </div>
    </PantalonFormErrorBoundary>
  );
});
