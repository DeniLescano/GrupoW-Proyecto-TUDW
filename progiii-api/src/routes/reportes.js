const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rutas de reportes: solo administradores
router.get('/reservas', authenticateToken, authorizeRoles('administrador'), reportesController.reporteReservas);
router.get('/reservas/csv', authenticateToken, authorizeRoles('administrador'), reportesController.exportarReservasCSV);

module.exports = router;

