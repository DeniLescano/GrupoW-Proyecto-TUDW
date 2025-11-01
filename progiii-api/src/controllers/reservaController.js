const db = require('../config/database');

// Obtener reservas del usuario actual (para clientes)
exports.browseByUser = async (req, res) => {
  try {
    if (!req.user || !req.user.usuario_id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const [reservas] = await db.query(`
      SELECT 
        r.reserva_id, r.fecha_reserva, r.foto_cumpleaniero, r.tematica, r.importe_salon, r.importe_total, r.activo, r.creado, r.modificado,
        s.titulo AS salon_titulo, s.direccion AS salon_direccion,
        u.nombre AS usuario_nombre, u.apellido AS usuario_apellido, u.nombre_usuario AS usuario_nombre_usuario,
        t.hora_desde, t.hora_hasta
      FROM reservas r
      JOIN salones s ON r.salon_id = s.salon_id
      JOIN usuarios u ON r.usuario_id = u.usuario_id
      JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1 AND r.usuario_id = ?
      ORDER BY r.fecha_reserva DESC
    `, [req.user.usuario_id]);
    
    // Obtener servicios para cada reserva
    for (let reserva of reservas) {
      const [servicios] = await db.query(`
        SELECT rs.reserva_servicio_id, rs.importe, ser.descripcion
        FROM reservas_servicios rs
        JOIN servicios ser ON rs.servicio_id = ser.servicio_id
        WHERE rs.reserva_id = ?
      `, [reserva.reserva_id]);
      reserva.servicios = servicios;
    }
    
    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error);
    res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
  }
};

// Obtener todas las reservas (con información relacionada)
exports.browse = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.activo,
        r.creado,
        r.modificado,
        s.salon_id,
        s.titulo as salon_titulo,
        s.direccion as salon_direccion,
        u.usuario_id,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.nombre_usuario,
        t.turno_id,
        t.hora_desde,
        t.hora_hasta,
        t.orden
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.activo = 1
      ORDER BY r.fecha_reserva DESC, t.orden ASC
    `;
    
    const [reservas] = await db.query(query);
    
    // Para cada reserva, obtener sus servicios
    for (let reserva of reservas) {
      const [servicios] = await db.query(`
        SELECT 
          rs.reserva_servicio_id,
          rs.importe,
          s.servicio_id,
          s.descripcion
        FROM reservas_servicios rs
        INNER JOIN servicios s ON rs.servicio_id = s.servicio_id
        WHERE rs.reserva_id = ?
      `, [reserva.reserva_id]);
      
      reserva.servicios = servicios;
    }
    
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
  }
};

// Obtener reservas del usuario actual (para clientes)
exports.browseByUser = async (req, res) => {
  try {
    const userId = req.user.usuario_id;
    
    const query = `
      SELECT 
        r.reserva_id,
        r.fecha_reserva,
        r.foto_cumpleaniero,
        r.tematica,
        r.importe_salon,
        r.importe_total,
        r.activo,
        r.creado,
        s.titulo as salon_titulo,
        s.direccion as salon_direccion,
        t.hora_desde,
        t.hora_hasta
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.usuario_id = ? AND r.activo = 1
      ORDER BY r.fecha_reserva DESC
    `;
    
    const [reservas] = await db.query(query, [userId]);
    
    // Obtener servicios para cada reserva
    for (let reserva of reservas) {
      const [servicios] = await db.query(`
        SELECT 
          s.servicio_id,
          s.descripcion,
          rs.importe
        FROM reservas_servicios rs
        INNER JOIN servicios s ON rs.servicio_id = s.servicio_id
        WHERE rs.reserva_id = ?
      `, [reserva.reserva_id]);
      
      reserva.servicios = servicios;
    }
    
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
  }
};

// Obtener una reserva por ID
exports.read = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        r.*,
        s.titulo as salon_titulo,
        s.direccion as salon_direccion,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        u.nombre_usuario,
        t.hora_desde,
        t.hora_hasta,
        t.orden
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN usuarios u ON r.usuario_id = u.usuario_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ? AND r.activo = 1
    `;
    
    const [reservas] = await db.query(query, [id]);
    
    if (reservas.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    
    const reserva = reservas[0];
    
    // Obtener servicios
    const [servicios] = await db.query(`
      SELECT 
        rs.reserva_servicio_id,
        rs.importe,
        s.servicio_id,
        s.descripcion
      FROM reservas_servicios rs
      INNER JOIN servicios s ON rs.servicio_id = s.servicio_id
      WHERE rs.reserva_id = ?
    `, [id]);
    
    reserva.servicios = servicios;
    
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la reserva', error: error.message });
  }
};

