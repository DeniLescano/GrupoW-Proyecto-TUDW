const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { statisticsLimiter } = require('../middlewares/rateLimiter');
const { statisticsCache } = require('../middlewares/cache');

// Todas las rutas de estadísticas requieren autenticación y rol de administrador
// Aplicar rate limiting estricto y cache para proteger y optimizar recursos pesados
router.get('/reservas', statisticsLimiter, statisticsCache, authenticateToken, authorizeRoles('administrador'), estadisticasController.estadisticasReservas);
router.get('/salones', statisticsLimiter, statisticsCache, authenticateToken, authorizeRoles('administrador'), estadisticasController.estadisticasSalones);
router.get('/usuarios', statisticsLimiter, statisticsCache, authenticateToken, authorizeRoles('administrador'), estadisticasController.estadisticasUsuarios);
router.get('/reservas-por-mes', statisticsLimiter, statisticsCache, authenticateToken, authorizeRoles('administrador'), estadisticasController.reservasPorMes);
router.get('/reservas-detalladas', statisticsLimiter, statisticsCache, authenticateToken, authorizeRoles('administrador'), estadisticasController.reservasDetalladas);

module.exports = router;

