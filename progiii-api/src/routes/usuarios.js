const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const {
  createUsuarioValidator,
  updateUsuarioValidator,
  getUsuarioValidator,
  deleteUsuarioValidator
} = require('../validators/usuarioValidator');
const { listCache, invalidateCacheAfterWrite } = require('../middlewares/cache');

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
const filterClientesForEmpleados = (req, res, next) => {
  if (req.user.tipo_usuario === 2) { // Si el usuario es empleado
    req.query.tipo_usuario = '1'; // Forzar filtro por clientes
  }
  next();
};

router.get('/', listCache, authenticateToken, authorizeRoles('administrador', 'empleado'), filterClientesForEmpleados, usuarioController.browse);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', listCache, authenticateToken, authorizeRoles('administrador', 'empleado'), getUsuarioValidator, handleValidationErrors, usuarioController.read);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post('/', invalidateCacheAfterWrite('usuarios'), authenticateToken, authorizeRoles('administrador'), createUsuarioValidator, handleValidationErrors, usuarioController.add);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', invalidateCacheAfterWrite('usuarios'), authenticateToken, authorizeRoles('administrador'), updateUsuarioValidator, handleValidationErrors, usuarioController.edit);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', invalidateCacheAfterWrite('usuarios'), authenticateToken, authorizeRoles('administrador'), deleteUsuarioValidator, handleValidationErrors, usuarioController.delete);

/**
 * @swagger
 * /usuarios/{id}/permanent:
 *   delete:
 *     summary: Eliminar definitivamente (hard delete) un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado definitivamente
 *       403:
 *         description: No se puede eliminar un usuario activo o es el usuario actual
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id/permanent', invalidateCacheAfterWrite('usuarios'), authenticateToken, authorizeRoles('administrador'), deleteUsuarioValidator, handleValidationErrors, usuarioController.permanentDelete);

module.exports = router;
