const authService = require('../services/authService');

/**
 * Controlador para autenticación
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class AuthController {
  /**
   * Iniciar sesión
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { nombre_usuario, contrasenia } = req.body;

      const result = await authService.login(nombre_usuario, contrasenia);

      res.json({
        message: 'Login exitoso',
        token: result.token,
        usuario: result.usuario
      });
    } catch (error) {
      if (error.message === 'Usuario y contraseña son requeridos' || 
          error.message === 'Usuario o contraseña incorrectos' ||
          error.message === 'Usuario desactivado') {
        const statusCode = error.message === 'Usuario desactivado' ? 403 : 401;
        return res.status(statusCode).json({ message: error.message });
      }
      
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  }

  /**
   * Verificar token
   * GET /api/auth/verify
   */
  async verifyToken(req, res) {
    try {
      const result = await authService.verifyToken(req.user);
      res.json(result);
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(500).json({ message: 'Error al verificar token', error: error.message });
    }
  }
}

module.exports = new AuthController();
