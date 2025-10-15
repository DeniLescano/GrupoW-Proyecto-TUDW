const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');
const { reservaValidator } = require('../middlewares/validator');

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Gestión de reservas (todas las rutas requieren autenticación)
 */

// All reservation routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     summary: Lista las reservas. Clientes solo ven sus reservas. Admins/Empleados ven todas.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Una lista de reservas.
 *       401/403:
 *         description: Acceso no autorizado.
 */
router.get('/', reservaController.browse);

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     summary: Crea una nueva reserva (Solo Clientes).
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               salon_id:
 *                 type: integer
 *               turno_id:
 *                 type: integer
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *               tematica:
 *                 type: string
 *               servicios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     servicio_id:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente.
 *       400:
 *         description: Datos de entrada inválidos.
 *       403:
 *         description: Prohibido (solo los clientes pueden crear reservas).
 */
router.post('/', authorize([3]), reservaValidator, reservaController.add);

/**
 * @swagger
 * /api/reservas/{id}:
 *   get:
 *     summary: Obtiene una reserva por ID.
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la reserva.
 *       403:
 *         description: Prohibido (un cliente solo puede ver su propia reserva).
 *       404:
 *         description: Reserva no encontrada.
 */
router.get('/:id', reservaController.read);

/**
 * @swagger
 * /api/reservas/{id}:
 *   put:
 *     summary: Actualiza una reserva (Solo Admins).
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_reserva:
 *                 type: string
 *                 format: date
 *               salon_id:
 *                 type: integer
 *               turno_id:
 *                 type: integer
 *               tematica:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Reserva actualizada.
 *       403:
 *         description: Prohibido.
 *       404:
 *         description: Reserva no encontrada.
 */
router.put('/:id', authorize([1]), reservaValidator, reservaController.edit);

/**
 * @swagger
 * /api/reservas/{id}:
 *   delete:
 *     summary: Elimina (soft delete) una reserva (Solo Admins).
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva eliminada.
 *       403:
 *         description: Prohibido.
 *       404:
 *         description: Reserva no encontrada.
 */
router.delete('/:id', authorize([1]), reservaController.delete);


module.exports = router;