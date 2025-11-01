const express = require('express');
const path = require('path');
const app = express();

// CORS middleware - debe estar antes de todas las rutas
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Swagger Documentation
const { swaggerUi, specs } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Sistema de Reservas - Documentación'
})); 

// Rutas de autenticación (públicas)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rutas protegidas
const salonesRoutes = require('./routes/salones');
app.use('/api/salones', salonesRoutes);
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);
const serviciosRoutes = require('./routes/servicios');
app.use('/api/servicios', serviciosRoutes);
const turnosRoutes = require('./routes/turnos');
app.use('/api/turnos', turnosRoutes);
const reservasRoutes = require('./routes/reservas');
app.use('/api/reservas', reservasRoutes);
const estadisticasRoutes = require('./routes/estadisticas');
app.use('/api/estadisticas', estadisticasRoutes);
const reportesRoutes = require('./routes/reportes');
app.use('/api/reportes', reportesRoutes);
const notificacionesRoutes = require('./routes/notificaciones');
app.use('/api/notificaciones', notificacionesRoutes);

// Middleware de manejo de errores (debe ir al final, después de todas las rutas)
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
