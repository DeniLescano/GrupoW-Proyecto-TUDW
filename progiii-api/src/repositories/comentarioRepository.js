const db = require('../config/database');

/**
 * Repository para acceso a datos de Comentarios de Reservas
 * Contiene solo consultas SQL, sin lógica de negocio
 */
class ComentarioRepository {
  /**
   * Obtener todos los comentarios de una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<Array>} Array de comentarios
   */
  async findByReservaId(reservaId) {
    const query = `
      SELECT 
        c.comentario_id,
        c.reserva_id,
        c.usuario_id,
        c.comentario,
        c.creado,
        c.modificado,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.nombre_usuario,
        u.tipo_usuario
      FROM comentarios_reservas c
      INNER JOIN usuarios u ON c.usuario_id = u.usuario_id
      WHERE c.reserva_id = ?
      ORDER BY c.creado DESC
    `;
    
    const [comentarios] = await db.query(query, [reservaId]);
    return comentarios;
  }

  /**
   * Crear un nuevo comentario
   * @param {Object} comentarioData - Datos del comentario
   * @param {number} comentarioData.reserva_id - ID de la reserva
   * @param {number} comentarioData.usuario_id - ID del usuario (administrador)
   * @param {string} comentarioData.comentario - Texto del comentario
   * @returns {Promise<Object>} Comentario creado
   */
  async create(comentarioData) {
    const { reserva_id, usuario_id, comentario } = comentarioData;
    
    const query = `
      INSERT INTO comentarios_reservas (reserva_id, usuario_id, comentario, creado, modificado)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await db.query(query, [reserva_id, usuario_id, comentario]);
    
    // Obtener el comentario creado con información del usuario
    const querySelect = `
      SELECT 
        c.comentario_id,
        c.reserva_id,
        c.usuario_id,
        c.comentario,
        c.creado,
        c.modificado,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.nombre_usuario,
        u.tipo_usuario
      FROM comentarios_reservas c
      INNER JOIN usuarios u ON c.usuario_id = u.usuario_id
      WHERE c.comentario_id = ?
    `;
    
    const [comentarios] = await db.query(querySelect, [result.insertId]);
    return comentarios[0];
  }

  /**
   * Actualizar un comentario
   * @param {number} id - ID del comentario
   * @param {string} comentario - Nuevo texto del comentario
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async update(id, comentario) {
    const query = `
      UPDATE comentarios_reservas 
      SET comentario = ?, modificado = NOW()
      WHERE comentario_id = ?
    `;
    
    const [result] = await db.query(query, [comentario, id]);
    return result.affectedRows > 0;
  }

  /**
   * Eliminar un comentario
   * @param {number} id - ID del comentario
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async delete(id) {
    const query = 'DELETE FROM comentarios_reservas WHERE comentario_id = ?';
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Obtener un comentario por ID
   * @param {number} id - ID del comentario
   * @returns {Promise<Object|null>} Comentario o null si no existe
   */
  async findById(id) {
    const query = `
      SELECT 
        c.comentario_id,
        c.reserva_id,
        c.usuario_id,
        c.comentario,
        c.creado,
        c.modificado,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.nombre_usuario,
        u.tipo_usuario
      FROM comentarios_reservas c
      INNER JOIN usuarios u ON c.usuario_id = u.usuario_id
      WHERE c.comentario_id = ?
    `;
    
    const [comentarios] = await db.query(query, [id]);
    return comentarios.length > 0 ? comentarios[0] : null;
  }
}

module.exports = new ComentarioRepository();

