const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');
const { salonValidator } = require('../middlewares/validator');

/**
 * @swagger
 * tags:
 *   name: Salones
 *   description: Gestión de salones
 */

/**
 * @swagger
 * /api/salones:
 *   get:
 *     summary: Obtiene una lista de todos los salones activos.
 *     tags: [Salones]
 *     responses:
 *       200:
 *         description: Lista de salones.
 */
router.get('/', salonController.browse);

/**
 * @swagger
 * /api/salones/{id}:
 *   get:
 *     summary: Obtiene un salón por ID.
 *     tags: [Salones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del salón.
 *       404:
 *         description: Salón no encontrado.
 */
router.get('/:id', salonController.read);

/**
 * @swagger
 * /api/salones/{id}:
 *   put:
 *     summary: Actualiza un salón (Admin & Empleado).
 *     tags: [Salones]
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
 *               titulo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               importe:
 *                 type: number
 *     responses:
 *       200:
 *         description: Salón actualizado.
 *       400:
 *         description: Datos inválidos.
 *       401/403: 
 *         description: Acceso no autorizado.
 *       404:
 *         description: Salón no encontrado.
 */
router.put('/:id', authMiddleware, authorize([1, 2]), salonValidator, salonController.edit);

/**
 * @swagger
 * /api/salones:
 *   post:
 *     summary: Crea un nuevo salón (Admin & Empleado).
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               direccion:
 *                 type: string
 *               capacidad:
 *                 type: integer
 *               importe:
 *                 type: number
 *     responses:
 *       201:
 *         description: Salón creado.
 *       400:
 *         description: Datos inválidos.
 *       401/403:
 *         description: Acceso no autorizado.
 */
router.post('/', authMiddleware, authorize([1, 2]), salonValidator, salonController.add);

/**
 * @swagger
 * /api/salones/{id}:
 *   delete:
 *     summary: Elimina (soft delete) un salón (Admin & Empleado).
 *     tags: [Salones]
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
 *         description: Salón eliminado.
 *       401/403:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Salón no encontrado.
 */
router.delete('/:id', authMiddleware, authorize([1, 2]), salonController.delete);

module.exports = router;
