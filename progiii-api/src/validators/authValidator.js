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

module.exports = {
  loginValidator
};

