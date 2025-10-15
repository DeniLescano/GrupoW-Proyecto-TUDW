const express = require('express');
const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API PROGIII funcionando' });
});

const salonesRoutes = require('./routes/salones');
app.use('/api/salones', salonesRoutes);
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);



module.exports = app;
