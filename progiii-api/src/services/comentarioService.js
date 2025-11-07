const comentarioRepository = require('../repositories/comentarioRepository');

/**
 * Servicio para lógica de negocio de Comentarios de Reservas
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class ComentarioService {
  /**
   * Obtener todos los comentarios de una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<Array>} Array de comentarios
   */
  async getComentariosByReservaId(reservaId) {
    if (!reservaId || isNaN(parseInt(reservaId))) {
      throw new Error('ID de reserva inválido');
    }
    
    return await comentarioRepository.findByReservaId(parseInt(reservaId));
  }

  /**
   * Crear un nuevo comentario
   * @param {Object} comentarioData - Datos del comentario
   * @param {number} comentarioData.reserva_id - ID de la reserva
   * @param {number} comentarioData.usuario_id - ID del usuario (administrador)
   * @param {string} comentarioData.comentario - Texto del comentario
   * @returns {Promise<Object>} Comentario creado
   * @throws {Error} Si los datos son inválidos
   */
  async createComentario(comentarioData) {
    const { reserva_id, usuario_id, comentario } = comentarioData;
    
    // Validar campos requeridos
    if (!reserva_id || isNaN(parseInt(reserva_id))) {
      throw new Error('ID de reserva es requerido y debe ser un número válido');
    }
    
    if (!usuario_id || isNaN(parseInt(usuario_id))) {
      throw new Error('ID de usuario es requerido y debe ser un número válido');
    }
    
    if (!comentario || comentario.trim().length === 0) {
      throw new Error('El comentario es requerido y no puede estar vacío');
    }
    
    if (comentario.trim().length > 1000) {
      throw new Error('El comentario no puede exceder 1000 caracteres');
    }
    
    return await comentarioRepository.create({
      reserva_id: parseInt(reserva_id),
      usuario_id: parseInt(usuario_id),
      comentario: comentario.trim()
    });
  }

  /**
   * Actualizar un comentario
   * @param {number} id - ID del comentario
   * @param {string} comentario - Nuevo texto del comentario
   * @param {number} usuarioId - ID del usuario que actualiza (para verificar permisos)
   * @returns {Promise<Object>} Comentario actualizado
   * @throws {Error} Si el comentario no existe o el usuario no tiene permisos
   */
  async updateComentario(id, comentario, usuarioId) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de comentario inválido');
    }
    
    if (!comentario || comentario.trim().length === 0) {
      throw new Error('El comentario es requerido y no puede estar vacío');
    }
    
    if (comentario.trim().length > 1000) {
      throw new Error('El comentario no puede exceder 1000 caracteres');
    }
    
    // Verificar que el comentario existe y pertenece al usuario
    const comentarioExistente = await comentarioRepository.findById(parseInt(id));
    if (!comentarioExistente) {
      throw new Error('Comentario no encontrado');
    }
    
    if (comentarioExistente.usuario_id !== parseInt(usuarioId)) {
      throw new Error('No tienes permisos para actualizar este comentario');
    }
    
    const updated = await comentarioRepository.update(parseInt(id), comentario.trim());
    if (!updated) {
      throw new Error('Error al actualizar el comentario');
    }
    
    return await comentarioRepository.findById(parseInt(id));
  }

  /**
   * Eliminar un comentario
   * @param {number} id - ID del comentario
   * @param {number} usuarioId - ID del usuario que elimina (para verificar permisos)
   * @returns {Promise<boolean>} true si se eliminó
   * @throws {Error} Si el comentario no existe o el usuario no tiene permisos
   */
  async deleteComentario(id, usuarioId) {
    if (!id || isNaN(parseInt(id))) {
      throw new Error('ID de comentario inválido');
    }
    
    // Verificar que el comentario existe y pertenece al usuario
    const comentarioExistente = await comentarioRepository.findById(parseInt(id));
    if (!comentarioExistente) {
      throw new Error('Comentario no encontrado');
    }
    
    if (comentarioExistente.usuario_id !== parseInt(usuarioId)) {
      throw new Error('No tienes permisos para eliminar este comentario');
    }
    
    return await comentarioRepository.delete(parseInt(id));
  }
}

module.exports = new ComentarioService();

