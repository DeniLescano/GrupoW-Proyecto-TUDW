/**
 * Índice de todos los repositories
 * Exporta todos los repositories para facilitar su importación
 */
const usuarioRepository = require('./usuarioRepository');
const salonRepository = require('./salonRepository');
const servicioRepository = require('./servicioRepository');
const turnoRepository = require('./turnoRepository');
const reservaRepository = require('./reservaRepository');
const estadisticasRepository = require('./estadisticasRepository');
const notificacionRepository = require('./notificacionRepository');

module.exports = {
  usuarioRepository,
  salonRepository,
  servicioRepository,
  turnoRepository,
  reservaRepository,
  estadisticasRepository,
  notificacionRepository
};

