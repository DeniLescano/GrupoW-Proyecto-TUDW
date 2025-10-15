const db = require('../config/database');
const catchAsync = require('../utils/catchAsync');

// Listar usuarios activos
exports.browse = catchAsync(async (req, res, next) => {
  const userRole = req.user.tipo_usuario;
  let query = 'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, activo, creado FROM usuarios WHERE activo = 1';
  const params = [];

  // Si el usuario es un Empleado, mostrar solo los Clientes
  if (userRole === 2) {
    query += ' AND tipo_usuario = ?';
    params.push(3);
  }

  const [usuarios] = await db.query(query, params);
  res.json(usuarios);
});

// Obtener un usuario por ID
exports.read = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const [usuario] = await db.query(
    'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, activo, creado FROM usuarios WHERE usuario_id = ? AND activo = 1',
    [id]
  );
  if (usuario.length === 0) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.json(usuario[0]);
});

// Actualizar un usuario
exports.edit = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { nombre, apellido, nombre_usuario, tipo_usuario, activo } = req.body;
  const [result] = await db.query(
    'UPDATE usuarios SET nombre = ?, apellido = ?, nombre_usuario = ?, tipo_usuario = ?, activo = ? WHERE usuario_id = ?',
    [nombre, apellido, nombre_usuario, tipo_usuario, activo, id]
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
  }
  res.json({ message: 'Usuario actualizado correctamente' });
});

// Borrado lógico de un usuario
exports.delete = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const [result] = await db.query('UPDATE usuarios SET activo = 0 WHERE usuario_id = ?', [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
  }
  res.json({ message: 'Usuario eliminado correctamente (soft delete)' });
});
