const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const {
  createSalonValidator,
  updateSalonValidator,
  getSalonValidator,
  deleteSalonValidator
} = require('../validators/salonValidator');
const { listCache, invalidateCacheAfterWrite } = require('../middlewares/cache');

/**
 * @swagger
 * /salones:
 *   get:
 *     summary: Obtener lista de salones activos
 *     tags: [Salones]
 *     parameters:
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Si es true, devuelve todos los salones (incluye inactivos). Requiere autenticación.
 *     responses:
 *       200:
 *         description: Lista de salones
 */
router.get('/', listCache, salonController.browse);

/**
 * @swagger
 * /salones/disponibilidad:
 *   get:
 *     summary: Verificar disponibilidad de salones en una fecha/turno
 *     tags: [Salones]
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha a verificar (YYYY-MM-DD)
 *       - in: query
 *         name: turno_id
 *         schema:
 *           type: integer
 *         description: ID del turno (opcional)
 *     responses:
 *       200:
 *         description: Lista de salones disponibles
 */
router.get('/disponibilidad', listCache, salonController.disponibilidad);

/**
 * @swagger
 * /salones/{id}:
 *   get:
 *     summary: Obtener un salón por ID
 *     tags: [Salones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón
 *     responses:
 *       200:
 *         description: Salón encontrado
 *       404:
 *         description: Salón no encontrado
 */
router.get('/:id', listCache, getSalonValidator, handleValidationErrors, salonController.read);

/**
 * @swagger
 * /salones:
 *   post:
 *     summary: Crear un nuevo salón
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Salon'
 *     responses:
 *       201:
 *         description: Salón creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', invalidateCacheAfterWrite('salones'), authenticateToken, authorizeRoles('empleado', 'administrador'), createSalonValidator, handleValidationErrors, salonController.add);

/**
 * @swagger
 * /salones/{id}:
 *   put:
 *     summary: Actualizar un salón
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Salon'
 *     responses:
 *       200:
 *         description: Salón actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Salón no encontrado
 */
router.put('/:id', invalidateCacheAfterWrite('salones'), authenticateToken, authorizeRoles('empleado', 'administrador'), updateSalonValidator, handleValidationErrors, salonController.edit);

/**
 * @swagger
 * /salones/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un salón
 *     tags: [Salones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del salón
 *     responses:
 *       200:
 *         description: Salón eliminado exitosamente
 *       404:
 *         description: Salón no encontrado
 */
router.delete('/:id', invalidateCacheAfterWrite('salones'), authenticateToken, authorizeRoles('empleado', 'administrador'), deleteSalonValidator, handleValidationErrors, salonController.delete);

module.exports = router;
