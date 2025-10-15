const express = require('express');
const setupSwagger = require('./config/swagger');
const globalErrorHandler = require('./middlewares/errorHandler');
const app = express();

// Middlewares
app.use(express.json());

// Swagger Docs Setup
setupSwagger(app);

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API PROGIII funcionando' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
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

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
