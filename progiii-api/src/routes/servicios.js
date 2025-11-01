const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const {
  createServicioValidator,
  updateServicioValidator,
  getServicioValidator,
  deleteServicioValidator
} = require('../validators/servicioValidator');

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Obtener lista de servicios activos
 *     tags: [Servicios]
 *     responses:
 *       200:
 *         description: Lista de servicios
 */
router.get('/', servicioController.browse);

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     tags: [Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Servicio encontrado
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', getServicioValidator, handleValidationErrors, servicioController.read);

/**
 * @swagger
 * /servicios:
 *   post:
 *     summary: Crear un nuevo servicio
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Servicio'
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', authenticateToken, authorizeRoles('empleado', 'administrador'), createServicioValidator, handleValidationErrors, servicioController.add);

/**
 * @swagger
 * /servicios/{id}:
 *   put:
 *     summary: Actualizar un servicio
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Servicio'
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Servicio no encontrado
 */
router.put('/:id', authenticateToken, authorizeRoles('empleado', 'administrador'), updateServicioValidator, handleValidationErrors, servicioController.edit);

/**
 * @swagger
 * /servicios/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un servicio
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *     responses:
 *       200:
 *         description: Servicio eliminado exitosamente
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/:id', authenticateToken, authorizeRoles('empleado', 'administrador'), deleteServicioValidator, handleValidationErrors, servicioController.delete);

module.exports = router;

