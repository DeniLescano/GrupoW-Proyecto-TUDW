const db = require('../config/database');

// BROWSE - GET all active salones (or all if ?all=true)
exports.browse = async (req, res) => {
    try {
        let query = 'SELECT * FROM salones';
        if (req.query.all !== 'true') {
            query += ' WHERE activo = 1';
        }
        const [salones] = await db.query(query);
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

// DISPONIBILIDAD - GET salones disponibles para una fecha/turno
exports.disponibilidad = async (req, res) => {
    const { fecha, turno_id } = req.query;
    
    if (!fecha) {
        return res.status(400).json({ message: 'El parámetro fecha es requerido (YYYY-MM-DD)' });
    }

    try {
        // Obtener todos los salones activos
        let query = `
            SELECT s.*, 
                   CASE 
                     WHEN EXISTS (
                       SELECT 1 FROM reservas r 
                       WHERE r.salon_id = s.salon_id 
                       AND r.fecha_reserva = ? 
                       AND r.activo = 1
                       ${turno_id ? 'AND r.turno_id = ?' : ''}
                     ) THEN 0 
                     ELSE 1 
                   END as disponible
            FROM salones s
            WHERE s.activo = 1
        `;
        
        const params = [fecha];
        if (turno_id) {
            params.push(turno_id);
        }
        
        const [salones] = await db.query(query, params);
        
        res.json({
            fecha,
            turno_id: turno_id || null,
            salones_disponibles: salones.filter(s => s.disponible === 1),
            salones_ocupados: salones.filter(s => s.disponible === 0),
            total: salones.length
        });
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        res.status(500).json({ message: 'Error al verificar disponibilidad', error: error.message });
    }
};
