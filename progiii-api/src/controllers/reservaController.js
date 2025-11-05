const reservaService = require('../services/reservaService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para reservas
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ReservaController {
  /**
   * Obtener todas las reservas activas
   * GET /api/v1/reservas
   * Query params: page, limit, sort, order, estado, usuario_id, salon_id, turno_id, fecha_reserva, all
   */
  async browse(req, res) {
    try {
      const includeInactive = req.query.all === 'true';
      
      // Si hay parámetros de paginación o se solicita incluir inactivos, usar método paginado
      if (includeInactive || req.query.page || req.query.limit || req.query.sort || req.query.estado || req.query.usuario_id || req.query.salon_id || req.query.turno_id || req.query.fecha_reserva) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000; // Límite alto por defecto si no se especifica
        const sortField = req.query.sort || 'fecha_reserva';
        const sortOrder = req.query.order || 'desc';
        
        const filters = {};
        if (req.query.estado) filters.estado = req.query.estado;
        if (req.query.usuario_id) filters.usuario_id = parseInt(req.query.usuario_id);
        if (req.query.salon_id) filters.salon_id = parseInt(req.query.salon_id);
        if (req.query.turno_id) filters.turno_id = parseInt(req.query.turno_id);
        if (req.query.fecha_reserva) filters.fecha_reserva = req.query.fecha_reserva;
        
        const result = await reservaService.getReservasPaginated({
          page,
          limit,
          filters,
          sortField,
          sortOrder,
          includeInactive
        });
        
        return res.json(successResponse(result.data, null, { pagination: result.pagination }));
      }
      
      // Si no hay paginación, usar método tradicional
      const reservas = await reservaService.getAllReservas();
      res.json(successResponse(reservas));
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      const { response, statusCode } = errorResponse('Error al obtener las reservas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener reservas del usuario actual
   * GET /api/v1/reservas/mis-reservas
   */
  async browseByUser(req, res) {
    try {
      if (!req.user || !req.user.usuario_id) {
        const { response, statusCode } = errorResponse('Usuario no autenticado', null, 401);
        return res.status(statusCode).json(response);
      }

      const reservas = await reservaService.getReservasByUsuarioId(req.user.usuario_id);
      res.json(successResponse(reservas));
    } catch (error) {
      console.error('Error al obtener reservas del usuario:', error);
      const { response, statusCode } = errorResponse('Error al obtener las reservas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener una reserva por ID
   * GET /api/v1/reservas/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      
      const reserva = await reservaService.getReservaById(id);
      res.json(successResponse(reserva));
    } catch (error) {
      if (error.message === 'Reserva no encontrada') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener reserva:', error);
      const { response, statusCode } = errorResponse('Error al obtener la reserva', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Crear una nueva reserva
   * POST /api/v1/reservas
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
      
      res.status(201).json(successResponse(reserva, 'Reserva creada correctamente'));
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('no encontrado') ||
          error.message.includes('inactivo') ||
          error.message.includes('enteros positivos') ||
          error.message.includes('formato')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al crear reserva:', error);
      const { response, statusCode } = errorResponse('Error al crear la reserva', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Actualizar una reserva (solo administradores)
   * PUT /api/v1/reservas/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const reserva = await reservaService.updateReserva(id, req.body);
      
      // Enviar notificaciones y emails según el cambio
      const estadoAnterior = req.body.estado;
      const activoAnterior = req.body.activo;
      
      // Obtener datos completos de la reserva para el email
      const reservaCompleta = await reservaService.getReservaById(id);
      
      // Si se confirmó la reserva, enviar notificación y email
      if (estadoAnterior === 'confirmada') {
        notificationService.notifyReservaConfirmed(id).catch(err => {
          console.error('Error al enviar notificación de confirmación:', err);
        });
        
        // Enviar email de confirmación
        if (reservaCompleta && reservaCompleta.nombre_usuario) {
          emailService.enviarConfirmacionReserva(reservaCompleta.nombre_usuario, {
            fecha_reserva: reservaCompleta.fecha_reserva,
            salon_titulo: reservaCompleta.salon_titulo || reservaCompleta.titulo,
            salon_direccion: reservaCompleta.salon_direccion || reservaCompleta.direccion,
            hora_desde: reservaCompleta.hora_desde,
            hora_hasta: reservaCompleta.hora_hasta,
            tematica: reservaCompleta.tematica,
            importe_total: reservaCompleta.importe_total,
            servicios: reservaCompleta.servicios || []
          }).catch(err => {
            console.error('Error al enviar email de confirmación:', err);
          });
        }
      }
      
      // Si se canceló la reserva (activo = 0), enviar email de cancelación
      if (activoAnterior === 0 || activoAnterior === false) {
        if (reservaCompleta && reservaCompleta.nombre_usuario) {
          emailService.enviarCancelacionReserva(reservaCompleta.nombre_usuario, {
            fecha_reserva: reservaCompleta.fecha_reserva,
            salon_titulo: reservaCompleta.salon_titulo || reservaCompleta.titulo,
            salon_direccion: reservaCompleta.salon_direccion || reservaCompleta.direccion,
            hora_desde: reservaCompleta.hora_desde,
            hora_hasta: reservaCompleta.hora_hasta,
            importe_total: reservaCompleta.importe_total
          }).catch(err => {
            console.error('Error al enviar email de cancelación:', err);
          });
        }
      }
      
      // Si solo se actualizó información, enviar notificación de actualización
      if (estadoAnterior !== 'confirmada' && activoAnterior !== 0 && activoAnterior !== false) {
        const cambios = req.body.cambios || 'Información actualizada';
        notificationService.notifyReservaUpdated(id, cambios).catch(err => {
          console.error('Error al enviar notificaciones:', err);
        });
      }
      
      res.json(successResponse(reserva, 'Reserva actualizada correctamente'));
    } catch (error) {
      if (error.message === 'Reserva no encontrada' || 
          error.message === 'Reserva no encontrada para actualizar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('no encontrado') ||
          error.message.includes('inactivo') ||
          error.message.includes('enteros positivos')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al actualizar reserva:', error);
      const { response, statusCode } = errorResponse('Error al actualizar la reserva', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Confirmar una reserva (solo administradores)
   * PUT /api/v1/reservas/:id/confirmar
   */
  async confirmar(req, res) {
    try {
      const { id } = req.params;
      
      const reserva = await reservaService.confirmarReserva(id);
      
      // Enviar notificación de confirmación
      notificationService.notifyReservaConfirmed(id).catch(err => {
        console.error('Error al enviar notificación de confirmación:', err);
      });
      
      // Enviar email de confirmación
      if (reserva && reserva.nombre_usuario) {
        emailService.enviarConfirmacionReserva(reserva.nombre_usuario, {
          fecha_reserva: reserva.fecha_reserva,
          salon_titulo: reserva.salon_titulo || reserva.titulo,
          salon_direccion: reserva.salon_direccion || reserva.direccion,
          hora_desde: reserva.hora_desde,
          hora_hasta: reserva.hora_hasta,
          tematica: reserva.tematica,
          importe_total: reserva.importe_total,
          servicios: reserva.servicios || []
        }).catch(err => {
          console.error('Error al enviar email de confirmación:', err);
        });
      }
      
      res.json(successResponse(reserva, 'Reserva confirmada exitosamente'));
    } catch (error) {
      if (error.message === 'Reserva no encontrada' || 
          error.message === 'Reserva no encontrada para confirmar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('ya está en estado')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al confirmar reserva:', error);
      const { response, statusCode } = errorResponse('Error al confirmar la reserva', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar (soft delete) una reserva
   * DELETE /api/v1/reservas/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const usuarioId = await reservaService.deleteReserva(id);
      
      // Obtener datos completos de la reserva para el email
      const reservaCompleta = await reservaService.getReservaById(id, true);
      
      // Enviar notificaciones (no bloqueante)
      if (usuarioId) {
        notificationService.notifyReservaCancelled(id).catch(err => {
          console.error('Error al enviar notificaciones:', err);
        });
      }
      
      // Enviar email de cancelación
      if (reservaCompleta && reservaCompleta.nombre_usuario) {
        emailService.enviarCancelacionReserva(reservaCompleta.nombre_usuario, {
          fecha_reserva: reservaCompleta.fecha_reserva,
          salon_titulo: reservaCompleta.salon_titulo || reservaCompleta.titulo,
          salon_direccion: reservaCompleta.salon_direccion || reservaCompleta.direccion,
          hora_desde: reservaCompleta.hora_desde,
          hora_hasta: reservaCompleta.hora_hasta,
          importe_total: reservaCompleta.importe_total
        }).catch(err => {
          console.error('Error al enviar email de cancelación:', err);
        });
      }
      
      res.json(successResponse(null, 'Reserva eliminada correctamente (soft delete)'));
    } catch (error) {
      if (error.message === 'Reserva no encontrada para eliminar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar reserva:', error);
      const { response, statusCode } = errorResponse('Error al eliminar la reserva', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar definitivamente (hard delete) una reserva
   * DELETE /api/v1/reservas/:id/permanent
   */
  async permanentDelete(req, res) {
    try {
      const { id } = req.params;
      
      await reservaService.permanentDeleteReserva(id);
      
      res.json(successResponse(null, 'Reserva eliminada definitivamente'));
    } catch (error) {
      if (error.message === 'Reserva no encontrada' || error.message.includes('no encontrada')) {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('activa')) {
        const { response, statusCode } = errorResponse(error.message, null, 403);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar definitivamente reserva:', error);
      const { response, statusCode } = errorResponse('Error al eliminar definitivamente la reserva', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new ReservaController();
