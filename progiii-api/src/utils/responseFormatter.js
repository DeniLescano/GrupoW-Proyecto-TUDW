/**
 * Utilidades para formatear respuestas de la API
 * Estandariza todas las respuestas JSON
 */

/**
 * Formatea una respuesta exitosa
 * @param {Object|Array} data - Datos a devolver
 * @param {string} message - Mensaje opcional
 * @param {Object} meta - Metadatos opcionales (paginación, etc.)
 * @returns {Object} Respuesta formateada
 */
const successResponse = (data, message = null, meta = null) => {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Formatea una respuesta de error
 * @param {string} message - Mensaje de error
 * @param {Array|Object} errors - Errores detallados opcionales
 * @param {number} statusCode - Código de estado HTTP
 * @returns {Object} Respuesta de error formateada
 */
const errorResponse = (message, errors = null, statusCode = 400) => {
  const response = {
    success: false,
    error: message
  };

  if (errors) {
    response.errors = errors;
  }

  return { response, statusCode };
};

/**
 * Formatea una respuesta paginada
 * @param {Array} data - Datos de la página actual
 * @param {number} total - Total de registros
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @param {Object} additionalMeta - Metadatos adicionales
 * @returns {Object} Respuesta paginada formateada
 */
const paginatedResponse = (data, total, page, limit, additionalMeta = null) => {
  const totalPages = Math.ceil(total / limit);
  
  const meta = {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  };

  if (additionalMeta) {
    Object.assign(meta, additionalMeta);
  }

  return successResponse(data, null, meta);
};

/**
 * Agrega enlaces HATEOAS a una respuesta
 * @param {Object} response - Respuesta a la que agregar enlaces
 * @param {Object} links - Objeto con enlaces (self, related, etc.)
 * @returns {Object} Respuesta con enlaces
 */
const addLinks = (response, links) => {
  if (!response._links) {
    response._links = {};
  }

  Object.assign(response._links, links);
  return response;
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  addLinks
};

