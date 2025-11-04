const db = require('../config/database');

/**
 * Repository para acceso a datos de Turnos
 * Contiene solo consultas SQL, sin lógica de negocio
 */
class TurnoRepository {
  /**
   * Obtener todos los turnos activos ordenados
   * @returns {Promise<Array>} Array de turnos
   */
  async findAll() {
    const [turnos] = await db.query('SELECT * FROM turnos WHERE activo = 1 ORDER BY orden ASC');
    return turnos;
  }

  /**
   * Obtener un turno por ID
   * @param {number} id - ID del turno
   * @param {boolean} includeInactive - Si incluir turnos inactivos
   * @returns {Promise<Object|null>} Turno o null si no existe
   */
  async findById(id, includeInactive = false) {
    let query = 'SELECT * FROM turnos WHERE turno_id = ?';
    
    if (!includeInactive) {
      query += ' AND activo = 1';
    }
    
    const [turnos] = await db.query(query, [id]);
    
    if (turnos.length === 0) {
      return null;
    }
    
    return turnos[0];
  }

  /**
   * Crear un nuevo turno
   * @param {Object} turnoData - Datos del turno
   * @param {number} turnoData.orden - Orden
   * @param {string} turnoData.hora_desde - Hora desde (HH:mm)
   * @param {string} turnoData.hora_hasta - Hora hasta (HH:mm)
   * @returns {Promise<number>} ID del turno creado
   */
  async create(turnoData) {
    const { orden, hora_desde, hora_hasta } = turnoData;
    
    const [result] = await db.query(
      'INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?, ?, ?)',
      [orden, hora_desde, hora_hasta]
    );
    
    return result.insertId;
  }

  /**
   * Actualizar un turno
   * @param {number} id - ID del turno
   * @param {Object} turnoData - Datos a actualizar
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async update(id, turnoData) {
    const { orden, hora_desde, hora_hasta } = turnoData;
    
    const [result] = await db.query(
      'UPDATE turnos SET orden = ?, hora_desde = ?, hora_hasta = ? WHERE turno_id = ?',
      [orden, hora_desde, hora_hasta, id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Eliminar (soft delete) un turno
   * @param {number} id - ID del turno
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async delete(id) {
    const [result] = await db.query(
      'UPDATE turnos SET activo = 0 WHERE turno_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = new TurnoRepository();

