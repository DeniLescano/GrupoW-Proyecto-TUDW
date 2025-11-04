const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para notificaciones
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class NotificacionController {
  /**
   * Obtener notificaciones del usuario actual
   * GET /api/v1/notificaciones
   */
  async browse(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }

      const userId = req.user.usuario_id || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      
      const notificaciones = await notificationService.getUserNotifications(userId, limit);
      
      res.json(successResponse(notificaciones, null, { total: notificaciones.length }));
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      const { response, statusCode } = errorResponse('Error al obtener notificaciones', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener cantidad de notificaciones no leídas
   * GET /api/v1/notificaciones/unread
   */
  async getUnreadCount(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }

      const userId = req.user.usuario_id || req.user.id;
      const count = await notificationService.getUnreadCount(userId);
      
      res.json(successResponse({ count }));
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
      const { response, statusCode } = errorResponse('Error al obtener contador de notificaciones', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Marcar notificación como leída
   * PATCH /api/v1/notificaciones/:id/read
   */
  async markAsRead(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }

      const { id } = req.params;
      const userId = req.user.usuario_id || req.user.id;
      
      const marked = await notificationService.markAsRead(id, userId);
      
      if (!marked) {
        const { response, statusCode } = errorResponse('Notificación no encontrada', null, 404);
        return res.status(statusCode).json(response);
      }
      
      res.json(successResponse(null, 'Notificación marcada como leída'));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      const { response, statusCode } = errorResponse('Error al marcar notificación como leída', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   * PATCH /api/v1/notificaciones/read-all
   */
  async markAllAsRead(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }

      const userId = req.user.usuario_id || req.user.id;
      const count = await notificationService.markAllAsRead(userId);
      
      res.json(successResponse({ count }, 'Todas las notificaciones marcadas como leídas'));
    } catch (error) {
      console.error('Error al marcar todas las notificaciones:', error);
      const { response, statusCode } = errorResponse('Error al marcar todas las notificaciones como leídas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new NotificacionController();
