const reservaService = require('../services/reservaService');
const notificationService = require('../services/notificationService');

/**
 * Controlador para reservas
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ReservaController {
  /**
   * Obtener todas las reservas activas
   * GET /api/reservas
   */
  async browse(req, res) {
    try {
      const reservas = await reservaService.getAllReservas();
      res.json(reservas);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
    }
  }

  /**
   * Obtener reservas del usuario actual
   * GET /api/reservas/mis-reservas
   */
  async browseByUser(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const reservas = await reservaService.getReservasByUsuarioId(req.user.usuario_id);
      res.json(reservas);
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
      res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
    }
  }

  /**
   * Obtener una reserva por ID
   * GET /api/reservas/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      
      const reserva = await reservaService.getReservaById(id);
      res.json(reserva);
    } catch (error) {
      if (error.message === 'Reserva no encontrada') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al obtener reserva:', error);
      res.status(500).json({ message: 'Error al obtener la reserva', error: error.message });
    }
  }

  /**
   * Crear una nueva reserva
   * POST /api/reservas
   */
  async add(req, res) {
    try {
      const { usuario_id: bodyUsuarioId, servicios } = req.body;
      
      // Si es admin y especifica usuario_id, usar ese. Si no, usar el usuario autenticado
      const usuario_id = (req.user && req.user.tipo_usuario === 3 && bodyUsuarioId) 
        ? bodyUsuarioId 
        : req.user.usuario_id;

      const reservaData = {
        ...req.body,
        usuario_id
      };

      const reserva = await reservaService.createReserva(reservaData);
      
      // Enviar notificaciones (no bloqueante)
      notificationService.notifyReservaCreated(reserva.reserva_id, usuario_id).catch(err => {
        console.error('Error al enviar notificaciones:', err);
      });
      
      res.status(201).json({
        message: 'Reserva creada correctamente',
        reserva
      });
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('no encontrado') ||
          error.message.includes('inactivo') ||
          error.message.includes('enteros positivos') ||
          error.message.includes('formato')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al crear reserva:', error);
      res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
    }
  }

  /**
   * Actualizar una reserva (solo administradores)
   * PUT /api/reservas/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const reserva = await reservaService.updateReserva(id, req.body);
      
      // Enviar notificaciones según el cambio
      const estadoAnterior = req.body.estado;
      if (estadoAnterior === 'confirmada') {
        // Si se confirmó la reserva, enviar notificación especial
        notificationService.notifyReservaConfirmed(id).catch(err => {
          console.error('Error al enviar notificación de confirmación:', err);
        });
      } else {
        // Si solo se actualizó información, enviar notificación de actualización
        const cambios = req.body.cambios || 'Información actualizada';
        notificationService.notifyReservaUpdated(id, cambios).catch(err => {
          console.error('Error al enviar notificaciones:', err);
        });
      }
      
      res.json({
        message: 'Reserva actualizada correctamente',
        reserva
      });
    } catch (error) {
      if (error.message === 'Reserva no encontrada' || 
          error.message === 'Reserva no encontrada para actualizar') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('no encontrado') ||
          error.message.includes('inactivo') ||
          error.message.includes('enteros positivos')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al actualizar reserva:', error);
      res.status(500).json({ message: 'Error al actualizar la reserva', error: error.message });
    }
  }

  /**
   * Confirmar una reserva (solo administradores)
   * PUT /api/reservas/:id/confirmar
   */
  async confirmar(req, res) {
    try {
      const { id } = req.params;
      
      const reserva = await reservaService.confirmarReserva(id);
      
      // Enviar notificación de confirmación
      notificationService.notifyReservaConfirmed(id).catch(err => {
        console.error('Error al enviar notificación de confirmación:', err);
      });
      
      res.json({
        message: 'Reserva confirmada exitosamente',
        reserva
      });
    } catch (error) {
      if (error.message === 'Reserva no encontrada' || 
          error.message === 'Reserva no encontrada para confirmar') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('ya está en estado')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al confirmar reserva:', error);
      res.status(500).json({ message: 'Error al confirmar la reserva', error: error.message });
    }
  }

  /**
   * Eliminar (soft delete) una reserva
   * DELETE /api/reservas/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const usuarioId = await reservaService.deleteReserva(id);
      
      // Enviar notificaciones (no bloqueante)
      if (usuarioId) {
        notificationService.notifyReservaCancelled(id).catch(err => {
          console.error('Error al enviar notificaciones:', err);
        });
      }
      
      res.json({ message: 'Reserva eliminada correctamente (soft delete)' });
    } catch (error) {
      if (error.message === 'Reserva no encontrada para eliminar') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al eliminar reserva:', error);
      res.status(500).json({ message: 'Error al eliminar la reserva', error: error.message });
    }
  }
}

module.exports = new ReservaController();
