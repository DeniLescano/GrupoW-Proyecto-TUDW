const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const {
  createReservaValidator,
  updateReservaValidator,
  getReservaValidator,
  deleteReservaValidator
} = require('../validators/reservaValidator');
const { listCache, invalidateCacheAfterWrite } = require('../middlewares/cache');

/**
 * @swagger
 * /reservas/mis-reservas:
 *   get:
 *     summary: Obtener reservas del usuario autenticado
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario
 */
router.get('/mis-reservas', listCache, authenticateToken, reservaController.browseByUser);

/**
 * @swagger
 * /reservas:
 *   get:
 *     summary: Obtener todas las reservas (solo empleados y administradores)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas
 */
router.get('/', listCache, authenticateToken, authorizeRoles('empleado', 'administrador'), reservaController.browse);

/**
 * @swagger
 * /reservas/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *       404:
 *         description: Reserva no encontrada
 */
router.get('/:id', listCache, authenticateToken, getReservaValidator, handleValidationErrors, reservaController.read);

/**
 * @swagger
 * /reservas:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', invalidateCacheAfterWrite('reservas'), authenticateToken, authorizeRoles('cliente', 'empleado', 'administrador'), createReservaValidator, handleValidationErrors, reservaController.add);

/**
 * @swagger
 * /reservas/{id}/confirmar:
 *   patch:
 *     summary: Confirmar una reserva (solo administradores)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva confirmada exitosamente
 *       404:
 *         description: Reserva no encontrada
 */
router.patch('/:id/confirmar', invalidateCacheAfterWrite('reservas'), authenticateToken, authorizeRoles('administrador'), getReservaValidator, handleValidationErrors, reservaController.confirmar);

/**
 * @swagger
 * /reservas/{id}:
 *   put:
 *     summary: Actualizar una reserva (solo administradores)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reserva'
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Reserva no encontrada
 */
router.put('/:id', invalidateCacheAfterWrite('reservas'), authenticateToken, authorizeRoles('administrador'), updateReservaValidator, handleValidationErrors, reservaController.edit);

/**
 * @swagger
 * /reservas/{id}:
 *   delete:
 *     summary: Eliminar una reserva (solo administradores)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva eliminada exitosamente
 *       404:
 *         description: Reserva no encontrada
 */
/**
 * @swagger
 * /reservas/{id}/cancelar:
 *   delete:
 *     summary: Cancelar una reserva (solo clientes pueden cancelar sus propias reservas)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo_cancelacion
 *             properties:
 *               motivo_cancelacion:
 *                 type: string
 *                 description: Motivo de la cancelación
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       400:
 *         description: Error de validación o reserva ya cancelada
 *       403:
 *         description: No tienes permisos para cancelar esta reserva
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/:id/cancelar', invalidateCacheAfterWrite('reservas'), authenticateToken, authorizeRoles('cliente'), getReservaValidator, handleValidationErrors, reservaController.cancelar);

router.delete('/:id', invalidateCacheAfterWrite('reservas'), authenticateToken, authorizeRoles('administrador'), deleteReservaValidator, handleValidationErrors, reservaController.delete);

/**
 * @swagger
 * /reservas/{id}/permanent:
 *   delete:
 *     summary: Eliminar definitivamente (hard delete) una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Reserva eliminada definitivamente
 *       403:
 *         description: No se puede eliminar una reserva activa
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/:id/permanent', invalidateCacheAfterWrite('reservas'), authenticateToken, authorizeRoles('administrador'), deleteReservaValidator, handleValidationErrors, reservaController.permanentDelete);

module.exports = router;
