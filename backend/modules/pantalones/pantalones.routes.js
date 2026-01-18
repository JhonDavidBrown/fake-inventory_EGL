const express = require('express');
const router = express.Router();
const pantalonController = require('./pantalones.controller');
const { authenticateRequest } = require('../../shared/middleware/auth.middleware');

const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createPantalonRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('tallas_disponibles')
    .custom((value) => {
      // Aceptar tanto array (formato legacy) como objeto (formato nuevo con cantidades)
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const keys = Object.keys(value);
        return keys.length > 0 && keys.every(k => typeof value[k] === 'number' && value[k] >= 0);
      }
      return false;
    })
    .withMessage('Debes proporcionar al menos una talla (array o objeto con cantidades).'),
  body('cantidad').isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero igual o mayor a 0.'),
  
  body('insumos')
    .optional()
    .isArray({ min: 1 }).withMessage('Si se envían insumos, debe ser un array con al menos un elemento.'),
  body('insumos.*.insumo_referencia')
    .notEmpty().withMessage('La referencia del insumo es obligatoria.')
    .isInt({ min: 1 }).withMessage('La referencia del insumo debe ser un número entero positivo.'),
  body('insumos.*.cantidad_requerida')
    .notEmpty().withMessage('La cantidad requerida de insumo es obligatoria.')
    .isFloat({ gt: 0 }).withMessage('La cantidad requerida de insumo debe ser un número mayor a 0.'),

  body('manos_de_obra')
    .optional()
    .isArray({ min: 1 }).withMessage('Si se envía mano de obra, debe ser un array con al menos un elemento.'),
  body('manos_de_obra.*.mano_de_obra_referencia')
    .notEmpty().withMessage('La referencia de la mano de obra es obligatoria.')
    .isInt({ min: 1 }).withMessage('La referencia de la mano de obra debe ser un número entero positivo.')
];

const updatePantalonRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.'),
  body('tallas_disponibles')
    .optional()
    .custom((value) => {
      // Aceptar tanto array (formato legacy) como objeto (formato nuevo con cantidades)
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const keys = Object.keys(value);
        return keys.length > 0 && keys.every(k => typeof value[k] === 'number' && value[k] >= 0);
      }
      return false;
    })
    .withMessage('Las tallas disponibles deben ser un array o un objeto con cantidades válidas.'),
  body('cantidad').optional().isInt({ min: 0 }).withMessage('La cantidad debe ser un entero no negativo.'),
  
  body('insumos').optional().isArray().withMessage('Los insumos deben ser un array.'),
  body('insumos.*.insumo_referencia').optional().isInt({ min: 1 }).withMessage('La referencia del insumo debe ser un número entero positivo.'),
  body('insumos.*.cantidad_requerida').optional().isFloat({ gt: 0 }).withMessage('La cantidad requerida debe ser un número mayor a 0.'),

  body('manos_de_obra').optional().isArray().withMessage('Las manos de obra deben ser un array.'),
  body('manos_de_obra.*.mano_de_obra_referencia').optional().isInt({ min: 1 }).withMessage('La referencia de la mano de obra debe ser un número entero positivo.')
];

const validateReferencia = [
  param('referencia').isInt().withMessage('La referencia debe ser un número entero.')
];


router.use(authenticateRequest);

router.route('/')
  .post(createPantalonRules, handleValidationErrors, pantalonController.createPantalon)
  .get(pantalonController.getAllPantalones);

router.route('/:referencia')
  .get(validateReferencia, handleValidationErrors, pantalonController.getPantalonByReferencia)
  .put(validateReferencia, updatePantalonRules, handleValidationErrors, pantalonController.updatePantalon)
  .delete(validateReferencia, handleValidationErrors, pantalonController.deletePantalon);

module.exports = router;