// Crear una nueva reserva
exports.add = async (req, res) => {
  const { fecha_reserva, salon_id, turno_id, foto_cumpleaniero, tematica, servicios, usuario_id: bodyUsuarioId } = req.body;
  // Si es admin y especifica usuario_id, usar ese. Si no, usar el usuario autenticado
  const usuario_id = (req.user.tipo_usuario === 3 && bodyUsuarioId) ? bodyUsuarioId : req.user.usuario_id;

  if (!fecha_reserva || !salon_id || !turno_id) {
    return res.status(400).json({ message: 'fecha_reserva, salon_id y turno_id son requeridos' });
  }

  try {
    // Verificar que el salón existe y está activo
    const [salones] = await db.query('SELECT importe FROM salones WHERE salon_id = ? AND activo = 1', [salon_id]);
    if (salones.length === 0) {
      return res.status(404).json({ message: 'Salón no encontrado o inactivo' });
    }

    const importe_salon = parseFloat(salones[0].importe);
    let importe_servicios = 0;

    // Calcular importe de servicios si se proporcionan
    // Los servicios pueden venir como array de enteros [1, 2, 3] o como array de objetos [{servicio_id: 1}, {servicio_id: 2}]
    if (servicios && servicios.length > 0) {
      const servicioIds = servicios.map(s => {
        if (typeof s === 'number') return s;
        if (typeof s === 'object' && s.servicio_id) return s.servicio_id;
        return null;
      }).filter(id => id !== null && Number.isInteger(id) && id > 0);
      
      if (servicioIds.length === 0) {
        return res.status(400).json({ message: 'Los servicios deben ser números enteros positivos' });
      }
      
      const placeholders = servicioIds.map(() => '?').join(',');
      const [serviciosData] = await db.query(
        `SELECT servicio_id, importe FROM servicios WHERE servicio_id IN (${placeholders}) AND activo = 1`,
        servicioIds
      );

      if (serviciosData.length !== servicioIds.length) {
        return res.status(400).json({ message: 'Uno o más servicios no existen o están inactivos' });
      }

      importe_servicios = serviciosData.reduce((sum, s) => sum + parseFloat(s.importe), 0);
    }

    const importe_total = importe_salon + importe_servicios;

    // Crear la reserva con estado 'pendiente' por defecto
    const [result] = await db.query(
      'INSERT INTO reservas (fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero, tematica, importe_salon, importe_total, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [fecha_reserva, salon_id, usuario_id, turno_id, foto_cumpleaniero || null, tematica || null, importe_salon, importe_total, 'pendiente']
    );

    const reserva_id = result.insertId;

    // Agregar servicios asociados
    if (servicios && servicios.length > 0) {
      const servicioIds = servicios.map(s => {
        if (typeof s === 'number') return s;
        if (typeof s === 'object' && s.servicio_id) return s.servicio_id;
        return null;
      }).filter(id => id !== null && Number.isInteger(id) && id > 0);
      
      for (const servicioId of servicioIds) {
        const [servicioData] = await db.query('SELECT importe FROM servicios WHERE servicio_id = ?', [servicioId]);
        const importe_servicio = parseFloat(servicioData[0].importe);
        
        await db.query(
          'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
          [reserva_id, servicioId, importe_servicio]
        );
      }
    }

    // Obtener la reserva completa creada
    const [reservaCreada] = await db.query(`
      SELECT r.*, s.titulo as salon_titulo, t.hora_desde, t.hora_hasta
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ?
    `, [reserva_id]);

    // Enviar notificaciones
    const NotificationService = require('../services/notificationService');
    NotificationService.notifyReservaCreated(reserva_id, usuario_id).catch(err => {
      console.error('Error al enviar notificaciones:', err);
    });

    res.status(201).json({ message: 'Reserva creada correctamente', reserva: reservaCreada[0] });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
  }
};

