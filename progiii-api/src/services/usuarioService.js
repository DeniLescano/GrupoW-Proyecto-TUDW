const bcrypt = require('bcryptjs');
const usuarioRepository = require('../repositories/usuarioRepository');

/**
 * Servicio para lógica de negocio de Usuarios
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class UsuarioService {
  /**
   * Obtener todos los usuarios
   * @param {boolean} includeInactive - Si incluir usuarios inactivos
   * @returns {Promise<Array>} Array de usuarios
   */
  async getAllUsuarios(includeInactive = false) {
    return await usuarioRepository.findAll(includeInactive);
  }

  /**
   * Obtener un usuario por ID
   * @param {number} id - ID del usuario
   * @param {boolean} includeInactive - Si incluir usuarios inactivos
   * @returns {Promise<Object>} Usuario
   * @throws {Error} Si el usuario no existe
   */
  async getUsuarioById(id, includeInactive = false) {
    const usuario = await usuarioRepository.findById(id, includeInactive);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    return usuario;
  }

  /**
   * Obtener un usuario por nombre de usuario
   * @param {string} nombreUsuario - Nombre de usuario
   * @returns {Promise<Object|null>} Usuario o null
   */
  async getUsuarioByNombreUsuario(nombreUsuario) {
    return await usuarioRepository.findByNombreUsuario(nombreUsuario);
  }

  /**
   * Crear un nuevo usuario
   * @param {Object} usuarioData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   * @throws {Error} Si el nombre de usuario ya existe
   */
  async createUsuario(usuarioData) {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = usuarioData;
    
    // Verificar si el usuario ya existe
    const exists = await usuarioRepository.existsByNombreUsuario(nombre_usuario);
    
    if (exists) {
      throw new Error('El nombre de usuario ya existe');
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasenia, 10);
    
    // Crear usuario
    const usuarioId = await usuarioRepository.create({
      nombre,
      apellido,
      nombre_usuario,
      contrasenia: hashedPassword,
      tipo_usuario: tipo_usuario || 1,
      celular: celular || null,
      foto: foto || null
    });
    
    // Retornar usuario creado (sin contraseña)
    return await usuarioRepository.findById(usuarioId);
  }

  /**
   * Actualizar un usuario
   * @param {number} id - ID del usuario
   * @param {Object} usuarioData - Datos a actualizar
   * @param {number} currentUserId - ID del usuario actual (para validaciones)
   * @returns {Promise<Object>} Usuario actualizado
   * @throws {Error} Si el usuario no existe o se intenta desactivar a sí mismo
   */
  async updateUsuario(id, usuarioData, currentUserId = null) {
    // Prevenir que un usuario se desactive a sí mismo
    if (currentUserId && currentUserId === id && usuarioData.activo === 0) {
      throw new Error('No puedes desactivar tu propio usuario. Si necesitas hacerlo, contacta a otro administrador.');
    }
    
    // Verificar que el usuario existe
    const usuarioExistente = await usuarioRepository.findById(id, true);
    
    if (!usuarioExistente) {
      throw new Error('Usuario no encontrado');
    }
    
    // Si solo se actualiza el estado, usar método específico
    const isStatusUpdateOnly = Object.keys(usuarioData).length === 1 && usuarioData.hasOwnProperty('activo');
    
    if (isStatusUpdateOnly) {
      const updated = await usuarioRepository.updateStatus(id, usuarioData.activo);
      
      if (!updated) {
        throw new Error('Usuario no encontrado para actualizar');
      }
    } else {
      const updated = await usuarioRepository.update(id, usuarioData);
      
      if (!updated) {
        throw new Error('Usuario no encontrado para actualizar');
      }
    }
    
    // Retornar usuario actualizado
    return await usuarioRepository.findById(id);
  }

  /**
   * Eliminar (soft delete) un usuario
   * @param {number} id - ID del usuario
   * @param {number} currentUserId - ID del usuario actual (para validaciones)
   * @returns {Promise<boolean>} true si se eliminó
   * @throws {Error} Si el usuario no existe o se intenta desactivar a sí mismo
   */
  async deleteUsuario(id, currentUserId = null) {
    // Prevenir que un usuario se desactive a sí mismo
    if (currentUserId && currentUserId === id) {
      throw new Error('No puedes desactivar tu propio usuario. Si necesitas hacerlo, contacta a otro administrador.');
    }
    
    const deleted = await usuarioRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Usuario no encontrado para eliminar');
    }
    
    return true;
  }

  /**
   * Verificar contraseña
   * @param {string} plainPassword - Contraseña en texto plano
   * @param {string} hashedPassword - Contraseña hasheada
   * @returns {Promise<boolean>} true si coinciden
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new UsuarioService();

