const db = require('../config/database');

exports.browse = async (req, res) => {
  try {
    const [turnos] = await db.query('SELECT * FROM turnos WHERE activo = 1 ORDER BY orden ASC');
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los turnos', error: error.message });
  }
};

exports.read = async (req, res) => {
  const { id } = req.params;
  try {
    const [turno] = await db.query(
      'SELECT * FROM turnos WHERE turno_id = ? AND activo = 1',
      [id]
    );
    if (turno.length === 0) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }
    res.json(turno[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el turno', error: error.message });
  }
};

exports.add = async (req, res) => {
  const { orden, hora_desde, hora_hasta } = req.body;

  if (!orden || !hora_desde || !hora_hasta) {
    return res.status(400).json({ message: 'Orden, hora_desde y hora_hasta son requeridos' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?, ?, ?)',
      [orden, hora_desde, hora_hasta]
    );
    
    const nuevoTurnoId = result.insertId;
    const [nuevoTurno] = await db.query('SELECT * FROM turnos WHERE turno_id = ?', [nuevoTurnoId]);

    res.status(201).json({ message: 'Turno creado correctamente', turno: nuevoTurno[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el turno', error: error.message });
  }
};

exports.edit = async (req, res) => {
  const { id } = req.params;
  const { orden, hora_desde, hora_hasta } = req.body;

  if (!orden || !hora_desde || !hora_hasta) {
    return res.status(400).json({ message: 'Orden, hora_desde y hora_hasta son requeridos' });
  }

  try {
    const [result] = await db.query(
      'UPDATE turnos SET orden = ?, hora_desde = ?, hora_hasta = ? WHERE turno_id = ?',
      [orden, hora_desde, hora_hasta, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Turno no encontrado para actualizar' });
    }

    const [turnoActualizado] = await db.query('SELECT * FROM turnos WHERE turno_id = ?', [id]);
    res.json({ message: 'Turno actualizado correctamente', turno: turnoActualizado[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el turno', error: error.message });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('UPDATE turnos SET activo = 0 WHERE turno_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Turno no encontrado para eliminar' });
    }

    res.json({ message: 'Turno eliminado correctamente (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el turno', error: error.message });
  }
};