// Editar una reserva (solo administradores según requisitos)
exports.edit = async (req, res) => {
  const { id } = req.params;
  const { fecha_reserva, salon_id, turno_id, foto_cumpleaniero, tematica, servicios } = req.body;

  try {
    // Verificar que la reserva existe
    const [reservas] = await db.query('SELECT * FROM reservas WHERE reserva_id = ?', [id]);
    if (reservas.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    let importe_salon = reservas[0].importe_salon;
    let importe_servicios = 0;

    // Si se cambia el salón, actualizar importe
    if (salon_id && salon_id !== reservas[0].salon_id) {
      const [salones] = await db.query('SELECT importe FROM salones WHERE salon_id = ? AND activo = 1', [salon_id]);
      if (salones.length === 0) {
        return res.status(404).json({ message: 'Salón no encontrado o inactivo' });
      }
      importe_salon = parseFloat(salones[0].importe);
    }

    // Actualizar servicios si se proporcionan
    // Los servicios pueden venir como array de enteros [1, 2, 3] o como array de objetos [{servicio_id: 1}, {servicio_id: 2}]
    if (servicios && Array.isArray(servicios)) {
      // Eliminar servicios antiguos
      await db.query('DELETE FROM reservas_servicios WHERE reserva_id = ?', [id]);

      // Agregar nuevos servicios
      if (servicios.length > 0) {
        const servicioIds = servicios.map(s => {
          if (typeof s === 'number') return s;
          if (typeof s === 'object' && s.servicio_id) return s.servicio_id;
          return null;
        }).filter(id => id !== null && Number.isInteger(id) && id > 0);
        
        if (servicioIds.length === 0 && servicios.length > 0) {
          return res.status(400).json({ message: 'Los servicios deben ser números enteros positivos' });
        }
        
        for (const servicioId of servicioIds) {
          const [servicioData] = await db.query('SELECT importe FROM servicios WHERE servicio_id = ? AND activo = 1', [servicioId]);
          if (servicioData.length === 0) {
            return res.status(400).json({ message: `Servicio ${servicioId} no encontrado o inactivo` });
          }
          const importe_servicio = parseFloat(servicioData[0].importe);
          importe_servicios += importe_servicio;
          
          await db.query(
            'INSERT INTO reservas_servicios (reserva_id, servicio_id, importe) VALUES (?, ?, ?)',
            [id, servicioId, importe_servicio]
          );
        }
      }
    } else {
      // Si no se proporcionan servicios, mantener los existentes
      const [serviciosExistentes] = await db.query(
        'SELECT SUM(importe) as total FROM reservas_servicios WHERE reserva_id = ?',
        [id]
      );
      importe_servicios = parseFloat(serviciosExistentes[0].total || 0);
    }

    const importe_total = importe_salon + importe_servicios;

    // Actualizar la reserva
    const updateFields = [];
    const updateValues = [];
    const cambios = [];

    if (fecha_reserva) { updateFields.push('fecha_reserva = ?'); updateValues.push(fecha_reserva); cambios.push('fecha actualizada'); }
    if (salon_id) { updateFields.push('salon_id = ?'); updateValues.push(salon_id); cambios.push('salón actualizado'); }
    if (turno_id) { updateFields.push('turno_id = ?'); updateValues.push(turno_id); cambios.push('turno actualizado'); }
    if (foto_cumpleaniero !== undefined) { updateFields.push('foto_cumpleaniero = ?'); updateValues.push(foto_cumpleaniero); }
    if (tematica !== undefined) { updateFields.push('tematica = ?'); updateValues.push(tematica); }
    
    // Manejo especial del estado: si se cambia a 'confirmada', enviar notificación especial
    let estadoCambiado = false;
    let nuevoEstado = null;
    if (req.body.estado) {
      const estadoAnterior = reservas[0].estado || 'pendiente';
      nuevoEstado = req.body.estado;
      if (estadoAnterior !== nuevoEstado && nuevoEstado === 'confirmada') {
        estadoCambiado = true;
      }
      updateFields.push('estado = ?');
      updateValues.push(nuevoEstado);
      cambios.push(`estado cambiado a ${nuevoEstado}`);
    }
    
    updateFields.push('importe_salon = ?');
    updateValues.push(importe_salon);
    updateFields.push('importe_total = ?');
    updateValues.push(importe_total);
    updateValues.push(id);

    const [result] = await db.query(
      `UPDATE reservas SET ${updateFields.join(', ')} WHERE reserva_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada para actualizar' });
    }

    // Obtener la reserva actualizada
    const [reservaActualizada] = await db.query(`
      SELECT r.*, s.titulo as salon_titulo, t.hora_desde, t.hora_hasta
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ?
    `, [id]);

    // Enviar notificaciones
    const NotificationService = require('../services/notificationService');
    if (estadoCambiado && nuevoEstado === 'confirmada') {
      // Si se confirmó la reserva, enviar notificación especial de confirmación
      NotificationService.notifyReservaConfirmed(id).catch(err => {
        console.error('Error al enviar notificación de confirmación:', err);
      });
    } else {
      // Si solo se actualizó información, enviar notificación de actualización
      NotificationService.notifyReservaUpdated(id, cambios.join(', ')).catch(err => {
        console.error('Error al enviar notificaciones:', err);
      });
    }

    res.json({ message: 'Reserva actualizada correctamente', reserva: reservaActualizada[0] });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ message: 'Error al actualizar la reserva', error: error.message });
  }
};

// Eliminar una reserva (soft delete)
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener usuario_id antes de eliminar
    const [reserva] = await db.query('SELECT usuario_id FROM reservas WHERE reserva_id = ?', [id]);
    
    const [result] = await db.query('UPDATE reservas SET activo = 0 WHERE reserva_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada para eliminar' });
    }

    // Enviar notificaciones
    if (reserva.length > 0) {
      const NotificationService = require('../services/notificationService');
      NotificationService.notifyReservaCancelled(id).catch(err => {
        console.error('Error al enviar notificaciones:', err);
      });
    }

    res.json({ message: 'Reserva eliminada correctamente (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la reserva', error: error.message });
  }
};

// Confirmar una reserva (solo administradores) - cambia estado de 'pendiente' a 'confirmada'
exports.confirmar = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar que la reserva existe
    const [reservas] = await db.query('SELECT * FROM reservas WHERE reserva_id = ? AND activo = 1', [id]);
    if (reservas.length === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const reserva = reservas[0];
    const estadoActual = reserva.estado || 'pendiente';

    // Solo confirmar si está pendiente
    if (estadoActual !== 'pendiente') {
      return res.status(400).json({ 
        message: `La reserva ya está en estado "${estadoActual}". Solo se pueden confirmar reservas pendientes.` 
      });
    }

    // Actualizar estado a confirmada
    const [result] = await db.query(
      'UPDATE reservas SET estado = ? WHERE reserva_id = ?',
      ['confirmada', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reserva no encontrada para confirmar' });
    }

    // Enviar notificación de confirmación
    const NotificationService = require('../services/notificationService');
    NotificationService.notifyReservaConfirmed(id).catch(err => {
      console.error('Error al enviar notificación de confirmación:', err);
    });

    // Obtener la reserva actualizada
    const [reservaActualizada] = await db.query(`
      SELECT r.*, s.titulo as salon_titulo, t.hora_desde, t.hora_hasta
      FROM reservas r
      INNER JOIN salones s ON r.salon_id = s.salon_id
      INNER JOIN turnos t ON r.turno_id = t.turno_id
      WHERE r.reserva_id = ?
    `, [id]);

    res.json({ 
      message: 'Reserva confirmada exitosamente', 
      reserva: reservaActualizada[0] 
    });
  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    res.status(500).json({ message: 'Error al confirmar la reserva', error: error.message });
  }
};

