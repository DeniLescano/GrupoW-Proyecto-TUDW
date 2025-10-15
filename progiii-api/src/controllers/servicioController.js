const db = require('../config/database');
const catchAsync = require('../utils/catchAsync');

// BROWSE - GET all active services
exports.browse = catchAsync(async (req, res, next) => {
    const [servicios] = await db.query('SELECT * FROM servicios WHERE activo = 1');
    res.json(servicios);
});

// READ - GET one service by id
exports.read = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [servicio] = await db.query('SELECT * FROM servicios WHERE servicio_id = ? AND activo = 1', [id]);
    if (servicio.length === 0) {
        return res.status(404).json({ message: 'Servicio no encontrado' });
    }
    res.json(servicio[0]);
});

// EDIT - PUT one service by id
exports.edit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { descripcion, importe } = req.body;

    const [result] = await db.query(
        'UPDATE servicios SET descripcion = ?, importe = ? WHERE servicio_id = ?',
        [descripcion, importe, id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Servicio no encontrado para actualizar' });
    }

    const [servicioActualizado] = await db.query('SELECT * FROM servicios WHERE servicio_id = ?', [id]);
    res.json({ message: 'Servicio actualizado correctamente', servicio: servicioActualizado[0] });
});

// ADD - POST a new service
exports.add = catchAsync(async (req, res, next) => {
    const { descripcion, importe } = req.body;

    const [result] = await db.query(
        'INSERT INTO servicios (descripcion, importe) VALUES (?, ?)',
        [descripcion, importe]
    );
    
    const nuevoServicioId = result.insertId;
    const [nuevoServicio] = await db.query('SELECT * FROM servicios WHERE servicio_id = ?', [nuevoServicioId]);

    res.status(201).json({ message: 'Servicio creado correctamente', servicio: nuevoServicio[0] });
});

// DELETE - PUT (soft delete) a service by id
exports.delete = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [result] = await db.query('UPDATE servicios SET activo = 0 WHERE servicio_id = ?', [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Servicio no encontrado para eliminar' });
    }

    res.json({ message: 'Servicio eliminado correctamente (soft delete)' });
});