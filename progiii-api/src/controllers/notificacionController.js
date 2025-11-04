const notificationService = require('../services/notificationService');

/**
 * Controlador para notificaciones
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class NotificacionController {
  /**
   * Obtener notificaciones del usuario actual
   * GET /api/notificaciones
   */
  async browse(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const userId = req.user.usuario_id || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      
      const notificaciones = await notificationService.getUserNotifications(userId, limit);
      
      res.json({
        success: true,
        data: notificaciones,
        total: notificaciones.length
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener notificaciones'
      });
    }
  }

  /**
   * Obtener cantidad de notificaciones no leídas
   * GET /api/notificaciones/unread
   */
  async getUnreadCount(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const userId = req.user.usuario_id || req.user.id;
      const count = await notificationService.getUnreadCount(userId);
      
      res.json({
        success: true,
        count
      });
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener contador de notificaciones'
      });
    }
  }

  /**
   * Marcar notificación como leída
   * PATCH /api/notificaciones/:id/read
   */
  async markAsRead(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { id } = req.params;
      const userId = req.user.usuario_id || req.user.id;
      
      const marked = await notificationService.markAsRead(id, userId);
      
      if (!marked) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }
      
      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      res.status(500).json({
        success: false,
        error: 'Error al marcar notificación como leída'
      });
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   * PATCH /api/notificaciones/read-all
   */
  async markAllAsRead(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const userId = req.user.usuario_id || req.user.id;
      const count = await notificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
        count
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al marcar todas las notificaciones como leídas'
      });
    }
  }
}

module.exports = new NotificacionController();
