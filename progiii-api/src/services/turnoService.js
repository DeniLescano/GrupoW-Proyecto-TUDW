const turnoRepository = require('../repositories/turnoRepository');

/**
 * Servicio para lógica de negocio de Turnos
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class TurnoService {
  /**
   * Obtener todos los turnos activos ordenados
   * @returns {Promise<Array>} Array de turnos
   */
  async getAllTurnos() {
    return await turnoRepository.findAll();
  }

  /**
   * Obtener turnos con paginación, filtrado y ordenación
   * @param {Object} options - Opciones de consulta
   * @param {number} options.page - Página actual
   * @param {number} options.limit - Límite por página
   * @param {Object} options.filters - Filtros a aplicar
   * @param {string} options.sortField - Campo por el cual ordenar
   * @param {string} options.sortOrder - Orden (asc o desc)
   * @param {boolean} options.includeInactive - Si incluir turnos inactivos
   * @returns {Promise<Object>} Objeto con turnos y metadata de paginación
   */
  async getTurnosPaginated(options = {}) {
    return await turnoRepository.findAllPaginated(options);
  }

  /**
   * Obtener un turno por ID
   * @param {number} id - ID del turno
   * @param {boolean} includeInactive - Si incluir turnos inactivos
   * @returns {Promise<Object>} Turno
   * @throws {Error} Si el turno no existe
   */
  async getTurnoById(id, includeInactive = false) {
    const turno = await turnoRepository.findById(id, includeInactive);
    
    if (!turno) {
      throw new Error('Turno no encontrado');
    }
    
    return turno;
  }

  /**
   * Crear un nuevo turno
   * @param {Object} turnoData - Datos del turno
   * @returns {Promise<Object>} Turno creado
   */
  async createTurno(turnoData) {
    const { orden, hora_desde, hora_hasta } = turnoData;
    
    // Validaciones de negocio
    if (!orden || !hora_desde || !hora_hasta) {
      throw new Error('Orden, hora_desde y hora_hasta son requeridos');
    }
    
    if (orden <= 0) {
      throw new Error('El orden debe ser mayor a 0');
    }
    
    // Validar formato de hora (HH:mm)
    const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora_desde)) {
      throw new Error('La hora desde debe estar en formato HH:mm (24 horas)');
    }
    
    if (!horaRegex.test(hora_hasta)) {
      throw new Error('La hora hasta debe estar en formato HH:mm (24 horas)');
    }
    
    // Validar que hora_hasta sea posterior a hora_desde
    const inicio = new Date(`2000-01-01T${hora_desde}:00`);
    const fin = new Date(`2000-01-01T${hora_hasta}:00`);
    
    if (fin <= inicio) {
      throw new Error('La hora hasta debe ser posterior a la hora desde');
    }
    
    // Crear turno
    const turnoId = await turnoRepository.create({
      orden,
      hora_desde,
      hora_hasta
    });
    
    // Retornar turno creado
    return await turnoRepository.findById(turnoId);
  }

  /**
   * Actualizar un turno
   * @param {number} id - ID del turno
   * @param {Object} turnoData - Datos a actualizar
   * @returns {Promise<Object>} Turno actualizado
   * @throws {Error} Si el turno no existe o datos inválidos
   */
  async updateTurno(id, turnoData) {
    const { orden, hora_desde, hora_hasta, activo } = turnoData;
    
    // Validaciones de negocio (solo si no es solo reactivación)
    if (activo === undefined) {
      if (!orden || !hora_desde || !hora_hasta) {
        throw new Error('Orden, hora_desde y hora_hasta son requeridos');
      }
      
      if (orden <= 0) {
        throw new Error('El orden debe ser mayor a 0');
      }
      
      // Validar formato de hora (HH:mm)
      const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(hora_desde)) {
        throw new Error('La hora desde debe estar en formato HH:mm (24 horas)');
      }
      
      if (!horaRegex.test(hora_hasta)) {
        throw new Error('La hora hasta debe estar en formato HH:mm (24 horas)');
      }
      
      // Validar que hora_hasta sea posterior a hora_desde
      const inicio = new Date(`2000-01-01T${hora_desde}:00`);
      const fin = new Date(`2000-01-01T${hora_hasta}:00`);
      
      if (fin <= inicio) {
        throw new Error('La hora hasta debe ser posterior a la hora desde');
      }
    }
    
    // Verificar que el turno existe
    const turnoExistente = await turnoRepository.findById(id, true);
    
    if (!turnoExistente) {
      throw new Error('Turno no encontrado');
    }
    
    // Si solo se está reactivando, usar los datos existentes
    const updateData = activo !== undefined && orden === undefined 
      ? { ...turnoExistente, activo } 
      : turnoData;
    
    // Actualizar turno
    const updated = await turnoRepository.update(id, updateData);
    
    if (!updated) {
      throw new Error('Turno no encontrado para actualizar');
    }
    
    // Retornar turno actualizado
    return await turnoRepository.findById(id);
  }

  /**
   * Eliminar (soft delete) un turno
   * @param {number} id - ID del turno
   * @returns {Promise<boolean>} true si se eliminó
   * @throws {Error} Si el turno no existe
   */
  async deleteTurno(id) {
    const deleted = await turnoRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Turno no encontrado para eliminar');
    }
    
    return true;
  }

  /**
   * Eliminar definitivamente (hard delete) un turno
   * Solo funciona para turnos ya desactivados (soft delete)
   * @param {number} id - ID del turno
   * @returns {Promise<boolean>} true si se eliminó
   * @throws {Error} Si el turno no existe o está activo
   */
  async permanentDeleteTurno(id) {
    // Verificar que el turno existe
    const turno = await turnoRepository.findById(id, true);
    if (!turno) {
      throw new Error('Turno no encontrado');
    }
    
    // Verificar que el turno está desactivado
    if (turno.activo === 1) {
      throw new Error('No se puede eliminar definitivamente un turno activo. Primero debe ser desactivado.');
    }
    
    const deleted = await turnoRepository.permanentDelete(id);
    
    if (!deleted) {
      throw new Error('Turno no encontrado para eliminar definitivamente');
    }
    
    return true;
  }
}

module.exports = new TurnoService();

