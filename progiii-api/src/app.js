const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public'))); 

const salonesRoutes = require('./routes/salones');
app.use('/api/salones', salonesRoutes);
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);


module.exports = app;
