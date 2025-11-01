const { body, param } = require('express-validator');

const createTurnoValidator = [
  body('orden')
    .notEmpty().withMessage('El orden es obligatorio')
    .isInt({ min: 1 }).withMessage('El orden debe ser un número entero positivo'),
  
  body('hora_desde')
    .trim()
    .notEmpty().withMessage('La hora desde es obligatoria')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora desde debe estar en formato HH:mm (24 horas)'),
  
  body('hora_hasta')
    .trim()
    .notEmpty().withMessage('La hora hasta es obligatoria')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora hasta debe estar en formato HH:mm (24 horas)')
    .custom((value, { req }) => {
      const horaDesde = req.body.hora_desde;
      if (horaDesde && value) {
        const inicio = new Date(`2000-01-01T${horaDesde}:00`);
        const fin = new Date(`2000-01-01T${value}:00`);
        if (fin <= inicio) {
          throw new Error('La hora hasta debe ser posterior a la hora desde');
        }
      }
      return true;
    })
];

const updateTurnoValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  
  body('orden')
    .optional()
    .isInt({ min: 1 }).withMessage('El orden debe ser un número entero positivo'),
  
  body('hora_desde')
    .optional()
    .trim()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora desde debe estar en formato HH:mm (24 horas)'),
  
  body('hora_hasta')
    .optional()
    .trim()
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('La hora hasta debe estar en formato HH:mm (24 horas)')
    .custom((value, { req }) => {
      const horaDesde = req.body.hora_desde;
      if (horaDesde && value) {
        const inicio = new Date(`2000-01-01T${horaDesde}:00`);
        const fin = new Date(`2000-01-01T${value}:00`);
        if (fin <= inicio) {
          throw new Error('La hora hasta debe ser posterior a la hora desde');
        }
      }
      return true;
    }),
  
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser true o false')
];

const getTurnoValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const deleteTurnoValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

module.exports = {
  createTurnoValidator,
  updateTurnoValidator,
  getTurnoValidator,
  deleteTurnoValidator
};

