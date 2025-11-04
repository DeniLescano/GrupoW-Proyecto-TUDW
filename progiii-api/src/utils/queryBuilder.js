/**
 * Utilidades para construir consultas SQL con paginación, filtrado y ordenación
 */

/**
 * Construye una consulta SQL con paginación
 * @param {string} baseQuery - Consulta SQL base
 * @param {number} page - Página actual (1-indexed)
 * @param {number} limit - Límite por página
 * @returns {string} Consulta SQL con LIMIT y OFFSET
 */
const buildPaginationQuery = (baseQuery, page, limit) => {
  const offset = (page - 1) * limit;
  return `${baseQuery} LIMIT ${limit} OFFSET ${offset}`;
};

/**
 * Construye una consulta SQL con filtros
 * @param {string} baseQuery - Consulta SQL base
 * @param {Object} filters - Objeto con filtros permitidos
 * @param {Array} allowedFields - Array de campos permitidos para filtrar
 * @returns {Object} Objeto con query modificada y valores para los placeholders
 */
const buildFilterQuery = (baseQuery, filters, allowedFields) => {
  const conditions = [];
  const values = [];
  let query = baseQuery;
  
  // Si ya tiene WHERE, usar AND; si no, usar WHERE
  const hasWhere = baseQuery.toUpperCase().includes('WHERE');
  
  Object.keys(filters).forEach(key => {
    if (allowedFields.includes(key) && filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      conditions.push(`${key} = ?`);
      values.push(filters[key]);
    }
  });
  
  if (conditions.length > 0) {
    const whereClause = conditions.join(' AND ');
    query = hasWhere ? `${query} AND ${whereClause}` : `${query} WHERE ${whereClause}`;
  }
  
  return { query, values };
};

/**
 * Construye una consulta SQL con ordenación
 * @param {string} baseQuery - Consulta SQL base
 * @param {string} sortField - Campo por el cual ordenar
 * @param {string} sortOrder - Orden (asc o desc)
 * @param {Array} allowedFields - Array de campos permitidos para ordenar
 * @returns {string} Consulta SQL con ORDER BY
 */
const buildSortQuery = (baseQuery, sortField, sortOrder, allowedFields) => {
  if (!sortField || !allowedFields.includes(sortField)) {
    return baseQuery;
  }
  
  const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const orderByIndex = baseQuery.toUpperCase().lastIndexOf('ORDER BY');
  
  if (orderByIndex !== -1) {
    // Si ya tiene ORDER BY, reemplazarlo
    const beforeOrderBy = baseQuery.substring(0, orderByIndex);
    return `${beforeOrderBy} ORDER BY ${sortField} ${order}`;
  }
  
  return `${baseQuery} ORDER BY ${sortField} ${order}`;
};

/**
 * Construye una consulta completa con paginación, filtrado y ordenación
 * @param {string} baseQuery - Consulta SQL base
 * @param {Object} options - Opciones de paginación, filtrado y ordenación
 * @param {number} options.page - Página actual
 * @param {number} options.limit - Límite por página
 * @param {Object} options.filters - Filtros a aplicar
 * @param {Array} options.allowedFilterFields - Campos permitidos para filtrar
 * @param {string} options.sortField - Campo por el cual ordenar
 * @param {string} options.sortOrder - Orden (asc o desc)
 * @param {Array} options.allowedSortFields - Campos permitidos para ordenar
 * @returns {Object} Objeto con query final y valores para placeholders
 */
const buildQuery = (baseQuery, options = {}) => {
  let query = baseQuery;
  let values = [];
  
  const {
    page,
    limit,
    filters = {},
    allowedFilterFields = [],
    sortField,
    sortOrder = 'asc',
    allowedSortFields = []
  } = options;
  
  // Aplicar filtros
  if (allowedFilterFields.length > 0 && Object.keys(filters).length > 0) {
    const filterResult = buildFilterQuery(query, filters, allowedFilterFields);
    query = filterResult.query;
    values = filterResult.values;
  }
  
  // Aplicar ordenación
  if (allowedSortFields.length > 0 && sortField) {
    query = buildSortQuery(query, sortField, sortOrder, allowedSortFields);
  }
  
  // Aplicar paginación
  if (page && limit) {
    query = buildPaginationQuery(query, page, limit);
  }
  
  return { query, values };
};

module.exports = {
  buildPaginationQuery,
  buildFilterQuery,
  buildSortQuery,
  buildQuery
};

