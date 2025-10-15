const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios (protegido por roles)
 */

// All user routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista los usuarios. Los Admins ven todos, los Empleados solo ven Clientes.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autorizado (token inválido o no provisto)
 *       403:
 *         description: Prohibido (no tiene el rol adecuado)
 */
router.get('/', authorize([1, 2]), usuarioController.browse);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID (Solo Admins).
 *     tags: [Usuarios]
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
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', authorize([1]), usuarioController.read);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualiza un usuario por ID (Solo Admins).
 *     tags: [Usuarios]
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
 *               nombre: 
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *               tipo_usuario:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', authorize([1]), usuarioController.edit);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Elimina (soft delete) un usuario por ID (Solo Admins).
 *     tags: [Usuarios]
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
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', authorize([1]), usuarioController.delete);

module.exports = router;
