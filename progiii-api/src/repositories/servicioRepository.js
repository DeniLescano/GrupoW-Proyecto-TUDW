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
  async findAllPaginated(options = {}) {
    const {
      page = 1,
      limit = 10,
      filters = {},
      sortField = 'servicio_id',
      sortOrder = 'asc',
      includeInactive = false
    } = options;

    let baseQuery = 'SELECT * FROM servicios';
    const values = [];
    
    // Construir condiciones WHERE
    const conditions = [];
    if (!includeInactive) {
      conditions.push('activo = 1');
    }
    
    // Aplicar filtros permitidos
    const allowedFilterFields = ['activo', 'descripcion'];
    Object.keys(filters).forEach(key => {
      if (allowedFilterFields.includes(key) && filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (key === 'descripcion') {
          conditions.push(`${key} LIKE ?`);
          values.push(`%${filters[key]}%`);
        } else {
          conditions.push(`${key} = ?`);
          values.push(filters[key]);
        }
      }
    });
    
    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Aplicar ordenación
    const allowedSortFields = ['servicio_id', 'descripcion', 'importe', 'creado', 'modificado'];
    if (allowedSortFields.includes(sortField)) {
      const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
      baseQuery += ` ORDER BY ${sortField} ${order}`;
    }
    
    // Obtener total de registros
    const countQuery = baseQuery.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await db.query(countQuery, values);
    const total = countResult[0].total;
    
    // Aplicar paginación
    const offset = (page - 1) * limit;
    baseQuery += ` LIMIT ? OFFSET ?`;
    const paginatedValues = [...values, limit, offset];
    
    const [servicios] = await db.query(baseQuery, paginatedValues);
    
    return {
      data: servicios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    };
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

  /**
   * Eliminar definitivamente (hard delete) un servicio
   * Solo debe usarse cuando el servicio ya está desactivado (soft delete)
   * @param {number} id - ID del servicio
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async permanentDelete(id) {
    // Verificar que el servicio existe y está desactivado
    const [checkResult] = await db.query(
      'SELECT activo FROM servicios WHERE servicio_id = ?',
      [id]
    );
    
    if (checkResult.length === 0) {
      return false;
    }
    
    if (checkResult[0].activo === 1) {
      throw new Error('No se puede eliminar definitivamente un servicio activo. Primero debe ser desactivado.');
    }
    
    // Realizar eliminación física
    const [result] = await db.query(
      'DELETE FROM servicios WHERE servicio_id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = new ServicioRepository();

