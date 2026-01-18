export const FORM_STEPS = [
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

export const VALIDATION_MESSAGES = {
  NOMBRE_REQUERIDO: "El nombre del pantalón es requerido",
  CANTIDAD_MINIMA: "La cantidad debe ser al menos 1",
  TALLAS_REQUERIDAS: "Debes seleccionar al menos una talla",
  INSUMOS_REQUERIDOS: "Debes seleccionar al menos un insumo",
  MANO_OBRA_REQUERIDA: "Debes seleccionar al menos un tipo de mano de obra",
} as const;
