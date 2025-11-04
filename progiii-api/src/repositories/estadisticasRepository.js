const db = require('../config/database');

/**
 * Repository para acceso a datos de Estadísticas
 * Contiene solo consultas a stored procedures, sin lógica de negocio
 */
class EstadisticasRepository {
  /**
   * Obtener estadísticas de reservas
   * @param {string|null} fechaDesde - Fecha desde (YYYY-MM-DD)
   * @param {string|null} fechaHasta - Fecha hasta (YYYY-MM-DD)
   * @returns {Promise<Object>} Estadísticas de reservas
   */
  async getEstadisticasReservas(fechaDesde = null, fechaHasta = null) {
    const [results] = await db.query(
      'CALL sp_estadisticas_reservas(?, ?)',
      [fechaDesde, fechaHasta]
    );
    
    return results[0][0];
  }

  /**
   * Obtener estadísticas de salones
   * @returns {Promise<Object>} Estadísticas de salones
   */
  async getEstadisticasSalones() {
    const [results] = await db.query('CALL sp_estadisticas_salones()');
    return results[0][0];
  }

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  async getEstadisticasUsuarios() {
    const [results] = await db.query('CALL sp_estadisticas_usuarios()');
    return results[0][0];
  }

  /**
   * Obtener reservas por mes
   * @param {number|null} anio - Año (opcional)
   * @returns {Promise<Array>} Array de reservas por mes
   */
  async getReservasPorMes(anio = null) {
    const [results] = await db.query(
      'CALL sp_reservas_por_mes(?)',
      [anio]
    );
    
    return results[0];
  }

  /**
   * Obtener reservas detalladas para informes
   * @param {string|null} fechaDesde - Fecha desde (YYYY-MM-DD)
   * @param {string|null} fechaHasta - Fecha hasta (YYYY-MM-DD)
   * @returns {Promise<Array>} Array de reservas detalladas
   */
  async getReservasDetalladas(fechaDesde = null, fechaHasta = null) {
    const [results] = await db.query(
      'CALL sp_reservas_detalladas(?, ?)',
      [fechaDesde, fechaHasta]
    );
    
    return results[0];
  }
}

module.exports = new EstadisticasRepository();

