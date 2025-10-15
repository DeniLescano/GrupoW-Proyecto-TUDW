const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');
const { turnoValidator } = require('../middlewares/validator');

/**
 * @swagger
 * tags:
 *   name: Turnos
 *   description: Gestión de turnos disponibles
 */

/**
 * @swagger
 * /api/turnos:
 *   get:
 *     summary: Obtiene una lista de todos los turnos activos.
 *     tags: [Turnos]
 *     responses:
 *       200:
 *         description: Lista de turnos.
 */
router.get('/', turnoController.browse);

/**
 * @swagger
 * /api/turnos/{id}:
 *   get:
 *     summary: Obtiene un turno por ID.
 *     tags: [Turnos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del turno.
 *       404:
 *         description: Turno no encontrado.
 */
router.get('/:id', turnoController.read);

/**
 * @swagger
 * /api/turnos:
 *   post:
 *     summary: Crea un nuevo turno (Admin & Empleado).
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orden:
 *                 type: integer
 *               hora_desde:
 *                 type: string
 *                 format: time
 *                 example: '12:00:00'
 *               hora_hasta:
 *                 type: string
 *                 format: time
 *                 example: '14:00:00'
 *     responses:
 *       201:
 *         description: Turno creado.
 *       400:
 *         description: Datos inválidos.
 *       401/403:
 *         description: Acceso no autorizado.
 */
router.post('/', authMiddleware, authorize([1, 2]), turnoValidator, turnoController.add);

/**
 * @swagger
 * /api/turnos/{id}:
 *   put:
 *     summary: Actualiza un turno (Admin & Empleado).
 *     tags: [Turnos]
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
 *               orden:
 *                 type: integer
 *               hora_desde:
 *                 type: string
 *                 format: time
 *                 example: '12:00:00'
 *               hora_hasta:
 *                 type: string
 *                 format: time
 *                 example: '14:00:00'
 *     responses:
 *       200:
 *         description: Turno actualizado.
 *       400:
 *         description: Datos inválidos.
 *       401/403:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Turno no encontrado.
 */
router.put('/:id', authMiddleware, authorize([1, 2]), turnoValidator, turnoController.edit);

/**
 * @swagger
 * /api/turnos/{id}:
 *   delete:
 *     summary: Elimina (soft delete) un turno (Admin & Empleado).
 *     tags: [Turnos]
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
 *         description: Turno eliminado.
 *       401/403:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Turno no encontrado.
 */
router.delete('/:id', authMiddleware, authorize([1, 2]), turnoController.delete);

module.exports = router;