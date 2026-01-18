// Input validation and sanitization utilities

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato de archivo no soportado. Use JPG, PNG o WEBP.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "El archivo es demasiado grande. Máximo 5MB.",
    };
  }

  return { isValid: true };
};

export const validatePantalonName = (
  name: string
): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeString(name);

  if (sanitized.length < 2) {
    return {
      isValid: false,
      error: "El nombre debe tener al menos 2 caracteres.",
    };
  }

  if (sanitized.length > 100) {
    return {
      isValid: false,
      error: "El nombre no puede exceder 100 caracteres.",
    };
  }

  return { isValid: true };
};

export const validateQuantity = (
  quantity: number,
  max: number
): { isValid: boolean; error?: string } => {
  if (quantity <= 0) {
    return {
      isValid: false,
      error: "La cantidad debe ser mayor a 0.",
    };
  }

  if (quantity > max) {
    return {
      isValid: false,
      error: `La cantidad no puede exceder ${max}.`,
    };
  }

  return { isValid: true };
};
