const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');
const { servicioValidator } = require('../middlewares/validator');

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Gestión de servicios adicionales
 */

/**
 * @swagger
 * /api/servicios:
 *   get:
 *     summary: Obtiene una lista de todos los servicios activos.
 *     tags: [Servicios]
 *     responses:
 *       200:
 *         description: Lista de servicios.
 */
router.get('/', servicioController.browse);

/**
 * @swagger
 * /api/servicios/{id}:
 *   get:
 *     summary: Obtiene un servicio por ID.
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del servicio.
 *       404:
 *         description: Servicio no encontrado.
 */
router.get('/:id', servicioController.read);

/**
 * @swagger
 * /api/servicios:
 *   post:
 *     summary: Crea un nuevo servicio (Admin & Empleado).
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *               importe:
 *                 type: number
 *     responses:
 *       201:
 *         description: Servicio creado.
 *       400:
 *         description: Datos inválidos.
 *       401/403:
 *         description: Acceso no autorizado.
 */
router.post('/', authMiddleware, authorize([1, 2]), servicioValidator, servicioController.add);

/**
 * @swagger
 * /api/servicios/{id}:
 *   put:
 *     summary: Actualiza un servicio (Admin & Empleado).
 *     tags: [Servicios]
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
 *               descripcion:
 *                 type: string
 *               importe:
 *                 type: number
 *     responses:
 *       200:
 *         description: Servicio actualizado.
 *       400:
 *         description: Datos inválidos.
 *       401/403:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Servicio no encontrado.
 */
router.put('/:id', authMiddleware, authorize([1, 2]), servicioValidator, servicioController.edit);

/**
 * @swagger
 * /api/servicios/{id}:
 *   delete:
 *     summary: Elimina (soft delete) un servicio (Admin & Empleado).
 *     tags: [Servicios]
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
 *         description: Servicio eliminado.
 *       401/403:
 *         description: Acceso no autorizado.
 *       404:
 *         description: Servicio no encontrado.
 */
router.delete('/:id', authMiddleware, authorize([1, 2]), servicioController.delete);

module.exports = router;