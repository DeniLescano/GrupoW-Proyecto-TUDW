const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Todas las rutas de estadísticas requieren autenticación y rol de administrador
router.get('/reservas', authenticateToken, authorizeRoles('administrador'), estadisticasController.estadisticasReservas);
router.get('/salones', authenticateToken, authorizeRoles('administrador'), estadisticasController.estadisticasSalones);
router.get('/usuarios', authenticateToken, authorizeRoles('administrador'), estadisticasController.estadisticasUsuarios);
router.get('/reservas-por-mes', authenticateToken, authorizeRoles('administrador'), estadisticasController.reservasPorMes);
router.get('/reservas-detalladas', authenticateToken, authorizeRoles('administrador'), estadisticasController.reservasDetalladas);

module.exports = router;

