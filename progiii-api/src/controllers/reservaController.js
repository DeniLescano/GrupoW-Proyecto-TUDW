const db = require('../config/database');
const catchAsync = require('../utils/catchAsync');

// Listar reservaciones basado en el rol del usuario
exports.browse = catchAsync(async (req, res, next) => {
    const userRole = req.user.tipo_usuario;
    const userId = req.user.id;

    let query = `
        SELECT 
            r.reserva_id, r.fecha_reserva, r.tematica, r.importe_total, r.activo,
            s.titulo as salon_titulo,
            u.nombre as cliente_nombre, u.apellido as cliente_apellido,
            t.hora_desde, t.hora_hasta
        FROM reservas r
        JOIN salones s ON r.salon_id = s.salon_id
        JOIN usuarios u ON r.usuario_id = u.usuario_id
        JOIN turnos t ON r.turno_id = t.turno_id
    `;
    const params = [];

    // Si el usuario es un Cliente, ve solo sus propias reservaciones
    if (userRole === 3) { 
        query += ' WHERE r.usuario_id = ?';
        params.push(userId);
    }

    const [reservas] = await db.query(query, params);
    res.json(reservas);
});

// Obtener una sola reservación por ID
exports.read = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userRole = req.user.tipo_usuario;
    const userId = req.user.id;

    const [reservas] = await db.query('SELECT * FROM reservas WHERE reserva_id = ?', [id]);

    if (reservas.length === 0) {
        return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const reserva = reservas[0];

    // Un cliente solo puede ver sus propias reservaciones
    if (userRole === 3 && reserva.usuario_id !== userId) {
        return res.status(403).json({ message: 'Forbidden: No tienes permiso para ver esta reserva' });
    }

    res.json(reserva);
});


// Crear una nueva reservación y sus servicios asociados
exports.add = catchAsync(async (req, res, next) => {
    const { salon_id, turno_id, fecha_reserva, tematica, servicios } = req.body;
    const usuario_id = req.user.id;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [salones] = await connection.query('SELECT importe FROM salones WHERE salon_id = ?', [salon_id]);
        if (salones.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Salón no encontrado'});
        }
        const importe_salon = salones[0].importe;

        const [resultReserva] = await connection.query(
            'INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, tematica, importe_salon) VALUES (?, ?, ?, ?, ?, ?)',
            [fecha_reserva, salon_id, usuario_id, turno_id, tematica, importe_salon]
        );
        const newReservaId = resultReserva.insertId;

        let importe_servicios_total = 0;

        if (servicios && servicios.length > 0) {
            for (const servicio of servicios) {
                const [servicioInfo] = await connection.query('SELECT importe FROM servicios WHERE servicio_id = ?', [servicio.servicio_id]);
                if (servicioInfo.length > 0) {
                    const importe_servicio = servicioInfo[0].importe;
                    importe_servicios_total += parseFloat(importe_servicio);
                    await connection.query(
                        'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
                        [newReservaId, servicio.servicio_id, importe_servicio]
                    );
                }
            }
        }

        const importe_total = parseFloat(importe_salon) + importe_servicios_total;
        await connection.query('UPDATE reservas SET importe_total = ? WHERE reserva_id = ?', [importe_total, newReservaId]);

        await connection.commit();
        res.status(201).json({ message: 'Reserva creada correctamente', reserva_id: newReservaId, importe_total: importe_total });

    } catch (error) {
        await connection.rollback();
        return next(error);
    } finally {
        connection.release();
    }
});

// Actualizar una reservación (solo Admin)
exports.edit = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { fecha_reserva, salon_id, turno_id, tematica, activo } = req.body;

    const [result] = await db.query(
        'UPDATE reservas SET fecha_reserva = ?, salon_id = ?, turno_id = ?, tematica = ?, activo = ? WHERE reserva_id = ?',
        [fecha_reserva, salon_id, turno_id, tematica, activo, id]
    );

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Reserva no encontrada para actualizar' });
    }

    res.json({ message: 'Reserva actualizada correctamente' });
});

// Borrado lógico de una reservación (solo Admin)
exports.delete = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const [result] = await db.query('UPDATE reservas SET activo = 0 WHERE reserva_id = ?', [id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Reserva no encontrada para eliminar' });
    }

    res.json({ message: 'Reserva eliminada correctamente (soft delete)' });
});