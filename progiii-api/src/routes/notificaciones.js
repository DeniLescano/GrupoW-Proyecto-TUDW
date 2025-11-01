const express = require('express');
const router = express.Router();
const notificacionController = require('../controllers/notificacionController');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * /notificaciones:
 *   get:
 *     summary: Obtener notificaciones del usuario autenticado
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de notificaciones a obtener
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/', authenticateToken, notificacionController.browse);

/**
 * @swagger
 * /notificaciones/unread:
 *   get:
 *     summary: Obtener cantidad de notificaciones no leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cantidad de notificaciones no leídas
 */
router.get('/unread', authenticateToken, notificacionController.getUnreadCount);

/**
 * @swagger
 * /notificaciones/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.patch('/:id/read', authenticateToken, notificacionController.markAsRead);

/**
 * @swagger
 * /notificaciones/read-all:
 *   patch:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 */
router.patch('/read-all', authenticateToken, notificacionController.markAllAsRead);

module.exports = router;

