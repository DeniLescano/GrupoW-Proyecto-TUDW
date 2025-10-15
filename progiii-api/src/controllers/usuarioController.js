const db = require('../config/database');

// BROWSE - Obtener todos los usuarios activos
exports.browse = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT usuario_id, nombre, apellido, email, rol, activo, created_at FROM usuarios WHERE activo = 1'
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

// READ - Obtener un usuario por ID
exports.read = async (req, res) => {
  const { id } = req.params;
  try {
    const [usuario] = await db.query(
      'SELECT usuario_id, nombre, apellido, email, rol, activo, created_at FROM usuarios WHERE usuario_id = ? AND activo = 1',
      [id]
    );
    if (usuario.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};

// ADD - Crear un nuevo usuario
exports.add = async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, email, password, rol || 'cliente']
    );
    res.status(201).json({ message: 'Usuario creado correctamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

// EDIT - Actualizar un usuario
exports.edit = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, rol, activo } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, rol = ?, activo = ? WHERE usuario_id = ?',
      [nombre, apellido, email, rol, activo, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
    }
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

// DELETE - Baja lógica (soft delete)
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('UPDATE usuarios SET activo = 0 WHERE usuario_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado para eliminar' });
    }
    res.json({ message: 'Usuario eliminado correctamente (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};
