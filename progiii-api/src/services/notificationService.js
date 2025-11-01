// Servicio de notificaciones automáticas
const db = require('../config/database');

class NotificationService {
  /**
   * Enviar notificación cuando se crea una reserva
   */
  static async notifyReservaCreated(reservaId, clienteId) {
    try {
      // Obtener información de la reserva
      const [reserva] = await db.query(
        `SELECT r.*, s.titulo as salon_nombre, t.hora_desde, t.hora_hasta, u.nombre as cliente_nombre, u.apellido as cliente_apellido
         FROM reservas r
         JOIN salones s ON r.salon_id = s.salon_id
         JOIN turnos t ON r.turno_id = t.turno_id
         JOIN usuarios u ON r.usuario_id = u.usuario_id
         WHERE r.reserva_id = ?`,
        [reservaId]
      );

      if (reserva.length === 0) return;

      const reservaData = reserva[0];
      
      // Guardar notificación en base de datos para el cliente
      await db.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [
          clienteId,
          'reserva_creada',
          'Reserva Creada',
          `Su reserva en ${reservaData.salon_nombre} para el ${reservaData.fecha_reserva} de ${reservaData.hora_desde} a ${reservaData.hora_hasta} ha sido creada. Estado: ${reservaData.estado || 'pendiente'}.`
        ]
      );

      // Notificar a empleados y administradores
      const [empleados] = await db.query(
        `SELECT usuario_id FROM usuarios WHERE tipo_usuario IN (2, 3) AND activo = 1`
      );

      for (const empleado of empleados) {
        await db.query(
          `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
           VALUES (?, ?, ?, ?, 0, NOW())`,
          [
            empleado.usuario_id,
            'nueva_reserva',
            'Nueva Reserva',
            `Se ha creado una nueva reserva en ${reservaData.salon_nombre} para el ${reservaData.fecha_reserva} por ${reservaData.cliente_nombre} ${reservaData.cliente_apellido}.`
          ]
        );
      }

      console.log(`✅ Notificaciones enviadas para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificaciones de reserva creada:', error);
    }
  }

  /**
   * Enviar notificación cuando se confirma una reserva
   */
  static async notifyReservaConfirmed(reservaId) {
    try {
      const [reserva] = await db.query(
        `SELECT r.*, s.titulo as salon_nombre, t.hora_desde, t.hora_hasta, u.nombre as cliente_nombre, u.apellido as cliente_apellido
         FROM reservas r
         JOIN salones s ON r.salon_id = s.salon_id
         JOIN turnos t ON r.turno_id = t.turno_id
         JOIN usuarios u ON r.usuario_id = u.usuario_id
         WHERE r.reserva_id = ?`,
        [reservaId]
      );

      if (reserva.length === 0) return;

      const reservaData = reserva[0];
      
      // Notificar al cliente que su reserva fue confirmada
      await db.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [
          reservaData.usuario_id,
          'reserva_confirmada',
          'Reserva Confirmada',
          `Su reserva en ${reservaData.salon_nombre} para el ${reservaData.fecha_reserva} de ${reservaData.hora_desde} a ${reservaData.hora_hasta} ha sido CONFIRMADA. ¡Ya puede confirmar su asistencia!`
        ]
      );

      console.log(`✅ Notificación de confirmación enviada para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificación de confirmación:', error);
    }
  }

