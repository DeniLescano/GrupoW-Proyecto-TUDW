const db = require('../config/database');

/**
 * Repository para acceso a datos de Salones
 * Contiene solo consultas SQL, sin lógica de negocio
 */
class SalonRepository {
  /**
   * Obtener todos los salones
   * @param {boolean} includeInactive - Si incluir salones inactivos
   * @returns {Promise<Array>} Array de salones
   */
  async findAll(includeInactive = false) {
    let query = 'SELECT * FROM salones';
    
    if (!includeInactive) {
      query += ' WHERE activo = 1';
    }
    
    const [salones] = await db.query(query);
    return salones;
  }

  /**
   * Obtener un salón por ID
   * @param {number} id - ID del salón
   * @param {boolean} includeInactive - Si incluir salones inactivos
   * @returns {Promise<Object|null>} Salón o null si no existe
   */
  async findById(id, includeInactive = false) {
    let query = 'SELECT * FROM salones WHERE salon_id = ?';
    
    if (!includeInactive) {
      query += ' AND activo = 1';
    }
    
    const [salones] = await db.query(query, [id]);
    
    if (salones.length === 0) {
      return null;
    }
    
    return salones[0];
  }

  /**
   * Obtener solo el importe de un salón activo
   * @param {number} id - ID del salón
   * @returns {Promise<Object|null>} Objeto con importe o null
   */
  async findImporteById(id) {
    const [salones] = await db.query(
      'SELECT importe FROM salones WHERE salon_id = ? AND activo = 1',
      [id]
    );
    
    if (salones.length === 0) {
      return null;
    }
    
    return salones[0];
  }

  /**
   * Crear un nuevo salón
   * @param {Object} salonData - Datos del salón
   * @param {string} salonData.titulo - Título
   * @param {string} salonData.direccion - Dirección
   * @param {number} salonData.capacidad - Capacidad
   * @param {number} salonData.importe - Importe
   * @returns {Promise<number>} ID del salón creado
   */
  async create(salonData) {
    const { titulo, direccion, capacidad, importe } = salonData;
    
    const [result] = await db.query(
      'INSERT INTO salones (titulo, direccion, capacidad, importe) VALUES (?, ?, ?, ?)',
      [titulo, direccion, capacidad, importe]
    );
    
    return result.insertId;
  }

  /**
   * Actualizar un salón
   * @param {number} id - ID del salón
   * @param {Object} salonData - Datos a actualizar
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async update(id, salonData) {
    const { titulo, direccion, capacidad, importe } = salonData;
    
    const [result] = await db.query(
      'UPDATE salones SET titulo = ?, direccion = ?, capacidad = ?, importe = ? WHERE salon_id = ?',
      [titulo, direccion, capacidad, importe, id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Eliminar (soft delete) un salón
   * @param {number} id - ID del salón
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async delete(id) {
    const [result] = await db.query(
      'UPDATE salones SET activo = 0 WHERE salon_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Verificar disponibilidad de salones para una fecha/turno
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @param {number|null} turnoId - ID del turno (opcional)
   * @returns {Promise<Array>} Array de salones con campo disponible
   */
  async findDisponibles(fecha, turnoId = null) {
    let query = `
      SELECT s.*, 
             CASE 
               WHEN EXISTS (
                 SELECT 1 FROM reservas r 
                 WHERE r.salon_id = s.salon_id 
                 AND r.fecha_reserva = ? 
                 AND r.activo = 1
                 ${turnoId ? 'AND r.turno_id = ?' : ''}
               ) THEN 0 
               ELSE 1 
             END as disponible
      FROM salones s
      WHERE s.activo = 1
    `;
    
    const params = [fecha];
    if (turnoId) {
      params.push(turnoId);
    }
    
    const [salones] = await db.query(query, params);
    return salones;
  }
}

module.exports = new SalonRepository();

