const estadisticasService = require('../services/estadisticasService');

/**
 * Controlador para reportes
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ReportesController {
  /**
   * Obtener reporte de reservas para PDF/CSV
   * GET /api/reportes/reservas?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   */
  async reporteReservas(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const reservas = await estadisticasService.getReservasDetalladas(
        fecha_desde || null,
        fecha_hasta || null
      );
      
      res.json(reservas);
    } catch (error) {
      if (error.message.includes('formato') || 
          error.message.includes('anterior')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al generar reporte de reservas:', error);
      res.status(500).json({ message: 'Error al generar el reporte', error: error.message });
    }
  }

  /**
   * Exportar reservas a CSV
   * GET /api/reportes/reservas/csv?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   */
  async exportarReservasCSV(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const reservas = await estadisticasService.getReservasDetalladas(
        fecha_desde || null,
        fecha_hasta || null
      );
      
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
      if (error.message.includes('formato') || 
          error.message.includes('anterior')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al exportar CSV:', error);
      res.status(500).json({ message: 'Error al exportar el reporte CSV', error: error.message });
    }
  }
}

module.exports = new ReportesController();
