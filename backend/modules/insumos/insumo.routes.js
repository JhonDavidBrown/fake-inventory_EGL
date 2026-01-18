const express = require('express');
const router = express.Router();
const insumoController = require('./insumo.controller');
const { authenticateRequest } = require('../../shared/middleware/auth.middleware');

const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createInsumoRules = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isString().withMessage('El nombre debe ser texto.'),
  body('tipo')
    .trim()
    .notEmpty().withMessage('El tipo es obligatorio.')
    .isString().withMessage('El tipo debe ser texto.'),
  body('cantidad')
    .isFloat({ min: 0 }).withMessage('La cantidad debe ser un número igual o mayor a 0.'),
  body('unidad')
    .trim()
    .notEmpty().withMessage('La unidad es obligatoria.'),
  body('preciounidad')
    .isFloat({ min: 0 }).withMessage('El precio por unidad debe ser un número igual o mayor a 0.')
];

const updateInsumoRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.').isString(),
  body('tipo').optional().trim().notEmpty().withMessage('El tipo no puede quedar vacío.').isString(),
  body('cantidad').optional().isFloat({ min: 0 }).withMessage('La cantidad debe ser un número igual o mayor a 0.'),
  body('unidad').optional().trim().notEmpty().withMessage('La unidad no puede quedar vacía.'),
  body('preciounidad').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número igual o mayor a 0.')
];

const validateReferencia = [
  param('referencia').isInt().withMessage('La referencia debe ser un número entero.')
];

const addStockRules = [
  body('cantidadComprada')
    .isFloat({ gt: 0 })
    .withMessage('La cantidad comprada debe ser un número mayor a 0.'),
  body('precioDeCompra')
    .isFloat({ min: 0 })
    .withMessage('El precio de compra debe ser un número igual o mayor a 0.')
];

router.use(authenticateRequest);

router.route('/')
  .get(insumoController.getAllInsumos)
  .post(createInsumoRules, handleValidationErrors, insumoController.createInsumo);

router.route('/:referencia/add-stock')
  .post(
    validateReferencia,
    addStockRules,        
    handleValidationErrors, 
    insumoController.addStock 
  );

router.route('/:referencia')
  .get(validateReferencia, handleValidationErrors, insumoController.getInsumoByReferencia)
  .put(validateReferencia, updateInsumoRules, handleValidationErrors, insumoController.updateInsumo)
  .delete(validateReferencia, handleValidationErrors, insumoController.deleteInsumo);

module.exports = router;