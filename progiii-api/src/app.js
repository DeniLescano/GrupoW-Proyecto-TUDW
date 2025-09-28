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


module.exports = app;
