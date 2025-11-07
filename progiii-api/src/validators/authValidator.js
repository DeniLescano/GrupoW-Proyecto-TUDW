const { body } = require('express-validator');

const loginValidator = [
  body('nombre_usuario')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es obligatorio')
    .isEmail().withMessage('El nombre de usuario debe ser un email válido')
    .normalizeEmail(),
  
  body('contrasenia')
    .notEmpty().withMessage('La contraseña es obligatoria')
];

const registerValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  
  body('nombre_usuario')
    .trim()
    .notEmpty().withMessage('El nombre de usuario (email) es obligatorio')
    .isEmail().withMessage('El nombre de usuario debe ser un email válido')
    .normalizeEmail(),
  
  body('contrasenia')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('celular')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/).withMessage('El celular debe contener solo números y caracteres permitidos')
];

module.exports = {
  loginValidator,
  registerValidator
};

