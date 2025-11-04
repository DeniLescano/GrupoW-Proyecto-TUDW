const db = require('../config/database');

/**
 * Repository para acceso a datos de Usuarios
 * Contiene solo consultas SQL, sin lógica de negocio
 */
class UsuarioRepository {
  /**
   * Obtener todos los usuarios
   * @param {boolean} includeInactive - Si incluir usuarios inactivos
   * @returns {Promise<Array>} Array de usuarios
   */
  async findAll(includeInactive = false) {
    let query = 'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, creado, modificado FROM usuarios';
    
    if (!includeInactive) {
      query += ' WHERE activo = 1';
    }
    
    const [usuarios] = await db.query(query);
    return usuarios;
  }

  /**
   * Obtener un usuario por ID
   * @param {number} id - ID del usuario
   * @param {boolean} includeInactive - Si incluir usuarios inactivos
   * @returns {Promise<Object|null>} Usuario o null si no existe
   */
  async findById(id, includeInactive = false) {
    let query = 'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, foto, creado, modificado FROM usuarios WHERE usuario_id = ?';
    
    if (!includeInactive) {
      query += ' AND activo = 1';
    }
    
    const [usuarios] = await db.query(query, [id]);
    
    if (usuarios.length === 0) {
      return null;
    }
    
    return usuarios[0];
  }

  /**
   * Obtener un usuario por nombre de usuario
   * @param {string} nombreUsuario - Nombre de usuario
   * @returns {Promise<Object|null>} Usuario o null si no existe
   */
  async findByNombreUsuario(nombreUsuario) {
    const [usuarios] = await db.query(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, activo, celular, foto FROM usuarios WHERE nombre_usuario = ?',
      [nombreUsuario]
    );
    
    if (usuarios.length === 0) {
      return null;
    }
    
    return usuarios[0];
  }

  /**
   * Verificar si existe un usuario por nombre de usuario
   * @param {string} nombreUsuario - Nombre de usuario
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async existsByNombreUsuario(nombreUsuario) {
    const [result] = await db.query(
      'SELECT usuario_id FROM usuarios WHERE nombre_usuario = ?',
      [nombreUsuario]
    );
    
    return result.length > 0;
  }

  /**
   * Crear un nuevo usuario
   * @param {Object} usuarioData - Datos del usuario
   * @param {string} usuarioData.nombre - Nombre
   * @param {string} usuarioData.apellido - Apellido
   * @param {string} usuarioData.nombre_usuario - Nombre de usuario
   * @param {string} usuarioData.contrasenia - Contraseña hasheada
   * @param {number} usuarioData.tipo_usuario - Tipo de usuario (1=Cliente, 2=Empleado, 3=Admin)
   * @param {string|null} usuarioData.celular - Celular (opcional)
   * @param {string|null} usuarioData.foto - Foto (opcional)
   * @returns {Promise<number>} ID del usuario creado
   */
  async create(usuarioData) {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = usuarioData;
    
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario || 1, celular || null, foto || null]
    );
    
    return result.insertId;
  }

  /**
   * Actualizar un usuario
   * @param {number} id - ID del usuario
   * @param {Object} usuarioData - Datos a actualizar
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async update(id, usuarioData) {
    const { nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, foto } = usuarioData;
    
    const sql = 'UPDATE usuarios SET nombre = ?, apellido = ?, nombre_usuario = ?, tipo_usuario = ?, celular = ?, activo = ?, foto = ? WHERE usuario_id = ?';
    const params = [nombre, apellido, nombre_usuario, tipo_usuario, celular || null, activo !== undefined ? activo : 1, foto || null, id];
    
    const [result] = await db.query(sql, params);
    
    return result.affectedRows > 0;
  }

  /**
   * Actualizar solo el estado activo de un usuario
   * @param {number} id - ID del usuario
   * @param {boolean} activo - Estado activo
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async updateStatus(id, activo) {
    const [result] = await db.query(
      'UPDATE usuarios SET activo = ? WHERE usuario_id = ?',
      [activo, id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Eliminar (soft delete) un usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async delete(id) {
    const [result] = await db.query(
      'UPDATE usuarios SET activo = 0 WHERE usuario_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = new UsuarioRepository();

