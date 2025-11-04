const servicioRepository = require('../repositories/servicioRepository');

/**
 * Servicio para lógica de negocio de Servicios
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class ServicioService {
  /**
   * Obtener todos los servicios activos
   * @returns {Promise<Array>} Array de servicios
   */
  async getAllServicios() {
    return await servicioRepository.findAll();
  }

  /**
   * Obtener servicios con paginación, filtrado y ordenación
   * @param {Object} options - Opciones de consulta
   * @param {number} options.page - Página actual
   * @param {number} options.limit - Límite por página
   * @param {Object} options.filters - Filtros a aplicar
   * @param {string} options.sortField - Campo por el cual ordenar
   * @param {string} options.sortOrder - Orden (asc o desc)
   * @param {boolean} options.includeInactive - Si incluir servicios inactivos
   * @returns {Promise<Object>} Objeto con servicios y metadata de paginación
   */
  async getServiciosPaginated(options = {}) {
    return await servicioRepository.findAllPaginated(options);
  }

  /**
   * Obtener un servicio por ID
   * @param {number} id - ID del servicio
   * @param {boolean} includeInactive - Si incluir servicios inactivos
   * @returns {Promise<Object>} Servicio
   * @throws {Error} Si el servicio no existe
   */
  async getServicioById(id, includeInactive = false) {
    const servicio = await servicioRepository.findById(id, includeInactive);
    
    if (!servicio) {
      throw new Error('Servicio no encontrado');
    }
    
    return servicio;
  }

  /**
   * Obtener servicios por IDs
   * @param {Array<number>} ids - Array de IDs de servicios
   * @returns {Promise<Array>} Array de servicios
   */
  async getServiciosByIds(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    return await servicioRepository.findByIds(ids);
  }

  /**
   * Obtener importe de un servicio
   * @param {number} id - ID del servicio
   * @returns {Promise<number>} Importe del servicio
   * @throws {Error} Si el servicio no existe o está inactivo
   */
  async getServicioImporte(id) {
    const servicio = await servicioRepository.findImporteById(id);
    
    if (!servicio) {
      throw new Error('Servicio no encontrado o inactivo');
    }
    
    return parseFloat(servicio.importe);
  }

  /**
   * Crear un nuevo servicio
   * @param {Object} servicioData - Datos del servicio
   * @returns {Promise<Object>} Servicio creado
   */
  async createServicio(servicioData) {
    const { descripcion, importe } = servicioData;
    
    // Validaciones de negocio
    if (!descripcion || !importe) {
      throw new Error('Descripción e importe son requeridos');
    }
    
    if (importe < 0) {
      throw new Error('El importe no puede ser negativo');
    }
    
    // Crear servicio
    const servicioId = await servicioRepository.create({
      descripcion,
      importe
    });
    
    // Retornar servicio creado
    return await servicioRepository.findById(servicioId);
  }

  /**
   * Actualizar un servicio
   * @param {number} id - ID del servicio
   * @param {Object} servicioData - Datos a actualizar
   * @returns {Promise<Object>} Servicio actualizado
   * @throws {Error} Si el servicio no existe o datos inválidos
   */
  async updateServicio(id, servicioData) {
    const { descripcion, importe } = servicioData;
    
    // Validaciones de negocio
    if (!descripcion || !importe) {
      throw new Error('Descripción e importe son requeridos');
    }
    
    if (importe < 0) {
      throw new Error('El importe no puede ser negativo');
    }
    
    // Verificar que el servicio existe
    const servicioExistente = await servicioRepository.findById(id, true);
    
    if (!servicioExistente) {
      throw new Error('Servicio no encontrado');
    }
    
    // Actualizar servicio
    const updated = await servicioRepository.update(id, servicioData);
    
    if (!updated) {
      throw new Error('Servicio no encontrado para actualizar');
    }
    
    // Retornar servicio actualizado
    return await servicioRepository.findById(id);
  }

  /**
   * Eliminar (soft delete) un servicio
   * @param {number} id - ID del servicio
   * @returns {Promise<boolean>} true si se eliminó
   * @throws {Error} Si el servicio no existe
   */
  async deleteServicio(id) {
    const deleted = await servicioRepository.delete(id);
    
    if (!deleted) {
      throw new Error('Servicio no encontrado para eliminar');
    }
    
    return true;
  }

  /**
   * Calcular importe total de múltiples servicios
   * @param {Array<number>} servicioIds - Array de IDs de servicios
   * @returns {Promise<number>} Importe total
   */
  async calcularImporteTotal(servicioIds) {
    if (!servicioIds || servicioIds.length === 0) {
      return 0;
    }
    
    const servicios = await servicioRepository.findByIds(servicioIds);
    
    if (servicios.length !== servicioIds.length) {
      throw new Error('Uno o más servicios no existen o están inactivos');
    }
    
    return servicios.reduce((sum, s) => sum + parseFloat(s.importe), 0);
  }
}

module.exports = new ServicioService();

