const { body, param } = require('express-validator');

const createServicioValidator = [
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria')
    .isLength({ min: 2, max: 200 }).withMessage('La descripción debe tener entre 2 y 200 caracteres'),
  
  body('importe')
    .notEmpty().withMessage('El importe es obligatorio')
    .isFloat({ min: 0 }).withMessage('El importe debe ser un número positivo')
];

const updateServicioValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  
  body('descripcion')
    .optional()
    .trim()
    .notEmpty().withMessage('La descripción no puede estar vacía')
    .isLength({ min: 2, max: 200 }).withMessage('La descripción debe tener entre 2 y 200 caracteres'),
  
  body('importe')
    .optional()
    .isFloat({ min: 0 }).withMessage('El importe debe ser un número positivo'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser true o false')
];

const getServicioValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const deleteServicioValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

module.exports = {
  createServicioValidator,
  updateServicioValidator,
  getServicioValidator,
  deleteServicioValidator
};