  /**
   * Enviar notificación cuando se actualiza una reserva
   */
  static async notifyReservaUpdated(reservaId, cambios) {
    try {
      const [reserva] = await db.query(
        `SELECT r.*, s.titulo as salon_nombre, u.nombre as cliente_nombre, u.apellido as cliente_apellido
         FROM reservas r
         JOIN salones s ON r.salon_id = s.salon_id
         JOIN usuarios u ON r.usuario_id = u.usuario_id
         WHERE r.reserva_id = ?`,
        [reservaId]
      );

      if (reserva.length === 0) return;

      const reservaData = reserva[0];
      
      await db.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [
          reservaData.usuario_id,
          'reserva_actualizada',
          'Reserva Actualizada',
          `Su reserva en ${reservaData.salon_nombre} ha sido actualizada. ${cambios || ''}`
        ]
      );

      console.log(`✅ Notificación de actualización enviada para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificación de actualización:', error);
    }
  }

  /**
   * Enviar notificación cuando se cancela una reserva
   */
  static async notifyReservaCancelled(reservaId) {
    try {
      const [reserva] = await db.query(
        `SELECT r.*, s.titulo as salon_nombre, u.nombre as cliente_nombre, u.apellido as cliente_apellido
         FROM reservas r
         JOIN salones s ON r.salon_id = s.salon_id
         JOIN usuarios u ON r.usuario_id = u.usuario_id
         WHERE r.reserva_id = ?`,
        [reservaId]
      );

      if (reserva.length === 0) return;

      const reservaData = reserva[0];
      
      await db.query(
        `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
         VALUES (?, ?, ?, ?, 0, NOW())`,
        [
          reservaData.usuario_id,
          'reserva_cancelada',
          'Reserva Cancelada',
          `Su reserva en ${reservaData.salon_nombre} para el ${reservaData.fecha_reserva} ha sido cancelada.`
        ]
      );

      console.log(`✅ Notificación de cancelación enviada para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificación de cancelación:', error);
    }
  }

  /**
   * Enviar notificación de recordatorio de reserva
   */
  static async notifyReservaReminder() {
    try {
      // Obtener reservas del día siguiente
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fechaFormato = tomorrow.toISOString().split('T')[0];

      const [reservas] = await db.query(
        `SELECT r.*, s.titulo as salon_nombre, t.hora_desde, t.hora_hasta, u.nombre as cliente_nombre, u.usuario_id as cliente_id
         FROM reservas r
         JOIN salones s ON r.salon_id = s.salon_id
         JOIN turnos t ON r.turno_id = t.turno_id
         JOIN usuarios u ON r.usuario_id = u.usuario_id
         WHERE r.fecha_reserva = ? AND r.activo = 1 AND (r.estado = 'confirmada' OR r.estado IS NULL)
         `,
        [fechaFormato]
      );

      for (const reserva of reservas) {
        // Verificar si ya se envió recordatorio
        const [existentes] = await db.query(
          `SELECT id FROM notificaciones 
           WHERE usuario_id = ? AND tipo = 'recordatorio_reserva' 
           AND DATE(fecha_creacion) = CURDATE() 
           AND mensaje LIKE ?`,
          [reserva.cliente_id, `%Reserva ${reserva.reserva_id}%`]
        );

        if (existentes.length === 0) {
          await db.query(
            `INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, leida, fecha_creacion)
             VALUES (?, ?, ?, ?, 0, NOW())`,
            [
              reserva.cliente_id,
              'recordatorio_reserva',
              'Recordatorio de Reserva',
              `Recuerde que tiene una reserva mañana en ${reserva.salon_nombre} a las ${reserva.hora_desde}.`
            ]
          );
        }
      }

      console.log(`✅ Recordatorios enviados para ${reservas.length} reservas`);
    } catch (error) {
      console.error('❌ Error al enviar recordatorios:', error);
    }
  }

  /**
   * Obtener notificaciones de un usuario
   */
  static async getUserNotifications(userId, limit = 20) {
    try {
      const [notificaciones] = await db.query(
        `SELECT * FROM notificaciones 
         WHERE usuario_id = ? 
         ORDER BY fecha_creacion DESC 
         LIMIT ?`,
        [userId, limit]
      );

      return notificaciones;
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(notificacionId, userId) {
    try {
      await db.query(
        `UPDATE notificaciones SET leida = 1 
         WHERE id = ? AND usuario_id = ?`,
        [notificacionId, userId]
      );
    } catch (error) {
      console.error('❌ Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(userId) {
    try {
      await db.query(
        `UPDATE notificaciones SET leida = 1 
         WHERE usuario_id = ? AND leida = 0`,
        [userId]
      );
    } catch (error) {
      console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
