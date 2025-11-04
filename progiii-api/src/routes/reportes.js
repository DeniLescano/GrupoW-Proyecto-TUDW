const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { statisticsLimiter } = require('../middlewares/rateLimiter');
const { reportsCache } = require('../middlewares/cache');

/**
 * @swagger
 * /reportes/reservas:
 *   get:
 *     summary: Obtener reporte de reservas en formato JSON, PDF o CSV
 *     description: |
 *       Endpoint para exportar reportes de reservas con datos relacionados (servicios, salones, turnos, usuarios).
 *       Solo administradores pueden acceder. Valida formato (PDF, CSV, JSON) y parámetros de fecha.
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         description: Fecha hasta (YYYY-MM-DD)
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [PDF, CSV, JSON]
 *           default: JSON
 *         description: Formato del reporte (PDF, CSV o JSON)
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *           text/csv:
 *             schema:
 *               type: string
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Error de validación (formato o fechas inválidas)
 *       403:
 *         description: No autorizado (solo administradores)
 *       500:
 *         description: Error del servidor
 */
// Rutas de reportes: solo administradores
// Aplicar rate limiting estricto y cache para proteger y optimizar recursos pesados
// NOTA: CSV y PDF no se cachean porque son descargas de archivo
router.get('/reservas', statisticsLimiter, authenticateToken, authorizeRoles('administrador'), reportesController.reporteReservas);

/**
 * @swagger
 * /reportes/reservas/csv:
 *   get:
 *     summary: Exportar reservas a CSV (alias)
 *     description: |
 *       Endpoint específico para exportar CSV. Alias de GET /reportes/reservas?formato=CSV
 *       Solo administradores pueden acceder.
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Archivo CSV descargado
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado (solo administradores)
 */
// CSV no se cachea porque es una descarga de archivo
router.get('/reservas/csv', statisticsLimiter, authenticateToken, authorizeRoles('administrador'), reportesController.exportarReservasCSV);

module.exports = router;

