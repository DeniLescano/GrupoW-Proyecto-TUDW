const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
exports.login = async (req, res) => {
  const { nombre_usuario, contrasenia } = req.body;

  if (!nombre_usuario || !contrasenia) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
  }

  try {
    // Buscar usuario
    const [usuarios] = await db.query(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, activo FROM usuarios WHERE nombre_usuario = ?',
      [nombre_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const usuario = usuarios[0];

    // Verificar si está activo
    if (usuario.activo !== 1) {
      return res.status(403).json({ message: 'Usuario desactivado' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        usuario_id: usuario.usuario_id,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido
      },
      process.env.JWT_SECRET || 'tu_secret_key_super_seguro_cambiar_en_produccion',
      { expiresIn: '24h' }
    );

    // Respuesta sin contraseña
    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        nombre_usuario: usuario.nombre_usuario,
        tipo_usuario: usuario.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Verificar token (usado para verificar si el usuario sigue autenticado)
exports.verifyToken = async (req, res) => {
  try {
    // El middleware authenticateToken ya validó el token
    // Solo necesitamos devolver la información del usuario
    res.json({
      usuario: req.user,
      valid: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar token', error: error.message });
  }
};

