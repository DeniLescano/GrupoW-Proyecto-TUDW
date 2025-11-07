const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const { updateUsuarioValidator } = require('../validators/usuarioValidator');
const { invalidateCacheAfterWrite } = require('../middlewares/cache');

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Obtener mi perfil de usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mi perfil de usuario
 *       401:
 *         description: No autenticado
 */
router.get('/', authenticateToken, usuarioController.readMe);

/**
 * @swagger
 * /me:
 *   put:
 *     summary: Actualizar mi perfil de usuario
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
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Error de validación
 */
router.put('/', invalidateCacheAfterWrite('usuarios'), authenticateToken, updateUsuarioValidator, handleValidationErrors, usuarioController.editMe);

module.exports = router;
