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
      { expiresIn: '15m' }
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

  /**
   * Registrar nuevo usuario cliente
   * @param {Object} usuarioData - Datos del usuario
   * @param {string} usuarioData.nombre - Nombre del usuario
   * @param {string} usuarioData.apellido - Apellido del usuario
   * @param {string} usuarioData.nombre_usuario - Email del usuario
   * @param {string} usuarioData.contrasenia - Contraseña en texto plano
   * @param {string} [usuarioData.celular] - Celular del usuario (opcional)
   * @returns {Promise<Object>} Objeto con token y datos del usuario
   * @throws {Error} Si el usuario ya existe o hay error en la creación
   */
  async register(usuarioData) {
    const { nombre, apellido, nombre_usuario, contrasenia, celular } = usuarioData;
    
    // Validar campos requeridos
    if (!nombre || !apellido || !nombre_usuario || !contrasenia) {
      throw new Error('Todos los campos son requeridos');
    }
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await usuarioRepository.findByNombreUsuario(nombre_usuario);
    if (usuarioExistente) {
      throw new Error('El email ya está registrado');
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasenia, 10);
    
    // Crear usuario (tipo_usuario = 1 para cliente)
    const nuevoUsuario = await usuarioRepository.create({
      nombre,
      apellido,
      nombre_usuario,
      contrasenia: hashedPassword,
      tipo_usuario: 1, // Cliente
      celular: celular || null,
      activo: 1
    });
    
    // Generar token JWT
    const token = jwt.sign(
      {
        usuario_id: nuevoUsuario.usuario_id,
        nombre_usuario: nuevoUsuario.nombre_usuario,
        tipo_usuario: nuevoUsuario.tipo_usuario,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido
      },
      process.env.JWT_SECRET || 'tu_secret_key_super_seguro_cambiar_en_produccion',
      { expiresIn: '15m' }
    );
    
    // Retornar token y datos del usuario (sin contraseña)
    return {
      token,
      usuario: {
        usuario_id: nuevoUsuario.usuario_id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        nombre_usuario: nuevoUsuario.nombre_usuario,
        tipo_usuario: nuevoUsuario.tipo_usuario
      }
    };
  }
}

module.exports = new AuthService();

