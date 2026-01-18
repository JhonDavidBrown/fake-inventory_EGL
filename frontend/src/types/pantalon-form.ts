export interface StepData {
  id: number;
  title: string;
  description: string;
}

export type TallaDisponible =
  | "28"
  | "30"
  | "32"
  | "34"
  | "36"
  | "38"
  | "40"
  | "42"
  | "44"
  | "46";

export interface FormValidationMessages {
  readonly NOMBRE_REQUERIDO: string;
  readonly TALLAS_REQUERIDAS: string;
  readonly INSUMOS_REQUERIDOS: string;
  readonly MANO_OBRA_REQUERIDA: string;
  readonly IMAGEN_TAMAÑO_MAXIMO: string;
}

export interface FormConfig {
  readonly MAX_IMAGE_SIZE: number;
  readonly NETWORK_DELAY_SIMULATION: number;
  readonly DEFAULT_QUANTITY: number;
  readonly MIN_QUANTITY: number;
  readonly QUANTITY_STEP: number;
}
