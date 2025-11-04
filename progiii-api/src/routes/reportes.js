const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { statisticsLimiter } = require('../middlewares/rateLimiter');
const { reportsCache } = require('../middlewares/cache');

// Rutas de reportes: solo administradores
// Aplicar rate limiting estricto y cache para proteger y optimizar recursos pesados
router.get('/reservas', statisticsLimiter, reportsCache, authenticateToken, authorizeRoles('administrador'), reportesController.reporteReservas);
// CSV no se cachea porque es una descarga de archivo
router.get('/reservas/csv', statisticsLimiter, authenticateToken, authorizeRoles('administrador'), reportesController.exportarReservasCSV);

module.exports = router;

