const reservaRepository = require('../repositories/reservaRepository');
const salonRepository = require('../repositories/salonRepository');
const servicioRepository = require('../repositories/servicioRepository');
const servicioService = require('./servicioService');

/**
 * Servicio para lógica de negocio de Reservas
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class ReservaService {
  /**
   * Obtener todas las reservas activas
   * @returns {Promise<Array>} Array de reservas con servicios
   */
  async getAllReservas() {
    const reservas = await reservaRepository.findAll();
    
    // Agregar servicios a cada reserva
    for (const reserva of reservas) {
      reserva.servicios = await reservaRepository.findServiciosByReservaId(reserva.reserva_id);
    }
    
    return reservas;
  }

  /**
   * Obtener reservas con paginación, filtrado y ordenación
   * @param {Object} options - Opciones de consulta
   * @param {number} options.page - Página actual
   * @param {number} options.limit - Límite por página
   * @param {Object} options.filters - Filtros a aplicar
   * @param {string} options.sortField - Campo por el cual ordenar
   * @param {string} options.sortOrder - Orden (asc o desc)
   * @param {boolean} options.includeInactive - Si incluir reservas inactivas
   * @returns {Promise<Object>} Objeto con reservas y metadata de paginación
   */
  async getReservasPaginated(options = {}) {
    const result = await reservaRepository.findAllPaginated(options);
    
    // Agregar servicios a cada reserva
    for (const reserva of result.data) {
      reserva.servicios = await reservaRepository.findServiciosByReservaId(reserva.reserva_id);
    }
    
    return result;
  }

  /**
   * Obtener reservas de un usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Array>} Array de reservas con servicios
   */
  async getReservasByUsuarioId(usuarioId) {
    const reservas = await reservaRepository.findByUsuarioId(usuarioId);
    
    // Agregar servicios a cada reserva
    for (const reserva of reservas) {
      reserva.servicios = await reservaRepository.findServiciosByReservaId(reserva.reserva_id);
    }
    
    return reservas;
  }

  /**
   * Obtener una reserva por ID
   * @param {number} id - ID de la reserva
   * @returns {Promise<Object>} Reserva con servicios
   * @throws {Error} Si la reserva no existe
   */
  async getReservaById(id) {
    const reserva = await reservaRepository.findById(id);
    
    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    
    // Agregar servicios
    reserva.servicios = await reservaRepository.findServiciosByReservaId(id);
    
    return reserva;
  }

  /**
   * Crear una nueva reserva
   * @param {Object} reservaData - Datos de la reserva
   * @param {number} reservaData.usuario_id - ID del usuario
   * @param {string} reservaData.fecha_reserva - Fecha de reserva (YYYY-MM-DD)
   * @param {number} reservaData.salon_id - ID del salón
   * @param {number} reservaData.turno_id - ID del turno
   * @param {string|null} reservaData.foto_cumpleaniero - Foto (opcional)
   * @param {string|null} reservaData.tematica - Temática (opcional)
   * @param {Array<number>|null} reservaData.servicios - Array de IDs de servicios (opcional)
   * @returns {Promise<Object>} Reserva creada
   */
  async createReserva(reservaData) {
    const { usuario_id, fecha_reserva, salon_id, turno_id, foto_cumpleaniero, tematica, servicios } = reservaData;
    
    // Validaciones de negocio
    if (!fecha_reserva || !salon_id || !turno_id) {
      throw new Error('fecha_reserva, salon_id y turno_id son requeridos');
    }
    
    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha_reserva)) {
      throw new Error('La fecha debe estar en formato YYYY-MM-DD');
    }
    
    // Verificar que el salón existe y está activo
    const salon = await salonRepository.findImporteById(salon_id);
    if (!salon) {
      throw new Error('Salón no encontrado o inactivo');
    }
    
    const importe_salon = parseFloat(salon.importe);
    
    // Calcular importe de servicios
    let importe_servicios = 0;
    let servicioIds = [];
    
    if (servicios && servicios.length > 0) {
      // Normalizar servicios: pueden venir como array de enteros o de objetos
      servicioIds = servicios.map(s => {
        if (typeof s === 'number') {
          return s;
        }
        if (typeof s === 'object' && s.servicio_id) {
          return s.servicio_id;
        }
        return null;
      }).filter(id => id !== null && Number.isInteger(id) && id > 0);
      
      if (servicioIds.length === 0 && servicios.length > 0) {
        throw new Error('Los servicios deben ser números enteros positivos');
      }
      
      if (servicioIds.length > 0) {
        importe_servicios = await servicioService.calcularImporteTotal(servicioIds);
      }
    }
    
    const importe_total = importe_salon + importe_servicios;
    
    // Crear la reserva
    const reservaId = await reservaRepository.create({
      fecha_reserva,
      salon_id,
      usuario_id,
      turno_id,
      foto_cumpleaniero: foto_cumpleaniero || null,
      tematica: tematica || null,
      importe_salon,
      importe_total,
      estado: 'pendiente'
    });
    
    // Agregar servicios asociados
    if (servicioIds.length > 0) {
      const serviciosData = await servicioRepository.findByIds(servicioIds);
      
      for (const servicio of serviciosData) {
        await reservaRepository.addServicio(reservaId, servicio.servicio_id, parseFloat(servicio.importe));
      }
    }
    
    // Retornar reserva completa creada
    return await this.getReservaById(reservaId);
  }

  /**
   * Actualizar una reserva (solo administradores)
   * @param {number} id - ID de la reserva
   * @param {Object} reservaData - Datos a actualizar
   * @returns {Promise<Object>} Reserva actualizada
   */
  async updateReserva(id, reservaData) {
    const { fecha_reserva, salon_id, turno_id, foto_cumpleaniero, tematica, servicios, estado } = reservaData;
    
    // Verificar que la reserva existe
    const reservaExistente = await reservaRepository.findBasicById(id);
    
    if (!reservaExistente) {
      throw new Error('Reserva no encontrada');
    }
    
    let importe_salon = reservaExistente.importe_salon;
    let importe_servicios = 0;
    const cambios = [];
    
    // Si se cambia el salón, actualizar importe
    if (salon_id && salon_id !== reservaExistente.salon_id) {
      const salon = await salonRepository.findImporteById(salon_id);
      if (!salon) {
        throw new Error('Salón no encontrado o inactivo');
      }
      importe_salon = parseFloat(salon.importe);
      cambios.push('salón actualizado');
    }
    
    // Actualizar servicios si se proporcionan
    if (servicios !== undefined) {
      if (Array.isArray(servicios) && servicios.length > 0) {
        // Eliminar servicios antiguos
        await reservaRepository.deleteServicios(id);
        
        // Normalizar servicios
        const servicioIds = servicios.map(s => {
          if (typeof s === 'number') {
            return s;
          }
          if (typeof s === 'object' && s.servicio_id) {
            return s.servicio_id;
          }
          return null;
        }).filter(id => id !== null && Number.isInteger(id) && id > 0);
        
        if (servicioIds.length === 0 && servicios.length > 0) {
          throw new Error('Los servicios deben ser números enteros positivos');
        }
        
        // Agregar nuevos servicios
        if (servicioIds.length > 0) {
          const serviciosData = await servicioRepository.findByIds(servicioIds);
          
          if (serviciosData.length !== servicioIds.length) {
            throw new Error('Uno o más servicios no existen o están inactivos');
          }
          
          for (const servicio of serviciosData) {
            const importe = parseFloat(servicio.importe);
            importe_servicios += importe;
            await reservaRepository.addServicio(id, servicio.servicio_id, importe);
          }
        }
      } else {
        // Si se envía array vacío, eliminar todos los servicios
        await reservaRepository.deleteServicios(id);
      }
    } else {
      // Si no se proporcionan servicios, mantener los existentes
      importe_servicios = await reservaRepository.getTotalServicios(id);
    }
    
    const importe_total = importe_salon + importe_servicios;
    
    // Preparar datos de actualización
    const updateData = {};
    
    if (fecha_reserva) {
      updateData.fecha_reserva = fecha_reserva;
      cambios.push('fecha actualizada');
    }
    
    if (salon_id) {
      updateData.salon_id = salon_id;
    }
    
    if (turno_id) {
      updateData.turno_id = turno_id;
      cambios.push('turno actualizado');
    }
    
    if (foto_cumpleaniero !== undefined) {
      updateData.foto_cumpleaniero = foto_cumpleaniero;
    }
    
    if (tematica !== undefined) {
      updateData.tematica = tematica;
    }
    
    if (estado !== undefined) {
      updateData.estado = estado;
      cambios.push(`estado cambiado a ${estado}`);
    }
    
    updateData.importe_salon = importe_salon;
    updateData.importe_total = importe_total;
    
    // Actualizar reserva
    const updated = await reservaRepository.update(id, updateData);
    
    if (!updated) {
      throw new Error('Reserva no encontrada para actualizar');
    }
    
    // Retornar reserva actualizada
    return await this.getReservaById(id);
  }

  /**
   * Confirmar una reserva (cambiar estado a 'confirmada')
   * @param {number} id - ID de la reserva
   * @returns {Promise<Object>} Reserva confirmada
   */
  async confirmarReserva(id) {
    const reserva = await reservaRepository.findBasicById(id);
    
    if (!reserva || reserva.activo === 0) {
      throw new Error('Reserva no encontrada');
    }
    
    const estadoActual = reserva.estado || 'pendiente';
    
    // Solo confirmar si está pendiente
    if (estadoActual !== 'pendiente') {
      throw new Error(`La reserva ya está en estado "${estadoActual}". Solo se pueden confirmar reservas pendientes.`);
    }
    
    // Actualizar estado a confirmada
    const updated = await reservaRepository.updateEstado(id, 'confirmada');
    
    if (!updated) {
      throw new Error('Reserva no encontrada para confirmar');
    }
    
    // Retornar reserva actualizada
    return await this.getReservaById(id);
  }

  /**
   * Eliminar (soft delete) una reserva
   * @param {number} id - ID de la reserva
   * @returns {Promise<number>} ID del usuario de la reserva (para notificaciones)
   */
  async deleteReserva(id) {
    // Obtener usuario_id antes de eliminar
    const usuarioId = await reservaRepository.findUsuarioIdById(id);
    
    const deleted = await reservaRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Reserva no encontrada para eliminar');
    }
    
    return usuarioId;
  }
}

module.exports = new ReservaService();

