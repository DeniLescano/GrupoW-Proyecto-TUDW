const comentarioService = require('../services/comentarioService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para comentarios de reservas
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ComentarioController {
  /**
   * Obtener todos los comentarios de una reserva
   * GET /api/v1/reservas/:reservaId/comentarios
   */
  async getComentarios(req, res) {
    try {
      const { reservaId } = req.params;
      
      const comentarios = await comentarioService.getComentariosByReservaId(reservaId);
      res.json(successResponse(comentarios));
    } catch (error) {
      if (error.message.includes('inválido')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener comentarios:', error);
      const { response, statusCode } = errorResponse('Error al obtener los comentarios', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Crear un nuevo comentario
   * POST /api/v1/reservas/:reservaId/comentarios
   */
  async createComentario(req, res) {
    try {
      const { reservaId } = req.params;
      const { comentario } = req.body;
      
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }
      
      const nuevoComentario = await comentarioService.createComentario({
        reserva_id: reservaId,
        usuario_id: req.user.usuario_id,
        comentario
      });
      
      res.status(201).json(successResponse(nuevoComentario, 'Comentario creado exitosamente'));
    } catch (error) {
      if (error.message.includes('requerido') || 
          error.message.includes('inválido') ||
          error.message.includes('exceder') ||
          error.message.includes('vacío')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al crear comentario:', error);
      const { response, statusCode } = errorResponse('Error al crear el comentario', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Actualizar un comentario
   * PUT /api/v1/comentarios/:id
   */
  async updateComentario(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;
      
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }
      
      const comentarioActualizado = await comentarioService.updateComentario(id, comentario, req.user.usuario_id);
      
      res.json(successResponse(comentarioActualizado, 'Comentario actualizado exitosamente'));
    } catch (error) {
      if (error.message.includes('requerido') || 
          error.message.includes('inválido') ||
          error.message.includes('exceder') ||
          error.message.includes('vacío') ||
          error.message.includes('No tienes permisos') ||
          error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('No tienes permisos') ? 403 : 
                          error.message.includes('no encontrado') ? 404 : 400;
        const { response } = errorResponse(error.message, null, statusCode);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al actualizar comentario:', error);
      const { response, statusCode } = errorResponse('Error al actualizar el comentario', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar un comentario
   * DELETE /api/v1/comentarios/:id
   */
  async deleteComentario(req, res) {
    try {
      const { id } = req.params;
      
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }
      
      await comentarioService.deleteComentario(id, req.user.usuario_id);
      
      res.json(successResponse(null, 'Comentario eliminado exitosamente'));
    } catch (error) {
      if (error.message.includes('inválido') ||
          error.message.includes('No tienes permisos') ||
          error.message.includes('no encontrado')) {
        const statusCode = error.message.includes('No tienes permisos') ? 403 : 
                          error.message.includes('no encontrado') ? 404 : 400;
        const { response } = errorResponse(error.message, null, statusCode);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar comentario:', error);
      const { response, statusCode } = errorResponse('Error al eliminar el comentario', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new ComentarioController();

