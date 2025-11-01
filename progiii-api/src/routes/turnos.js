const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const {
  createTurnoValidator,
  updateTurnoValidator,
  getTurnoValidator,
  deleteTurnoValidator
} = require('../validators/turnoValidator');

/**
 * @swagger
 * /turnos:
 *   get:
 *     summary: Obtener lista de turnos activos
 *     tags: [Turnos]
 *     responses:
 *       200:
 *         description: Lista de turnos
 */
router.get('/', turnoController.browse);

/**
 * @swagger
 * /turnos/{id}:
 *   get:
 *     summary: Obtener un turno por ID
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     responses:
 *       200:
 *         description: Turno encontrado
 *       404:
 *         description: Turno no encontrado
 */
router.get('/:id', getTurnoValidator, handleValidationErrors, turnoController.read);

/**
 * @swagger
 * /turnos:
 *   post:
 *     summary: Crear un nuevo turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Turno'
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', authenticateToken, authorizeRoles('empleado', 'administrador'), createTurnoValidator, handleValidationErrors, turnoController.add);

/**
 * @swagger
 * /turnos/{id}:
 *   put:
 *     summary: Actualizar un turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Turno'
 *     responses:
 *       200:
 *         description: Turno actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Turno no encontrado
 */
router.put('/:id', authenticateToken, authorizeRoles('empleado', 'administrador'), updateTurnoValidator, handleValidationErrors, turnoController.edit);

/**
 * @swagger
 * /turnos/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un turno
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del turno
 *     responses:
 *       200:
 *         description: Turno eliminado exitosamente
 *       404:
 *         description: Turno no encontrado
 */
router.delete('/:id', authenticateToken, authorizeRoles('empleado', 'administrador'), deleteTurnoValidator, handleValidationErrors, turnoController.delete);

module.exports = router;

