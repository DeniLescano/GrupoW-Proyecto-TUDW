const estadisticasService = require('../services/estadisticasService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para reportes
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ReportesController {
  /**
   * Obtener reporte de reservas para PDF/CSV
   * GET /api/v1/reportes/reservas?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   */
  async reporteReservas(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const reservas = await estadisticasService.getReservasDetalladas(
        fecha_desde || null,
        fecha_hasta || null
      );
      
      res.json(successResponse(reservas));
    } catch (error) {
      if (error.message.includes('formato') || 
          error.message.includes('anterior')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al generar reporte de reservas:', error);
      const { response, statusCode } = errorResponse('Error al generar el reporte', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Exportar reservas a CSV
   * GET /api/v1/reportes/reservas/csv?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
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
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al exportar CSV:', error);
      const { response, statusCode } = errorResponse('Error al exportar el reporte CSV', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new ReportesController();
