import { useCallback } from "react";
import { toast } from "sonner";
import { VALIDATION_MESSAGES } from "../constants/form-steps";

interface ValidationData {
  currentStep: number;
  nombre: string;
  cantidad: string;
  tallasSeleccionadas: string[];
  insumosSeleccionados: unknown[];
  manosDeObraSeleccionadas: unknown[];
  validarFormulario: () => boolean;
}

export function useStepValidation({
  currentStep,
  nombre,
  cantidad,
  tallasSeleccionadas,
  insumosSeleccionados,
  manosDeObraSeleccionadas,
  validarFormulario,
}: ValidationData) {
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1: {
        if (!nombre.trim()) {
          toast.error(VALIDATION_MESSAGES.NOMBRE_REQUERIDO);
          return false;
        }
        const cantidadNum = parseInt(cantidad, 10);
        if (isNaN(cantidadNum) || cantidadNum < 1) {
          toast.error(VALIDATION_MESSAGES.CANTIDAD_MINIMA);
          return false;
        }
        if (tallasSeleccionadas.length === 0) {
          toast.error(VALIDATION_MESSAGES.TALLAS_REQUERIDAS);
          return false;
        }
        return true;
      }
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
    cantidad,
    tallasSeleccionadas,
    insumosSeleccionados,
    manosDeObraSeleccionadas,
    validarFormulario,
  ]);

  return { validateCurrentStep };
}
