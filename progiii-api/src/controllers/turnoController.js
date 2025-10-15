const db = require('../config/database');
const catchAsync = require('../utils/catchAsync');

// BROWSE - GET all active turns
exports.browse = catchAsync(async (req, res, next) => {
    const [turnos] = await db.query('SELECT * FROM turnos WHERE activo = 1 ORDER BY orden');
    res.json(turnos);
});

// READ - GET one turn by id
exports.read = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [turno] = await db.query('SELECT * FROM turnos WHERE turno_id = ? AND activo = 1', [id]);
    if (turno.length === 0) {
        return res.status(404).json({ message: 'Turno no encontrado' });
    }
    res.json(turno[0]);
});

// EDIT - PUT one turn by id
exports.edit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { orden, hora_desde, hora_hasta } = req.body;

    const [result] = await db.query(
        'UPDATE turnos SET orden = ?, hora_desde = ?, hora_hasta = ? WHERE turno_id = ?',
        [orden, hora_desde, hora_hasta, id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Turno no encontrado para actualizar' });
    }

    const [turnoActualizado] = await db.query('SELECT * FROM turnos WHERE turno_id = ?', [id]);
    res.json({ message: 'Turno actualizado correctamente', turno: turnoActualizado[0] });
});

// ADD - POST a new turn
exports.add = catchAsync(async (req, res, next) => {
    const { orden, hora_desde, hora_hasta } = req.body;

    const [result] = await db.query(
        'INSERT INTO turnos (orden, hora_desde, hora_hasta) VALUES (?, ?, ?)',
        [orden, hora_desde, hora_hasta]
    );
    
    const nuevoTurnoId = result.insertId;
    const [nuevoTurno] = await db.query('SELECT * FROM turnos WHERE turno_id = ?', [nuevoTurnoId]);

    res.status(201).json({ message: 'Turno creado correctamente', turno: nuevoTurno[0] });
});

// DELETE - PUT (soft delete) a turn by id
exports.delete = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [result] = await db.query('UPDATE turnos SET activo = 0 WHERE turno_id = ?', [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Turno no encontrado para eliminar' });
    }

    res.json({ message: 'Turno eliminado correctamente (soft delete)' });
});