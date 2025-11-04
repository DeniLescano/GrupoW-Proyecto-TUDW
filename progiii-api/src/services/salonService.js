const salonRepository = require('../repositories/salonRepository');

/**
 * Servicio para lógica de negocio de Salones
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class SalonService {
  /**
   * Obtener todos los salones
   * @param {boolean} includeInactive - Si incluir salones inactivos
   * @returns {Promise<Array>} Array de salones
   */
  async getAllSalones(includeInactive = false) {
    return await salonRepository.findAll(includeInactive);
  }

  /**
   * Obtener salones con paginación, filtrado y ordenación
   * @param {Object} options - Opciones de consulta
   * @param {number} options.page - Página actual
   * @param {number} options.limit - Límite por página
   * @param {Object} options.filters - Filtros a aplicar
   * @param {string} options.sortField - Campo por el cual ordenar
   * @param {string} options.sortOrder - Orden (asc o desc)
   * @param {boolean} options.includeInactive - Si incluir salones inactivos
   * @returns {Promise<Object>} Objeto con salones y metadata de paginación
   */
  async getSalonesPaginated(options = {}) {
    return await salonRepository.findAllPaginated(options);
  }

  /**
   * Obtener un salón por ID
   * @param {number} id - ID del salón
   * @param {boolean} includeInactive - Si incluir salones inactivos
   * @returns {Promise<Object>} Salón
   * @throws {Error} Si el salón no existe
   */
  async getSalonById(id, includeInactive = false) {
    const salon = await salonRepository.findById(id, includeInactive);
    
    if (!salon) {
      throw new Error('Salón no encontrado');
    }
    
    return salon;
  }

  /**
   * Obtener importe de un salón activo
   * @param {number} id - ID del salón
   * @returns {Promise<number>} Importe del salón
   * @throws {Error} Si el salón no existe o está inactivo
   */
  async getSalonImporte(id) {
    const salon = await salonRepository.findImporteById(id);
    
    if (!salon) {
      throw new Error('Salón no encontrado o inactivo');
    }
    
    return parseFloat(salon.importe);
  }

  /**
   * Crear un nuevo salón
   * @param {Object} salonData - Datos del salón
   * @returns {Promise<Object>} Salón creado
   */
  async createSalon(salonData) {
    const { titulo, direccion, capacidad, importe } = salonData;
    
    // Validaciones de negocio
    if (!titulo || !direccion || !capacidad || !importe) {
      throw new Error('Todos los campos son requeridos: titulo, direccion, capacidad, importe.');
    }
    
    if (capacidad <= 0) {
      throw new Error('La capacidad debe ser mayor a 0');
    }
    
    if (importe < 0) {
      throw new Error('El importe no puede ser negativo');
    }
    
    // Crear salón
    const salonId = await salonRepository.create({
      titulo,
      direccion,
      capacidad,
      importe
    });
    
    // Retornar salón creado
    return await salonRepository.findById(salonId);
  }

  /**
   * Actualizar un salón
   * @param {number} id - ID del salón
   * @param {Object} salonData - Datos a actualizar
   * @returns {Promise<Object>} Salón actualizado
   * @throws {Error} Si el salón no existe o datos inválidos
   */
  async updateSalon(id, salonData) {
    const { titulo, direccion, capacidad, importe } = salonData;
    
    // Validaciones de negocio
    if (!titulo || !direccion || !capacidad || !importe) {
      throw new Error('Todos los campos son requeridos: titulo, direccion, capacidad, importe.');
    }
    
    if (capacidad <= 0) {
      throw new Error('La capacidad debe ser mayor a 0');
    }
    
    if (importe < 0) {
      throw new Error('El importe no puede ser negativo');
    }
    
    // Verificar que el salón existe
    const salonExistente = await salonRepository.findById(id, true);
    
    if (!salonExistente) {
      throw new Error('Salón no encontrado');
    }
    
    // Actualizar salón
    const updated = await salonRepository.update(id, salonData);
    
    if (!updated) {
      throw new Error('Salón no encontrado para actualizar');
    }
    
    // Retornar salón actualizado
    return await salonRepository.findById(id);
  }

  /**
   * Eliminar (soft delete) un salón
   * @param {number} id - ID del salón
   * @returns {Promise<boolean>} true si se eliminó
   * @throws {Error} Si el salón no existe
   */
  async deleteSalon(id) {
    const deleted = await salonRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Salón no encontrado para eliminar');
    }
    
    return true;
  }

  /**
   * Verificar disponibilidad de salones para una fecha/turno
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @param {number|null} turnoId - ID del turno (opcional)
   * @returns {Promise<Object>} Objeto con salones disponibles y ocupados
   */
  async getSalonesDisponibles(fecha, turnoId = null) {
    if (!fecha) {
      throw new Error('El parámetro fecha es requerido (YYYY-MM-DD)');
    }
    
    // Validar formato de fecha (básico)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fecha)) {
      throw new Error('La fecha debe estar en formato YYYY-MM-DD');
    }
    
    const salones = await salonRepository.findDisponibles(fecha, turnoId);
    
    return {
      fecha,
      turno_id: turnoId || null,
      salones_disponibles: salones.filter(s => s.disponible === 1),
      salones_ocupados: salones.filter(s => s.disponible === 0),
      total: salones.length
    };
  }
}

module.exports = new SalonService();

