const reservaRepository = require('../repositories/reservaRepository');
const notificacionRepository = require('../repositories/notificacionRepository');

/**
 * Servicio para lógica de negocio de Notificaciones
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class NotificationService {
  /**
   * Enviar notificación cuando se crea una reserva
   * @param {number} reservaId - ID de la reserva
   * @param {number} clienteId - ID del cliente
   * @returns {Promise<void>}
   */
  async notifyReservaCreated(reservaId, clienteId) {
    try {
      // Obtener información de la reserva
      const reserva = await reservaRepository.findById(reservaId);
      
      if (!reserva) {
        return;
      }
      
      // Guardar notificación en base de datos para el cliente
      await notificacionRepository.create({
        usuario_id: clienteId,
        tipo: 'reserva_creada',
        titulo: 'Reserva Creada',
        mensaje: `Su reserva en ${reserva.salon_titulo} para el ${reserva.fecha_reserva} de ${reserva.hora_desde} a ${reserva.hora_hasta} ha sido creada. Estado: ${reserva.estado || 'pendiente'}.`
      });
      
      // Notificar a empleados y administradores
      const empleados = await notificacionRepository.findEmpleadosYAdministradores();
      
      for (const empleado of empleados) {
        await notificacionRepository.create({
          usuario_id: empleado.usuario_id,
          tipo: 'nueva_reserva',
          titulo: 'Nueva Reserva',
          mensaje: `Se ha creado una nueva reserva en ${reserva.salon_titulo} para el ${reserva.fecha_reserva} por ${reserva.usuario_nombre} ${reserva.usuario_apellido}.`
        });
      }
      
      console.log(`✅ Notificaciones enviadas para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificaciones de reserva creada:', error);
    }
  }

  /**
   * Enviar notificación cuando se confirma una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<void>}
   */
  async notifyReservaConfirmed(reservaId) {
    try {
      const reserva = await reservaRepository.findById(reservaId);
      
      if (!reserva) {
        return;
      }
      
      // Notificar al cliente que su reserva fue confirmada
      await notificacionRepository.create({
        usuario_id: reserva.usuario_id,
        tipo: 'reserva_confirmada',
        titulo: 'Reserva Confirmada',
        mensaje: `Su reserva en ${reserva.salon_titulo} para el ${reserva.fecha_reserva} de ${reserva.hora_desde} a ${reserva.hora_hasta} ha sido CONFIRMADA. ¡Ya puede confirmar su asistencia!`
      });
      
      console.log(`✅ Notificación de confirmación enviada para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificación de confirmación:', error);
    }
  }

  /**
   * Enviar notificación cuando se actualiza una reserva
   * @param {number} reservaId - ID de la reserva
   * @param {string} cambios - Descripción de los cambios
   * @returns {Promise<void>}
   */
  async notifyReservaUpdated(reservaId, cambios) {
    try {
      const reserva = await reservaRepository.findById(reservaId);
      
      if (!reserva) {
        return;
      }
      
      await notificacionRepository.create({
        usuario_id: reserva.usuario_id,
        tipo: 'reserva_actualizada',
        titulo: 'Reserva Actualizada',
        mensaje: `Su reserva en ${reserva.salon_titulo} ha sido actualizada. ${cambios || ''}`
      });
      
      console.log(`✅ Notificación de actualización enviada para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificación de actualización:', error);
    }
  }

  /**
   * Enviar notificación cuando se cancela una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<void>}
   */
  async notifyReservaCancelled(reservaId) {
    try {
      const reserva = await reservaRepository.findById(reservaId);
      
      if (!reserva) {
        return;
      }
      
      await notificacionRepository.create({
        usuario_id: reserva.usuario_id,
        tipo: 'reserva_cancelada',
        titulo: 'Reserva Cancelada',
        mensaje: `Su reserva en ${reserva.salon_titulo} para el ${reserva.fecha_reserva} ha sido cancelada.`
      });
      
      console.log(`✅ Notificación de cancelación enviada para reserva ${reservaId}`);
    } catch (error) {
      console.error('❌ Error al enviar notificación de cancelación:', error);
    }
  }

  /**
   * Enviar notificación de recordatorio de reserva
   * @returns {Promise<void>}
   */
  async notifyReservaReminder() {
    try {
      // Obtener reservas del día siguiente
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const fechaFormato = tomorrow.toISOString().split('T')[0];
      
      // Obtener todas las reservas activas
      const reservas = await reservaRepository.findAll();
      
      // Filtrar reservas del día siguiente
      const reservasTomorrow = reservas.filter(r => {
        const reservaFecha = new Date(r.fecha_reserva).toISOString().split('T')[0];
        return reservaFecha === fechaFormato && (r.estado === 'confirmada' || !r.estado);
      });
      
      for (const reserva of reservasTomorrow) {
        // Verificar si ya se envió recordatorio
        const mensajePattern = `%Reserva ${reserva.reserva_id}%`;
        const existe = await notificacionRepository.existsRecordatorioToday(reserva.usuario_id, mensajePattern);
        
        if (!existe) {
          await notificacionRepository.create({
            usuario_id: reserva.usuario_id,
            tipo: 'recordatorio_reserva',
            titulo: 'Recordatorio de Reserva',
            mensaje: `Recuerde que tiene una reserva mañana en ${reserva.salon_titulo} a las ${reserva.hora_desde}.`
          });
        }
      }
      
      console.log(`✅ Recordatorios enviados para ${reservasTomorrow.length} reservas`);
    } catch (error) {
      console.error('❌ Error al enviar recordatorios:', error);
    }
  }

  /**
   * Obtener notificaciones de un usuario
   * @param {number} userId - ID del usuario
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Array de notificaciones
   */
  async getUserNotifications(userId, limit = 20) {
    try {
      return await notificacionRepository.findByUsuarioId(userId, limit);
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   * @param {number} notificacionId - ID de la notificación
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>} true si se marcó, false si no
   */
  async markAsRead(notificacionId, userId) {
    try {
      return await notificacionRepository.markAsRead(notificacionId, userId);
    } catch (error) {
      console.error('❌ Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Número de notificaciones actualizadas
   */
  async markAllAsRead(userId) {
    try {
      return await notificacionRepository.markAllAsRead(userId);
    } catch (error) {
      console.error('❌ Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Obtener cantidad de notificaciones no leídas
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Cantidad de notificaciones no leídas
   */
  async getUnreadCount(userId) {
    try {
      const notificaciones = await notificacionRepository.findByUsuarioId(userId, 1000);
      return notificaciones.filter(n => n.leida === 0 || n.leida === false).length;
    } catch (error) {
      console.error('❌ Error al obtener contador de notificaciones:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
