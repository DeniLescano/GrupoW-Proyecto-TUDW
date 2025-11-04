const db = require('../config/database');

/**
 * Repository para acceso a datos de Servicios
 * Contiene solo consultas SQL, sin lógica de negocio
 */
class ServicioRepository {
  /**
   * Obtener todos los servicios activos
   * @returns {Promise<Array>} Array de servicios
   */
  async findAll() {
    const [servicios] = await db.query('SELECT * FROM servicios WHERE activo = 1');
    return servicios;
  }

  /**
   * Obtener un servicio por ID
   * @param {number} id - ID del servicio
   * @param {boolean} includeInactive - Si incluir servicios inactivos
   * @returns {Promise<Object|null>} Servicio o null si no existe
   */
  async findById(id, includeInactive = false) {
    let query = 'SELECT * FROM servicios WHERE servicio_id = ?';
    
    if (!includeInactive) {
      query += ' AND activo = 1';
    }
    
    const [servicios] = await db.query(query, [id]);
    
    if (servicios.length === 0) {
      return null;
    }
    
    return servicios[0];
  }

  /**
   * Obtener servicios por IDs (para validación)
   * @param {Array<number>} ids - Array de IDs de servicios
   * @returns {Promise<Array>} Array de servicios
   */
  async findByIds(ids) {
    if (!ids || ids.length === 0) {
      return [];
    }
    
    const placeholders = ids.map(() => '?').join(',');
    const [servicios] = await db.query(
      `SELECT servicio_id, descripcion, importe FROM servicios WHERE servicio_id IN (${placeholders}) AND activo = 1`,
      ids
    );
    
    return servicios;
  }

  /**
   * Obtener importe de un servicio
   * @param {number} id - ID del servicio
   * @returns {Promise<Object|null>} Objeto con importe o null
   */
  async findImporteById(id) {
    const [servicios] = await db.query(
      'SELECT importe FROM servicios WHERE servicio_id = ? AND activo = 1',
      [id]
    );
    
    if (servicios.length === 0) {
      return null;
    }
    
    return servicios[0];
  }

  /**
   * Crear un nuevo servicio
   * @param {Object} servicioData - Datos del servicio
   * @param {string} servicioData.descripcion - Descripción
   * @param {number} servicioData.importe - Importe
   * @returns {Promise<number>} ID del servicio creado
   */
  async create(servicioData) {
    const { descripcion, importe } = servicioData;
    
    const [result] = await db.query(
      'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)',
      [descripcion, importe]
    );
    
    return result.insertId;
  }

  /**
   * Actualizar un servicio
   * @param {number} id - ID del servicio
   * @param {Object} servicioData - Datos a actualizar
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async update(id, servicioData) {
    const { descripcion, importe } = servicioData;
    
    const [result] = await db.query(
      'UPDATE servicios SET descripcion = ?, importe = ? WHERE servicio_id = ?',
      [descripcion, importe, id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Eliminar (soft delete) un servicio
   * @param {number} id - ID del servicio
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async delete(id) {
    const [result] = await db.query(
      'UPDATE servicios SET activo = 0 WHERE servicio_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = new ServicioRepository();

