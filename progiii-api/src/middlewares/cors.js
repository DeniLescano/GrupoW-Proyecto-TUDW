/**
 * Middleware de CORS mejorado
 * Configuración más segura y flexible usando variables de entorno
 */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3007', 'http://127.0.0.1:3000', 'http://127.0.0.1:3007'];

/**
 * Middleware de CORS configurable
 */
const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  
  // Permitir origen si está en la lista de permitidos o si es desarrollo sin origen
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin && process.env.NODE_ENV === 'development') {
    // En desarrollo, permitir requests sin origen (Postman, curl, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (process.env.NODE_ENV === 'development') {
    // En desarrollo, ser más permisivo
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    // En producción, solo permitir orígenes específicos
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Si el origen no está permitido, no establecer el header
      // Esto efectivamente bloquea el request
    }
  }
  
  // Métodos permitidos
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  
  // Headers permitidos
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Permitir credenciales (cookies, auth headers)
  if (process.env.CORS_CREDENTIALS === 'true') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Headers expuestos al cliente
  res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count, X-Page, X-Per-Page, RateLimit-Remaining, RateLimit-Reset');
  
  // Cache preflight requests
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

module.exports = corsMiddleware;

