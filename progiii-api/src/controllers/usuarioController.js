const db = require('../config/database');

exports.browse = async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, creado, modificado FROM usuarios WHERE activo = 1'
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

exports.read = async (req, res) => {
  const { id } = req.params;
  try {
    const [usuario] = await db.query(
      'SELECT usuario_id, nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, foto, creado, modificado FROM usuarios WHERE usuario_id = ? AND activo = 1',
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

exports.add = async (req, res) => {
  const { nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, nombre_usuario, contrasenia, tipo_usuario, celular, foto) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, nombre_usuario, contrasenia, tipo_usuario || 1, celular || null, foto || null]
    );
    res.status(201).json({ message: 'Usuario creado correctamente', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
};

exports.edit = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, foto } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE usuarios SET nombre = ?, apellido = ?, nombre_usuario = ?, tipo_usuario = ?, celular = ?, activo = ?, foto = ? WHERE usuario_id = ?',
      [nombre, apellido, nombre_usuario, tipo_usuario, celular, activo, foto, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado para actualizar' });
    }
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

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