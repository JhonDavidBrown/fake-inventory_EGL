import type { StepData } from "@/types/pantalon-form";

// Form steps configuration
export const FORM_STEPS: readonly StepData[] = [
  {
    id: 1,
    title: "Información Básica",
    description: "Nombre y tallas del pantalón",
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

// Available sizes
export const TALLAS_DISPONIBLES = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
] as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  NOMBRE_REQUERIDO: "El nombre del pantalón es requerido",
  TALLAS_REQUERIDAS: "Debes seleccionar al menos una talla",
  INSUMOS_REQUERIDOS: "Debes seleccionar al menos un insumo",
  MANO_OBRA_REQUERIDA: "Debes seleccionar al menos un tipo de mano de obra",
  IMAGEN_TAMAÑO_MAXIMO: "La imagen no puede ser mayor a 5MB",
} as const;

// Form configuration
export const FORM_CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  NETWORK_DELAY_SIMULATION: 1500, // ms
  DEFAULT_QUANTITY: 1,
  MIN_QUANTITY: 0.5,
  QUANTITY_STEP: 0.5,
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
  CAMERA_CONSTRAINTS: {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "environment",
    },
  } as const,
} as const;
