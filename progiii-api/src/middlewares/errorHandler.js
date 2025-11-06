// Middleware de manejo de errores global
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      message: err.message
    });
  }

  // Error de autenticación
  if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Error de autenticación',
      message: 'Token inválido o expirado'
    });
  }

  // Error de autorización
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      error: 'Error de autorización',
      message: 'No tienes permisos para realizar esta acción'
    });
  }

  // Error de base de datos
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(400).json({
      success: false,
      error: 'Error de base de datos',
      message: err.message
    });
  }

  // Error 404
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      error: 'Recurso no encontrado',
      message: err.message || 'El recurso solicitado no existe'
    });
  }

  // Error genérico del servidor
  res.status(err.status || 500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ha ocurrido un error inesperado'
  });
};

// Middleware para manejar rutas no encontradas
const notFoundHandler = (req, res, next) => {
  // Solo retornar JSON para rutas de API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'Ruta no encontrada',
      message: `La ruta ${req.method} ${req.path} no existe`
    });
  }
  // Para otras rutas, dejar que Express.static las maneje
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler
};

