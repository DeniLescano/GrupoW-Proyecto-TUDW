/**
 * Índice de todos los servicios
 * Exporta todos los servicios para facilitar su importación
 */
const usuarioService = require('./usuarioService');
const salonService = require('./salonService');
const servicioService = require('./servicioService');
const turnoService = require('./turnoService');
const reservaService = require('./reservaService');
const estadisticasService = require('./estadisticasService');
const notificationService = require('./notificationService');
const authService = require('./authService');

module.exports = {
  usuarioService,
  salonService,
  servicioService,
  turnoService,
  reservaService,
  estadisticasService,
  notificationService,
  authService
};

