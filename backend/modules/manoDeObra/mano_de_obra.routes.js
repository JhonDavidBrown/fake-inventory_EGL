const express = require("express");
const router = express.Router();
const controller = require("./mano_de_obra.controller");
const { authenticateRequest } = require("../../shared/middleware/auth.middleware");

// 1. Importar herramientas de validación
const { body, param, validationResult } = require('express-validator');

// 2. Middleware reutilizable para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// 3. Reglas de validación para la creación (POST)
const createManoDeObraRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.'),
  body('precio')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número igual o mayor a 0.')
];

// 4. Reglas de validación para la actualización (PUT)
const updateManoDeObraRules = [
  body('nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede quedar vacío.'),
  body('precio')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número igual o mayor a 0.')
];

// 5. Regla para validar el parámetro de la URL
const validateReferencia = [
  param('referencia').isInt().withMessage('La referencia debe ser un número entero.')
];


// --- APLICACIÓN DE MIDDLEWARES A LAS RUTAS ---

router.use(authenticateRequest);

router.route("/")
    .get(controller.getAll)
    // Aplicar reglas de validación al crear
    .post(createManoDeObraRules, handleValidationErrors, controller.create);

router.route("/:referencia")
    // Aplicar validación de referencia a todas las rutas con este parámetro
    .get(validateReferencia, handleValidationErrors, controller.getByReferencia)
    .put(validateReferencia, updateManoDeObraRules, handleValidationErrors, controller.update)
    // TAREA PENDIENTE: Añadir aquí el middleware 'isAdmin' cuando esté listo
    .delete(validateReferencia, handleValidationErrors, controller.deleteByReferencia);

module.exports = router;