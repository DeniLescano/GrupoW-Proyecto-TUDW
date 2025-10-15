const db = require('../config/database');
const catchAsync = require('../utils/catchAsync');

// BROWSE - GET all active salones
exports.browse = catchAsync(async (req, res, next) => {
    const [salones] = await db.query('SELECT * FROM salones WHERE activo = 1');
    res.json(salones);
});

// READ - GET one salon by id
exports.read = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [salon] = await db.query('SELECT * FROM salones WHERE salon_id = ? AND activo = 1', [id]);
    if (salon.length === 0) {
        return res.status(404).json({ message: 'Salón no encontrado' });
    }
    res.json(salon[0]);
});

// EDIT - PUT one salon by id
exports.edit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { titulo, direccion, capacidad, importe } = req.body;

    const [result] = await db.query(
        'UPDATE salones SET titulo = ?, direccion = ?, capacidad = ?, importe = ? WHERE salon_id = ?',
        [titulo, direccion, capacidad, importe, id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Salón no encontrado para actualizar' });
    }

    const [salonActualizado] = await db.query('SELECT * FROM salones WHERE salon_id = ?', [id]);
    res.json({ message: 'Salón actualizado correctamente', salon: salonActualizado[0] });
});

// ADD - POST a new salon
exports.add = catchAsync(async (req, res, next) => {
    const { titulo, direccion, capacidad, importe } = req.body;

    const [result] = await db.query(
        'INSERT INTO salones (titulo, direccion, capacidad, importe) VALUES (?, ?, ?, ?)',
        [titulo, direccion, capacidad, importe]
    );
    
    const nuevoSalonId = result.insertId;
    const [nuevoSalon] = await db.query('SELECT * FROM salones WHERE salon_id = ?', [nuevoSalonId]);

    res.status(201).json({ message: 'Salón creado correctamente', salon: nuevoSalon[0] });
});

// DELETE - PUT (soft delete) a salon by id
exports.delete = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [result] = await db.query('UPDATE salones SET activo = 0 WHERE salon_id = ?', [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Salón no encontrado para eliminar' });
    }

    res.json({ message: 'Salón eliminado correctamente (soft delete)' });
});
