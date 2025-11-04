const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');
const { loginValidator } = require('../validators/authValidator');
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
router.get('/verify', publicLimiter, authenticateToken, authController.verifyToken);

module.exports = router;

