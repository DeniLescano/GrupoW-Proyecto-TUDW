const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res, next) => {
    const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;

    const hashedPassword = await bcrypt.hash(contrasenia, 8);

    try {
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, nombre_usuario, hashedPassword, tipo_usuario || 3, celular, foto]
        );
        
        res.status(201).json({ message: 'Usuario creado correctamente', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        return next(error);
    }
});

exports.login = catchAsync(async (req, res, next) => {
    const { nombre_usuario, contrasenia } = req.body;

    const [users] = await db.query('SELECT * FROM usuarios WHERE nombre_usuario = ? AND activo = 1', [nombre_usuario]);

    if (users.length === 0) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    const user = users[0];

    // Compara la contraseña ingresada con la hasheada (bcrypt)
    const isMatch = await bcrypt.compare(contrasenia, user.contrasenia);
    // Fallback para contraseñas MD5 de datos iniciales (no recomendado en producción)
    const isMd5Match = require('crypto').createHash('md5').update(contrasenia).digest('hex') === user.contrasenia;

    if (!isMatch && !isMd5Match) {
        return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    const accessToken = jwt.sign({ id: user.usuario_id, tipo_usuario: user.tipo_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ accessToken });
});