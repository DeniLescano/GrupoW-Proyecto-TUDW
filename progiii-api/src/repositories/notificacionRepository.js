const db = require('../config/database');

/**
 * Repository para acceso a datos de Notificaciones
 * Contiene solo consultas SQL, sin lógica de negocio
 */
class NotificacionRepository {
  /**
   * Obtener todas las notificaciones de un usuario
   * @param {number} usuarioId - ID del usuario
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Array de notificaciones
   */
  async findByUsuarioId(usuarioId, limit = 20) {
    const [notificaciones] = await db.query(
      `SELECT * FROM notificaciones 
       WHERE usuario_id = ? 
       ORDER BY fecha_creacion DESC 
       LIMIT ?`,
      [usuarioId, limit]
    );
    
    return notificaciones;
  }

  /**
   * Crear una nueva notificación
   * @param {Object} notificacionData - Datos de la notificación
   * @param {number} notificacionData.usuario_id - ID del usuario
   * @param {string} notificacionData.tipo - Tipo de notificación
   * @param {string} notificacionData.titulo - Título
   * @param {string} notificacionData.mensaje - Mensaje
   * @returns {Promise<number>} ID de la notificación creada
   */
  async create(notificacionData) {
    const { usuario_id, tipo, titulo, mensaje } = notificacionData;
    
    const [result] = await db.query(
      `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [usuario_id, tipo, titulo, mensaje]
    );
    
    return result.insertId;
  }

  /**
   * Marcar una notificación como leída
   * @param {number} notificacionId - ID de la notificación
   * @param {number} usuarioId - ID del usuario (para validación)
   * @returns {Promise<boolean>} true si se actualizó, false si no
   */
  async markAsRead(notificacionId, usuarioId) {
    const [result] = await db.query(
      `UPDATE notificaciones SET leida = 1 
       WHERE id = ? AND usuario_id = ?`,
      [notificacionId, usuarioId]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<number>} Número de notificaciones actualizadas
   */
  async markAllAsRead(usuarioId) {
    const [result] = await db.query(
      `UPDATE notificaciones SET leida = 1 
       WHERE usuario_id = ? AND leida = 0`,
      [usuarioId]
    );
    
    return result.affectedRows;
  }

  /**
   * Verificar si ya existe una notificación de recordatorio para una reserva hoy
   * @param {number} usuarioId - ID del usuario
   * @param {string} mensajePattern - Patrón del mensaje a buscar
   * @returns {Promise<boolean>} true si existe, false si no
   */
  async existsRecordatorioToday(usuarioId, mensajePattern) {
    const [notificaciones] = await db.query(
      `SELECT id FROM notificaciones 
       WHERE usuario_id = ? AND tipo = 'recordatorio_reserva' 
       AND DATE(fecha_creacion) = CURDATE() 
       AND mensaje LIKE ?`,
      [usuarioId, mensajePattern]
    );
    
    return notificaciones.length > 0;
  }

  /**
   * Obtener todos los empleados y administradores activos
   * @returns {Promise<Array>} Array de usuarios (empleados y administradores)
   */
  async findEmpleadosYAdministradores() {
    const [usuarios] = await db.query(
      `SELECT usuario_id FROM usuarios WHERE tipo_usuario IN (2, 3) AND activo = 1`
    );
    
    return usuarios;
  }
}

module.exports = new NotificacionRepository();

