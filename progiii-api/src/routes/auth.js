const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const { loginValidator, registerValidator } = require('../validators/authValidator');
const { strictLimiter, publicLimiter } = require('../middlewares/rateLimiter');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', strictLimiter, loginValidator, handleValidationErrors, authController.login);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido o expirado
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario cliente
 *     tags: [Autenticación]
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
 *                 example: Juan
 *               apellido:
 *                 type: string
 *                 example: Pérez
 *               nombre_usuario:
 *                 type: string
 *                 format: email
 *                 example: juan@example.com
 *               contrasenia:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               celular:
 *                 type: string
 *                 example: +5491123456789
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Error de validación o email ya registrado
 */
router.post('/register', strictLimiter, registerValidator, handleValidationErrors, authController.register);

router.get('/verify', publicLimiter, authenticateToken, authController.verifyToken);

module.exports = router;

