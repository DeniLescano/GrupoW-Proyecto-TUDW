const db = require('../config/database');

// Reporte de reservas para PDF/CSV (usa procedimiento almacenado)
exports.reporteReservas = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    
    const [results] = await db.query(
      'CALL sp_reservas_detalladas(?, ?)',
      [fecha_desde || null, fecha_hasta || null]
    );
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error al generar reporte de reservas:', error);
    res.status(500).json({ message: 'Error al generar el reporte', error: error.message });
  }
};

// Exportar reservas a CSV
exports.exportarReservasCSV = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta } = req.query;
    
    const [results] = await db.query(
      'CALL sp_reservas_detalladas(?, ?)',
      [fecha_desde || null, fecha_hasta || null]
    );
    
    const reservas = results[0];
    
    // Construir CSV
    let csv = 'ID Reserva,Fecha,Cliente,Usuario,Salón,Dirección,Turno,Temática,Importe Salón,Servicios,Importe Total,Estado,Creado\n';
    
    reservas.forEach(reserva => {
      const fecha = reserva.fecha_reserva ? new Date(reserva.fecha_reserva).toLocaleDateString('es-AR') : '';
      const creado = reserva.creado ? new Date(reserva.creado).toLocaleDateString('es-AR') : '';
      const cliente = `"${reserva.cliente_nombre || ''} ${reserva.cliente_apellido || ''}"`.trim();
      const turno = reserva.hora_desde ? `${reserva.hora_desde.substring(0, 5)} - ${reserva.hora_hasta.substring(0, 5)}` : '';
      
      csv += `${reserva.reserva_id},"${fecha}",${cliente},"${reserva.nombre_usuario || ''}","${reserva.salon_titulo || ''}","${reserva.salon_direccion || ''}","${turno}","${reserva.tematica || ''}","${reserva.importe_salon || 0}","${reserva.servicios || 'Sin servicios'}","${reserva.importe_total || 0}","${reserva.activo === 1 ? 'Activa' : 'Cancelada'}","${creado}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=reporte_reservas_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({ message: 'Error al exportar el reporte CSV', error: error.message });
  }
};

