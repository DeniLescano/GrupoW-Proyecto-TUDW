const { body, param, query } = require('express-validator');

const createReservaValidator = [
  body('usuario_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número entero positivo'),
  
  body('salon_id')
    .notEmpty().withMessage('El ID del salón es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del salón debe ser un número entero positivo'),
  
  body('fecha_reserva')
    .trim()
    .notEmpty().withMessage('La fecha de reserva es obligatoria')
    .isISO8601().withMessage('La fecha debe estar en formato ISO 8601 (YYYY-MM-DD)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }
      return true;
    }),
  
  body('turno_id')
    .notEmpty().withMessage('El ID del turno es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del turno debe ser un número entero positivo'),
  
  body('tematica')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('La temática no puede exceder 200 caracteres'),
  
  body('foto_cumpleaniero')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('La foto debe ser una URL válida'),
  
  body('servicios')
    .optional()
    .isArray().withMessage('Los servicios deben ser un array')
    .custom((value) => {
      if (value.length > 0 && !value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('Todos los IDs de servicios deben ser números enteros positivos');
      }
      return true;
    })
];

const updateReservaValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo'),
  
  body('usuario_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número entero positivo'),
  
  body('salon_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del salón debe ser un número entero positivo'),
  
  body('fecha_reserva')
    .optional()
    .trim()
    .isISO8601().withMessage('La fecha debe estar en formato ISO 8601 (YYYY-MM-DD)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }
      return true;
    }),
  
  body('turno_id')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del turno debe ser un número entero positivo'),
  
  body('tematica')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('La temática no puede exceder 200 caracteres'),
  
  body('foto_cumpleaniero')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL().withMessage('La foto debe ser una URL válida'),
  
  body('estado')
    .optional()
    .isIn(['pendiente', 'confirmada', 'cancelada', 'completada']).withMessage('El estado debe ser: pendiente, confirmada, cancelada o completada'),
  
  body('servicios')
    .optional()
    .isArray().withMessage('Los servicios deben ser un array')
    .custom((value) => {
      if (value.length > 0 && !value.every(id => Number.isInteger(id) && id > 0)) {
        throw new Error('Todos los IDs de servicios deben ser números enteros positivos');
      }
      return true;
    })
];

const getReservaValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const deleteReservaValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

const reporteReservasValidator = [
  query('fechaDesde')
    .optional()
    .isISO8601().withMessage('La fecha desde debe estar en formato ISO 8601 (YYYY-MM-DD)'),
  
  query('fechaHasta')
    .optional()
    .isISO8601().withMessage('La fecha hasta debe estar en formato ISO 8601 (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const fechaDesde = req.query.fechaDesde;
      if (fechaDesde && value) {
        const desde = new Date(fechaDesde);
        const hasta = new Date(value);
        if (hasta < desde) {
          throw new Error('La fecha hasta debe ser posterior a la fecha desde');
        }
      }
      return true;
    }),
  
  query('idSalon')
    .optional()
    .isInt({ min: 1 }).withMessage('El ID del salón debe ser un número entero positivo'),
  
  query('estado')
    .optional()
    .isIn(['pendiente', 'confirmada', 'cancelada', 'completada']).withMessage('El estado debe ser: pendiente, confirmada, cancelada o completada')
];

module.exports = {
  createReservaValidator,
  updateReservaValidator,
  getReservaValidator,
  deleteReservaValidator,
  reporteReservasValidator
};

