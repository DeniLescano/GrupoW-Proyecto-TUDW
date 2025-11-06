const estadisticasRepository = require('../repositories/estadisticasRepository');

/**
 * Servicio para lógica de negocio de Estadísticas
 * Contiene toda la lógica de negocio, usa repositories para acceso a datos
 */
class EstadisticasService {
  /**
   * Obtener estadísticas de reservas
   * @param {string|null} fechaDesde - Fecha desde (YYYY-MM-DD)
   * @param {string|null} fechaHasta - Fecha hasta (YYYY-MM-DD)
   * @returns {Promise<Object>} Estadísticas de reservas
   */
  async getEstadisticasReservas(fechaDesde = null, fechaHasta = null) {
    // Validar formato de fechas si se proporcionan
    if (fechaDesde) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fechaDesde)) {
        throw new Error('La fecha desde debe estar en formato YYYY-MM-DD');
      }
    }
    
    if (fechaHasta) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fechaHasta)) {
        throw new Error('La fecha hasta debe estar en formato YYYY-MM-DD');
      }
    }
    
    // Validar que fechaDesde <= fechaHasta
    if (fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      
      if (desde > hasta) {
        throw new Error('La fecha desde debe ser anterior o igual a la fecha hasta');
      }
    }
    
    return await estadisticasRepository.getEstadisticasReservas(fechaDesde, fechaHasta);
  }

  /**
   * Obtener estadísticas de salones
   * @returns {Promise<Object>} Estadísticas de salones
   */
  async getEstadisticasSalones() {
    return await estadisticasRepository.getEstadisticasSalones();
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  async getEstadisticasUsuarios() {
    return await estadisticasRepository.getEstadisticasUsuarios();
  }

  /**
   * Obtener reservas por mes
   * @param {number|null} anio - Año (opcional)
   * @returns {Promise<Array>} Array de reservas por mes
   */
  async getReservasPorMes(anio = null) {
    // Validar año si se proporciona
    if (anio !== null) {
      if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
        throw new Error('El año debe ser un número entero entre 2000 y 2100');
      }
    }
    
    return await estadisticasRepository.getReservasPorMes(anio);
  }

  /**
   * Obtener reservas detalladas para informes
   * @param {string|null} fechaDesde - Fecha desde (YYYY-MM-DD)
   * @param {string|null} fechaHasta - Fecha hasta (YYYY-MM-DD)
   * @returns {Promise<Array>} Array de reservas detalladas
   */
  async getReservasDetalladas(fechaDesde = null, fechaHasta = null) {
    // Validar formato de fechas si se proporcionan
    if (fechaDesde) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fechaDesde)) {
        throw new Error('La fecha desde debe estar en formato YYYY-MM-DD');
      }
    }
    
    if (fechaHasta) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fechaHasta)) {
        throw new Error('La fecha hasta debe estar en formato YYYY-MM-DD');
      }
    }
    
    // Validar que fechaDesde <= fechaHasta
    if (fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      
      if (desde > hasta) {
        throw new Error('La fecha desde debe ser anterior o igual a la fecha hasta');
      }
    }
    
    return await estadisticasRepository.getReservasDetalladas(fechaDesde, fechaHasta);
  }
}

module.exports = new EstadisticasService();

