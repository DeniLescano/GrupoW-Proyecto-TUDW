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
  async findAllPaginated(options = {}) {
    const {
      page = 1,
      limit = 10,
      filters = {},
      sortField = 'orden',
      sortOrder = 'asc',
      includeInactive = false
    } = options;

    let baseQuery = 'SELECT * FROM turnos';
    const values = [];
    
    // Construir condiciones WHERE
    const conditions = [];
    if (!includeInactive) {
      conditions.push('activo = 1');
    }
    
    // Aplicar filtros permitidos
    const allowedFilterFields = ['activo', 'orden'];
    Object.keys(filters).forEach(key => {
      if (allowedFilterFields.includes(key) && filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        conditions.push(`${key} = ?`);
        values.push(filters[key]);
      }
    });
    
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Aplicar ordenación
    const allowedSortFields = ['turno_id', 'orden', 'hora_desde', 'hora_hasta', 'creado', 'modificado'];
    if (allowedSortFields.includes(sortField)) {
      const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      baseQuery += ` ORDER BY ${sortField} ${order}`;
    } else {
      // Por defecto ordenar por orden
      baseQuery += ' ORDER BY orden ASC';
    }
    
    // Obtener total de registros
    const countQuery = baseQuery.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await db.query(countQuery, values);
    const total = countResult[0].total;
    
    // Aplicar paginación
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT ? OFFSET ?`;
    const paginatedValues = [...values, limit, offset];
    
    const [turnos] = await db.query(baseQuery, paginatedValues);
    
    return {
      data: turnos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    };
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

  /**
   * Eliminar definitivamente (hard delete) un turno
   * Solo debe usarse cuando el turno ya está desactivado (soft delete)
   * @param {number} id - ID del turno
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async permanentDelete(id) {
    // Verificar que el turno existe y está desactivado
    const [checkResult] = await db.query(
      'SELECT activo FROM turnos WHERE turno_id = ?',
      [id]
    );
    
    if (checkResult.length === 0) {
      return false;
    }
    
    if (checkResult[0].activo === 1) {
      throw new Error('No se puede eliminar definitivamente un turno activo. Primero debe ser desactivado.');
    }
    
    // Realizar eliminación física
    const [result] = await db.query(
      'DELETE FROM turnos WHERE turno_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = new TurnoRepository();

