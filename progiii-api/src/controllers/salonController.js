const db = require('../config/database');

// BROWSE - GET all active salones
exports.browse = async (req, res) => {
    try {
        const [salones] = await db.query('SELECT * FROM salones WHERE activo = 1');
        res.json(salones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los salones', error: error.message });
    }
};

// READ - GET one salon by id
exports.read = async (req, res) => {
    const { id } = req.params;
    try {
        const [salon] = await db.query('SELECT * FROM salones WHERE salon_id = ? AND activo = 1', [id]);
        if (salon.length === 0) {
            return res.status(404).json({ message: 'Salón no encontrado' });
        }
        res.json(salon[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el salón', error: error.message });
    }
};

// EDIT - PUT one salon by id
exports.edit = async (req, res) => {
    const { id } = req.params;
    const { titulo, direccion, capacidad, importe } = req.body;

    if (!titulo || !direccion || !capacidad || !importe) {
        return res.status(400).json({ message: 'Todos los campos son requeridos: titulo, direccion, capacidad, importe.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE salones SET titulo = ?, direccion = ?, capacidad = ?, importe = ? WHERE salon_id = ?',
            [titulo, direccion, capacidad, importe, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Salón no encontrado para actualizar' });
        }

        const [salonActualizado] = await db.query('SELECT * FROM salones WHERE salon_id = ?', [id]);
        res.json({ message: 'Salón actualizado correctamente', salon: salonActualizado[0] });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el salón', error: error.message });
    }
};

// ADD - POST a new salon
exports.add = async (req, res) => {
    const { titulo, direccion, capacidad, importe } = req.body;

    if (!titulo || !direccion || !capacidad || !importe) {
        return res.status(400).json({ message: 'Todos los campos son requeridos: titulo, direccion, capacidad, importe.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO salones (titulo, direccion, capacidad, importe) VALUES (?, ?, ?, ?)',
            [titulo, direccion, capacidad, importe]
        );
        
        const nuevoSalonId = result.insertId;
        const [nuevoSalon] = await db.query('SELECT * FROM salones WHERE salon_id = ?', [nuevoSalonId]);

        res.status(201).json({ message: 'Salón creado correctamente', salon: nuevoSalon[0] });

    } catch (error) {
        res.status(500).json({ message: 'Error al crear el salón', error: error.message });
    }
};

// DELETE - PUT (soft delete) a salon by id
exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('UPDATE salones SET activo = 0 WHERE salon_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Salón no encontrado para eliminar' });
        }

        res.json({ message: 'Salón eliminado correctamente (soft delete)' });

    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el salón', error: error.message });
    }
};
