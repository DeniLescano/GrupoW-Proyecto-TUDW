const express = require('express');
const path = require('path');
const app = express();

// CORS middleware mejorado - debe estar antes de todas las rutas
const corsMiddleware = require('./middlewares/cors');
app.use(corsMiddleware);

// Rate Limiting - aplicar límites generales
const { publicLimiter, protectedLimiter, statisticsLimiter, strictLimiter } = require('./middlewares/rateLimiter');

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Swagger Documentation
const { swaggerUi, specs } = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Sistema de Reservas - Documentación'
})); 

// Versionado de API - v1
const apiV1 = express.Router();

// Rutas de autenticación (públicas)
const authRoutes = require('./routes/auth');
apiV1.use('/auth', authRoutes);

// Rutas protegidas - aplicar rate limiting general
const salonesRoutes = require('./routes/salones');
apiV1.use('/salones', protectedLimiter, salonesRoutes);
const usuariosRoutes = require('./routes/usuarios');
apiV1.use('/usuarios', protectedLimiter, usuariosRoutes);
const serviciosRoutes = require('./routes/servicios');
apiV1.use('/servicios', protectedLimiter, serviciosRoutes);
const turnosRoutes = require('./routes/turnos');
apiV1.use('/turnos', protectedLimiter, turnosRoutes);
const reservasRoutes = require('./routes/reservas');
apiV1.use('/reservas', protectedLimiter, reservasRoutes);
const estadisticasRoutes = require('./routes/estadisticas');
apiV1.use('/estadisticas', estadisticasRoutes); // Ya tiene statisticsLimiter en sus rutas
const reportesRoutes = require('./routes/reportes');
apiV1.use('/reportes', reportesRoutes); // Ya tiene statisticsLimiter en sus rutas
const notificacionesRoutes = require('./routes/notificaciones');
apiV1.use('/notificaciones', protectedLimiter, notificacionesRoutes);

// Montar API v1
app.use('/api/v1', apiV1);

// Mantener compatibilidad con rutas antiguas (deprecated) - usar las mismas rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/salones', salonesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Middleware de manejo de errores (debe ir al final, después de todas las rutas)
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
