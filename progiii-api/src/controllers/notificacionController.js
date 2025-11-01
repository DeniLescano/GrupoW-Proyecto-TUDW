const NotificationService = require('../services/notificationService');

class NotificacionController {
  /**
   * Obtener notificaciones del usuario autenticado
   */
  async browse(req, res) {
    try {
      const userId = req.user.usuario_id || req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      
      const notificaciones = await NotificationService.getUserNotifications(userId, limit);
      
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
   * Marcar notificación como leída
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.usuario_id || req.user.id;
      
      await NotificationService.markAsRead(id, userId);
      
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
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.usuario_id || req.user.id;
      
      await NotificationService.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas'
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al marcar todas las notificaciones como leídas'
      });
    }
  }

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.usuario_id || req.user.id;
      const db = require('../config/database');
      
      const [result] = await db.query(
        `SELECT COUNT(*) as count FROM notificaciones 
         WHERE usuario_id = ? AND leida = 0`,
        [userId]
      );
      
      res.json({
        success: true,
        count: result[0].count
      });
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener contador de notificaciones'
      });
    }
  }
}

module.exports = new NotificacionController();

