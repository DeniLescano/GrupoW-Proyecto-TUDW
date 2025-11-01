const { body, param, query } = require('express-validator');

// Validaciones para crear usuario
const createUsuarioValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  
  body('nombre_usuario')
    .trim()
    .notEmpty().withMessage('El nombre de usuario (email) es obligatorio')
    .isEmail().withMessage('El nombre de usuario debe ser un email válido')
    .normalizeEmail(),
  
  body('contrasenia')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  body('celular')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('El celular no es válido'),
  
  body('foto')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('La foto debe ser una URL válida'),
  
  body('tipo_usuario')
    .notEmpty().withMessage('El tipo de usuario es obligatorio')
    .isInt({ min: 1, max: 3 }).withMessage('El tipo de usuario debe ser 1 (Cliente), 2 (Empleado) o 3 (Administrador)')
];

// Validaciones para actualizar usuario
const updateUsuarioValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  
  body('nombre')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('apellido')
    .optional()
    .trim()
    .notEmpty().withMessage('El apellido no puede estar vacío')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  
  body('nombre_usuario')
    .optional()
    .trim()
    .notEmpty().withMessage('El nombre de usuario no puede estar vacío')
    .isEmail().withMessage('El nombre de usuario debe ser un email válido')
    .normalizeEmail(),
  
  body('celular')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('El celular no es válido'),
  
  body('foto')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('La foto debe ser una URL válida'),
  
  body('tipo_usuario')
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage('El tipo de usuario debe ser 1 (Cliente), 2 (Empleado) o 3 (Administrador)'),
  
  body('activo')
    .optional()
    .isInt({ min: 0, max: 1 }).withMessage('El campo activo debe ser 0 o 1')
];

// Validaciones para obtener usuario por ID
const getUsuarioValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

// Validaciones para eliminar usuario
const deleteUsuarioValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

module.exports = {
  createUsuarioValidator,
  updateUsuarioValidator,
  getUsuarioValidator,
  deleteUsuarioValidator
};

