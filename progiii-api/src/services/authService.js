const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const bcrypt = require('bcryptjs');

/**
 * Servicio para lógica de negocio de Autenticación
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class AuthService {
  /**
   * Iniciar sesión (login)
   * @param {string} nombreUsuario - Nombre de usuario
   * @param {string} contrasenia - Contraseña en texto plano
   * @returns {Promise<Object>} Objeto con token y datos del usuario
   * @throws {Error} Si las credenciales son incorrectas o el usuario está inactivo
   */
  async login(nombreUsuario, contrasenia) {
    if (!nombreUsuario || !contrasenia) {
      throw new Error('Usuario y contraseña son requeridos');
    }
    
    // Buscar usuario
    const usuario = await usuarioRepository.findByNombreUsuario(nombreUsuario);
    
    if (!usuario) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    
    // Verificar si está activo
    if (usuario.activo !== 1) {
      throw new Error('Usuario desactivado');
    }
    
    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contrasenia, usuario.contrasenia);
    
    if (!passwordMatch) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    
    // Generar token JWT
    const token = jwt.sign(
      {
        usuario_id: usuario.usuario_id,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido
      },
      process.env.JWT_SECRET || 'tu_secret_key_super_seguro_cambiar_en_produccion',
      { expiresIn: '24h' }
    );
    
    // Retornar token y datos del usuario (sin contraseña)
    return {
      token,
      usuario: {
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario
      }
    };
  }

  /**
   * Verificar token (usado para verificar si el usuario sigue autenticado)
   * @param {Object} user - Datos del usuario del token decodificado
   * @returns {Promise<Object>} Objeto con datos del usuario y validación
   */
  async verifyToken(user) {
    return {
      usuario: user,
      valid: true
    };
  }
}

module.exports = new AuthService();

