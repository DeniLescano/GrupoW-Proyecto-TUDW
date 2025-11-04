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
    
    // Verificar que el turno existe
    const turnoExistente = await turnoRepository.findById(id, true);
    
    if (!turnoExistente) {
      throw new Error('Turno no encontrado');
    }
    
    // Actualizar turno
    const updated = await turnoRepository.update(id, turnoData);
    
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
}

module.exports = new TurnoService();

