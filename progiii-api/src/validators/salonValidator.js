const { body, param } = require('express-validator');

const createSalonValidator = [
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El título debe tener entre 2 y 100 caracteres'),
  
  body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es obligatoria')
    .isLength({ min: 2, max: 200 }).withMessage('La dirección debe tener entre 2 y 200 caracteres'),
  
  body('capacidad')
    .notEmpty().withMessage('La capacidad es obligatoria')
    .isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero positivo'),
  
  body('importe')
    .notEmpty().withMessage('El importe es obligatorio')
    .isFloat({ min: 0 }).withMessage('El importe debe ser un número positivo')
];

const updateSalonValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  
  body('titulo')
    .optional()
    .trim()
    .notEmpty().withMessage('El título no puede estar vacío')
    .isLength({ min: 2, max: 100 }).withMessage('El título debe tener entre 2 y 100 caracteres'),
  
  body('direccion')
    .optional()
    .trim()
    .notEmpty().withMessage('La dirección no puede estar vacía')
    .isLength({ min: 2, max: 200 }).withMessage('La dirección debe tener entre 2 y 200 caracteres'),
  
  body('capacidad')
    .optional()
    .isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero positivo'),
  
  body('importe')
    .optional()
    .isFloat({ min: 0 }).withMessage('El importe debe ser un número positivo'),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser true o false')
];

const getSalonValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const deleteSalonValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

module.exports = {
  createSalonValidator,
  updateSalonValidator,
  getSalonValidator,
  deleteSalonValidator
};

