import { useState, useCallback, useMemo } from "react";

export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationErrors {
  [field: string]: string;
}

export function useFormValidation<T extends Record<string, unknown>>(
  rules: ValidationRules
) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (field: string, value: unknown): string | null => {
      const rule = rules[field];
      if (!rule) return null;

      // Required validation
      if (
        rule.required &&
        (!value || (Array.isArray(value) && value.length === 0))
      ) {
        return rule.message || `${field} es requerido`;
      }

      // Skip other validations if value is empty and not required
      if (!value && !rule.required) return null;

      // String validations
      if (typeof value === "string") {
        if (rule.minLength && value.length < rule.minLength) {
          return (
            rule.message ||
            `${field} debe tener al menos ${rule.minLength} caracteres`
          );
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          return (
            rule.message ||
            `${field} no puede tener más de ${rule.maxLength} caracteres`
          );
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          return rule.message || `${field} tiene un formato inválido`;
        }
      }

      // Array validations
      if (Array.isArray(value)) {
        if (rule.minLength && value.length < rule.minLength) {
          return (
            rule.message ||
            `Debes seleccionar al menos ${rule.minLength} elemento(s)`
          );
        }
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value);
      }

      return null;
    },
    [rules]
  );

  const validateForm = useCallback(
    (data: T): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      Object.keys(rules).forEach((field) => {
        const error = validateField(field, data[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    [rules, validateField]
  );

  const validateSingleField = useCallback(
    (field: string, value: unknown) => {
      const error = validateField(field, value);
      setErrors((prev) => ({
        ...prev,
        [field]: error || "",
      }));
      return !error;
    },
    [validateField]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some((error) => error && error.length > 0);
  }, [errors]);

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError,
    hasErrors,
  };
}
