const db = require('../config/database');

/**
 * Repository para acceso a datos de Reservas
 * Contiene solo consultas SQL, sin lógica de negocio
 */
class ReservaRepository {
  /**
   * Obtener todas las reservas activas con información relacionada
   * @returns {Promise<Array>} Array de reservas
   */
  async findAll() {
    const query = `
      SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.estado,
        r.activo,
        r.creado,
        r.modificado,
        s.salon_id,
        s.titulo as salon_titulo,
        s.direccion as salon_direccion,
        u.usuario_id,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.nombre_usuario,
        t.turno_id,
        t.hora_desde,
        t.hora_hasta,
        t.orden
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1
      ORDER BY r.fecha_reserva DESC, t.orden ASC
    `;
    
    const [reservas] = await db.query(query);
    return reservas;
  }

  /**
   * Obtener reservas de un usuario específico
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Array>} Array de reservas
   */
  async findByUsuarioId(usuarioId) {
    const query = `
      SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.estado,
        r.activo,
        r.creado,
        s.titulo as salon_titulo,
        s.direccion as salon_direccion,
        t.hora_desde,
        t.hora_hasta
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.usuario_id = ? AND r.activo = 1
      ORDER BY r.fecha_reserva DESC
    `;
    
    const [reservas] = await db.query(query, [usuarioId]);
    return reservas;
  }

  /**
   * Obtener una reserva por ID con información relacionada
   * @param {number} id - ID de la reserva
   * @returns {Promise<Object|null>} Reserva o null si no existe
   */
  async findById(id) {
    const query = `
      SELECT 
        r.*,
        s.titulo as salon_titulo,
        s.direccion as salon_direccion,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.nombre_usuario,
        t.hora_desde,
        t.hora_hasta,
        t.orden
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ? AND r.activo = 1
    `;
    
    const [reservas] = await db.query(query, [id]);
    
    if (reservas.length === 0) {
      return null;
    }
    
    return reservas[0];
  }

  /**
   * Obtener una reserva básica por ID (sin joins)
   * @param {number} id - ID de la reserva
   * @returns {Promise<Object|null>} Reserva o null si no existe
   */
  async findBasicById(id) {
    const [reservas] = await db.query(
      'SELECT * FROM reservas WHERE reserva_id = ?',
      [id]
    );
    
    if (reservas.length === 0) {
      return null;
    }
    
    return reservas[0];
  }

  /**
   * Obtener servicios de una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<Array>} Array de servicios de la reserva
   */
  async findServiciosByReservaId(reservaId) {
    const [servicios] = await db.query(`
      SELECT 
        rs.reserva_servicio_id,
        rs.importe,
        s.servicio_id,
        s.descripcion
      FROM reservas_servicios rs
      INNER JOIN servicios s ON rs.servicio_id = s.servicio_id
      WHERE rs.reserva_id = ?
    `, [reservaId]);
    
    return servicios;
  }

  /**
   * Crear una nueva reserva
   * @param {Object} reservaData - Datos de la reserva
   * @returns {Promise<number>} ID de la reserva creada
   */
  async create(reservaData) {
    const { fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total, estado } = reservaData;
    
    const [result] = await db.query(
      'INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero || null, tematica || null, importe_salon, importe_total, estado || 'pendiente']
    );
    
    return result.insertId;
  }

  /**
   * Agregar un servicio a una reserva
   * @param {number} reservaId - ID de la reserva
   * @param {number} servicioId - ID del servicio
   * @param {number} importe - Importe del servicio
   * @returns {Promise<number>} ID del registro creado
   */
  async addServicio(reservaId, servicioId, importe) {
    const [result] = await db.query(
      'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
      [reservaId, servicioId, importe]
    );
    
    return result.insertId;
  }

  /**
   * Eliminar todos los servicios de una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<void>}
   */
  async deleteServicios(reservaId) {
    await db.query('DELETE FROM reservas_servicios WHERE reserva_id = ?', [reservaId]);
  }

  /**
   * Obtener suma de importes de servicios de una reserva
   * @param {number} reservaId - ID de la reserva
   * @returns {Promise<number>} Suma de importes
   */
  async getTotalServicios(reservaId) {
    const [result] = await db.query(
      'SELECT SUM(importe) as total FROM reservas_servicios WHERE reserva_id = ?',
      [reservaId]
    );
    
    return parseFloat(result[0].total || 0);
  }

  /**
   * Actualizar una reserva
   * @param {number} id - ID de la reserva
   * @param {Object} reservaData - Datos a actualizar
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async update(id, reservaData) {
    const updateFields = [];
    const updateValues = [];
    
    if (reservaData.fecha_reserva !== undefined) {
      updateFields.push('fecha_reserva = ?');
      updateValues.push(reservaData.fecha_reserva);
    }
    
    if (reservaData.salon_id !== undefined) {
      updateFields.push('salon_id = ?');
      updateValues.push(reservaData.salon_id);
    }
    
    if (reservaData.turno_id !== undefined) {
      updateFields.push('turno_id = ?');
      updateValues.push(reservaData.turno_id);
    }
    
    if (reservaData.foto_cumpleaniero !== undefined) {
      updateFields.push('foto_cumpleaniero = ?');
      updateValues.push(reservaData.foto_cumpleaniero);
    }
    
    if (reservaData.tematica !== undefined) {
      updateFields.push('tematica = ?');
      updateValues.push(reservaData.tematica);
    }
    
    if (reservaData.importe_salon !== undefined) {
      updateFields.push('importe_salon = ?');
      updateValues.push(reservaData.importe_salon);
    }
    
    if (reservaData.importe_total !== undefined) {
      updateFields.push('importe_total = ?');
      updateValues.push(reservaData.importe_total);
    }
    
    if (reservaData.estado !== undefined) {
      updateFields.push('estado = ?');
      updateValues.push(reservaData.estado);
    }
    
    if (updateFields.length === 0) {
      return false;
    }
    
    updateValues.push(id);
    
    const [result] = await db.query(
      `UPDATE reservas SET ${updateFields.join(', ')} WHERE reserva_id = ?`,
      updateValues
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Actualizar solo el estado de una reserva
   * @param {number} id - ID de la reserva
   * @param {string} estado - Nuevo estado
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async updateEstado(id, estado) {
    const [result] = await db.query(
      'UPDATE reservas SET estado = ? WHERE reserva_id = ? AND activo = 1',
      [estado, id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Obtener usuario_id de una reserva
   * @param {number} id - ID de la reserva
   * @returns {Promise<number|null>} ID del usuario o null
   */
  async findUsuarioIdById(id) {
    const [reservas] = await db.query(
      'SELECT usuario_id FROM reservas WHERE reserva_id = ?',
      [id]
    );
    
    if (reservas.length === 0) {
      return null;
    }
    
    return reservas[0].usuario_id;
  }

  /**
   * Eliminar (soft delete) una reserva
   * @param {number} id - ID de la reserva
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async delete(id) {
    const [result] = await db.query(
      'UPDATE reservas SET activo = 0 WHERE reserva_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = new ReservaRepository();

