const NodeCache = require('node-cache');

/**
 * Configuración de cache
 * Diferentes TTL según el tipo de dato
 */
const cacheConfig = {
  stdTTL: 3600, // 1 hora por defecto
  checkperiod: 600, // Verificar expiración cada 10 minutos
  useClones: false // Mejor rendimiento
};

// Crear instancia de cache
const cache = new NodeCache(cacheConfig);

/**
 * Middleware de cache para endpoints GET
 * @param {number} ttl - Time to live en segundos (opcional)
 * @param {string} keyPrefix - Prefijo para la clave de cache (opcional)
 */
const cacheMiddleware = (ttl = 3600, keyPrefix = '') => {
  return (req, res, next) => {
    // Solo cachear requests GET
    if (req.method !== 'GET') {
      return next();
    }

    // Generar clave de cache basada en URL y query params
    const cacheKey = keyPrefix + req.originalUrl || req.url;
    
    // Intentar obtener del cache
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      // Si hay datos en cache, retornarlos
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Si no hay datos en cache, guardar la función res.json original
    const originalJson = res.json.bind(res);
    
    // Sobrescribir res.json para cachear la respuesta
    res.json = function(data) {
      // Cachear la respuesta
      cache.set(cacheKey, data, ttl);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `public, max-age=${ttl}`);
      return originalJson(data);
    };

    next();
  };
};

/**
 * Cache específico para estadísticas (TTL más largo - 1 hora)
 */
const statisticsCache = cacheMiddleware(3600, 'stats:');

/**
 * Cache específico para reportes (TTL medio - 30 minutos)
 */
const reportsCache = cacheMiddleware(1800, 'reports:');

/**
 * Cache específico para listados de recursos (TTL corto - 5 minutos)
 */
const listCache = cacheMiddleware(300, 'list:');

/**
 * Invalidar cache por clave o patrón
 * @param {string} key - Clave o patrón a invalidar
 */
const invalidateCache = (key) => {
  if (key.includes('*')) {
    // Si contiene *, buscar todas las claves que coincidan
    const pattern = key.replace(/\*/g, '.*');
    const regex = new RegExp(pattern);
    const keys = cache.keys();
    keys.forEach(k => {
      if (regex.test(k)) {
        cache.del(k);
      }
    });
  } else {
    cache.del(key);
  }
};

/**
 * Invalidar todo el cache
 */
const clearAllCache = () => {
  cache.flushAll();
};

/**
 * Invalidar cache de un recurso específico
 * @param {string} resource - Nombre del recurso (ej: 'usuarios', 'salones')
 * @param {number} id - ID del recurso (opcional)
 */
const invalidateResourceCache = (resource, id = null) => {
  // Invalidar listado del recurso
  invalidateCache(`list:/api/v1/${resource}*`);
  invalidateCache(`list:/api/${resource}*`);
  
  // Si hay ID, invalidar también el recurso específico
  if (id) {
    invalidateCache(`list:/api/v1/${resource}/${id}*`);
    invalidateCache(`list:/api/${resource}/${id}*`);
  }
  
  // Invalidar estadísticas relacionadas si es necesario
  if (resource === 'reservas' || resource === 'usuarios' || resource === 'salones') {
    invalidateCache('stats:*');
  }
};

/**
 * Middleware para invalidar cache después de operaciones de escritura
 * @param {string} resource - Nombre del recurso
 */
const invalidateCacheAfterWrite = (resource) => {
  return (req, res, next) => {
    // Guardar función original de res.json
    const originalJson = res.json.bind(res);
    
    // Sobrescribir res.json para invalidar cache después de escribir
    res.json = function(data) {
      // Invalidar cache del recurso
      const resourceId = req.params.id || null;
      invalidateResourceCache(resource, resourceId);
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Obtener estadísticas del cache
 */
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  cacheMiddleware,
  statisticsCache,
  reportsCache,
  listCache,
  invalidateCache,
  clearAllCache,
  invalidateResourceCache,
  invalidateCacheAfterWrite,
  getCacheStats,
  cache // Exportar instancia para uso directo si es necesario
};

