const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter para rutas públicas (login, registro)
 * Más permisivo para permitir autenticación
 */
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP en 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos desde esta IP, por favor intenta de nuevo en 15 minutos',
    statusCode: 429
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting en desarrollo local (opcional)
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  }
});

/**
 * Rate Limiter para rutas protegidas (autenticadas)
 * Más restrictivo para proteger recursos
 */
const protectedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // 200 requests por IP en 15 minutos
  message: {
    success: false,
    error: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo en 15 minutos',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting en desarrollo local (opcional)
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  }
});

/**
 * Rate Limiter estricto para endpoints sensibles
 * (login, registro, cambio de contraseña)
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP en 15 minutos
  message: {
    success: false,
    error: 'Demasiados intentos fallidos desde esta IP, por favor intenta de nuevo en 15 minutos',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Contar todos los intentos, incluso los exitosos
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  }
});

/**
 * Rate Limiter para endpoints de estadísticas y reportes
 * Más restrictivo para proteger recursos pesados
 */
const statisticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 requests por IP en 1 hora
  message: {
    success: false,
    error: 'Demasiadas solicitudes de estadísticas desde esta IP, por favor intenta de nuevo en 1 hora',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.ip === '::1';
  }
});

module.exports = {
  publicLimiter,
  protectedLimiter,
  strictLimiter,
  statisticsLimiter
};

