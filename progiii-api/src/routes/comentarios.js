const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const { body, param } = require('express-validator');
const { protectedLimiter } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * /reservas/{reservaId}/comentarios:
 *   get:
 *     summary: Obtener comentarios de una reserva
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.get(
  '/reservas/:reservaId/comentarios',
  protectedLimiter,
  authenticateToken,
  authorizeRoles('administrador', 'empleado'),
  [
    param('reservaId').isInt().withMessage('ID de reserva inválido')
  ],
  handleValidationErrors,
  comentarioController.getComentarios
);

/**
 * @swagger
 * /reservas/{reservaId}/comentarios:
 *   post:
 *     summary: Crear un comentario en una reserva (solo administradores)
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservaId
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
 *               - comentario
 *             properties:
 *               comentario:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Pago del 50% de la reserva realizado
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado (solo administradores)
 */
router.post(
  '/reservas/:reservaId/comentarios',
  protectedLimiter,
  authenticateToken,
  authorizeRoles('administrador'),
  [
    param('reservaId').isInt().withMessage('ID de reserva inválido'),
    body('comentario')
      .trim()
      .notEmpty().withMessage('El comentario es obligatorio')
      .isLength({ min: 1, max: 1000 }).withMessage('El comentario debe tener entre 1 y 1000 caracteres')
  ],
  handleValidationErrors,
  comentarioController.createComentario
);

/**
 * @swagger
 * /comentarios/{id}:
 *   put:
 *     summary: Actualizar un comentario (solo el autor)
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comentario
 *             properties:
 *               comentario:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Comentario actualizado exitosamente
 *       403:
 *         description: No autorizado (solo el autor puede actualizar)
 */
router.put(
  '/comentarios/:id',
  protectedLimiter,
  authenticateToken,
  authorizeRoles('administrador'),
  [
    param('id').isInt().withMessage('ID de comentario inválido'),
    body('comentario')
      .trim()
      .notEmpty().withMessage('El comentario es obligatorio')
      .isLength({ min: 1, max: 1000 }).withMessage('El comentario debe tener entre 1 y 1000 caracteres')
  ],
  handleValidationErrors,
  comentarioController.updateComentario
);

/**
 * @swagger
 * /comentarios/{id}:
 *   delete:
 *     summary: Eliminar un comentario (solo el autor)
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 *       403:
 *         description: No autorizado (solo el autor puede eliminar)
 */
router.delete(
  '/comentarios/:id',
  protectedLimiter,
  authenticateToken,
  authorizeRoles('administrador'),
  [
    param('id').isInt().withMessage('ID de comentario inválido')
  ],
  handleValidationErrors,
  comentarioController.deleteComentario
);

module.exports = router;

