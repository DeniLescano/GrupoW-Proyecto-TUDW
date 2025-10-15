const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../middlewares/validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y registro de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre: 
 *                 type: string
 *               apellido:
 *                 type: string
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *               contrasenia:
 *                 type: string
 *                 format: password
 *               tipo_usuario:
 *                 type: integer
 *                 description: "Opcional. Por defecto es 3 (Cliente)."
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: El nombre de usuario ya existe
 */
router.post('/register', registerValidator, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y obtiene un token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_usuario
 *               - contrasenia
 *             properties:
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *               contrasenia:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token de acceso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginValidator, authController.login);

module.exports = router;