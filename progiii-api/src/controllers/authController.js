const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para autenticación
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class AuthController {
  /**
   * Iniciar sesión
   * POST /api/v1/auth/login
   */
  async login(req, res) {
    try {
      const { nombre_usuario, contrasenia } = req.body;

      const result = await authService.login(nombre_usuario, contrasenia);

      res.json(successResponse({
        token: result.token,
        usuario: result.usuario
      }, 'Login exitoso'));
    } catch (error) {
      if (error.message === 'Usuario y contraseña son requeridos' || 
          error.message === 'Usuario o contraseña incorrectos' ||
          error.message === 'Usuario desactivado') {
        const statusCode = error.message === 'Usuario desactivado' ? 403 : 401;
        const { response } = errorResponse(error.message, null, statusCode);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error en login:', error);
      const { response, statusCode } = errorResponse('Error al iniciar sesión', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Verificar token
   * GET /api/v1/auth/verify
   */
  async verifyToken(req, res) {
    try {
      const result = await authService.verifyToken(req.user);
      res.json(successResponse(result));
    } catch (error) {
      console.error('Error al verificar token:', error);
      const { response, statusCode } = errorResponse('Error al verificar token', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new AuthController();
