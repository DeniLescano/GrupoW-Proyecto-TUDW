const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const registerValidator = [
    body('nombre').notEmpty().withMessage('El nombre es requerido.'),
    body('apellido').notEmpty().withMessage('El apellido es requerido.'),
    body('nombre_usuario').isEmail().withMessage('Debe ser un email válido.'),
    body('contrasenia').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    handleValidationErrors
];

const loginValidator = [
    body('nombre_usuario').isEmail().withMessage('Debe ser un email válido.'),
    body('contrasenia').notEmpty().withMessage('La contraseña es requerida.'),
    handleValidationErrors
];

const reservaValidator = [
    body('salon_id').isInt({ gt: 0 }).withMessage('El salon_id debe ser un entero positivo.'),
    body('turno_id').isInt({ gt: 0 }).withMessage('El turno_id debe ser un entero positivo.'),
    body('fecha_reserva').isISO8601().toDate().withMessage('La fecha_reserva debe ser una fecha válida.'),
    body('servicios').optional().isArray().withMessage('Servicios debe ser un arreglo.'),
    body('servicios.*.servicio_id').isInt({ gt: 0 }).withMessage('Cada servicio debe tener un servicio_id válido.'),
    handleValidationErrors
];

const salonValidator = [
    body('titulo').notEmpty().withMessage('El título es requerido.'),
    body('direccion').notEmpty().withMessage('La dirección es requerida.'),
    body('capacidad').isInt({ gt: 0 }).withMessage('La capacidad debe ser un número entero positivo.'),
    body('importe').isFloat({ gt: 0 }).withMessage('El importe debe ser un número positivo.'),
    handleValidationErrors
];

const servicioValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida.'),
    body('importe').isFloat({ gt: 0 }).withMessage('El importe debe ser un número positivo.'),
    handleValidationErrors
];

const turnoValidator = [
    body('orden').isInt({ gt: 0 }).withMessage('El orden debe ser un número entero positivo.'),
    body('hora_desde').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('hora_desde debe tener el formato HH:MM:SS.'),
    body('hora_hasta').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('hora_hasta debe tener el formato HH:MM:SS.'),
    handleValidationErrors
];


module.exports = {
    registerValidator,
    loginValidator,
    reservaValidator,
    salonValidator,
    servicioValidator,
    turnoValidator
};