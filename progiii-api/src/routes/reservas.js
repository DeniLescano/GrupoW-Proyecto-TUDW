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
router.get('/mis-reservas', authenticateToken, reservaController.browseByUser);

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
router.get('/', authenticateToken, authorizeRoles('empleado', 'administrador'), reservaController.browse);

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
router.get('/:id', authenticateToken, getReservaValidator, handleValidationErrors, reservaController.read);

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
router.post('/', authenticateToken, authorizeRoles('cliente', 'empleado', 'administrador'), createReservaValidator, handleValidationErrors, reservaController.add);

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
router.patch('/:id/confirmar', authenticateToken, authorizeRoles('administrador'), getReservaValidator, handleValidationErrors, reservaController.confirmar);

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
router.put('/:id', authenticateToken, authorizeRoles('administrador'), updateReservaValidator, handleValidationErrors, reservaController.edit);

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
router.delete('/:id', authenticateToken, authorizeRoles('administrador'), deleteReservaValidator, handleValidationErrors, reservaController.delete);

module.exports = router;
