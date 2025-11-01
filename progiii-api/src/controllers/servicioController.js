const db = require('../config/database');

exports.browse = async (req, res) => {
  try {
    const [servicios] = await db.query('SELECT * FROM servicios WHERE activo = 1');
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los servicios', error: error.message });
  }
};

exports.read = async (req, res) => {
  const { id } = req.params;
  try {
    const [servicio] = await db.query(
      'SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1',
      [id]
    );
    if (servicio.length === 0) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.json(servicio[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el servicio', error: error.message });
  }
};

exports.add = async (req, res) => {
  const { descripcion, importe } = req.body;

  if (!descripcion || !importe) {
    return res.status(400).json({ message: 'Descripción e importe son requeridos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)',
      [descripcion, importe]
    );
    
    const nuevoServicioId = result.insertId;
    const [nuevoServicio] = await db.query('SELECT * FROM servicios WHERE servicio_id = ?', [nuevoServicioId]);

    res.status(201).json({ message: 'Servicio creado correctamente', servicio: nuevoServicio[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el servicio', error: error.message });
  }
};

exports.edit = async (req, res) => {
  const { id } = req.params;
  const { descripcion, importe } = req.body;

  if (!descripcion || !importe) {
    return res.status(400).json({ message: 'Descripción e importe son requeridos' });
  }

  try {
    const [result] = await db.query(
      'UPDATE servicios SET descripcion = ?, importe = ? WHERE servicio_id = ?',
      [descripcion, importe, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Servicio no encontrado para actualizar' });
    }

    const [servicioActualizado] = await db.query('SELECT * FROM servicios WHERE servicio_id = ?', [id]);
    res.json({ message: 'Servicio actualizado correctamente', servicio: servicioActualizado[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el servicio', error: error.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('UPDATE servicios SET activo = 0 WHERE servicio_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Servicio no encontrado para eliminar' });
    }

    res.json({ message: 'Servicio eliminado correctamente (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el servicio', error: error.message });
  }
};

