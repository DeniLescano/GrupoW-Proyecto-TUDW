const reporteService = require('../services/reporteService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para reportes
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ReportesController {
  /**
   * Obtener reporte de reservas en formato JSON, PDF o CSV
   * GET /api/v1/reportes/reservas?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD&formato=PDF|CSV|JSON
   * 
   * Validación y Autorización:
   * - Solo rol 'Administrador' puede acceder (validado en ruta)
   * - Valida parámetro formato (PDF, CSV o JSON)
   * - Valida formato de fechas (YYYY-MM-DD)
   * 
   * Manejo de Datos Complejos:
   * - Obtiene datos de reservas con JOINs a servicios, salones, turnos, usuarios/clientes
   * - Usa stored procedure que realiza las relaciones en la base de datos
   * 
   * Mecanismo de Descarga:
   * - Para CSV: establece Content-Type y Content-Disposition: attachment
   * - Para PDF: establece Content-Type y Content-Disposition: attachment (si se implementa)
   * - Para JSON: retorna JSON estándar
   */
  async reporteReservas(req, res) {
    try {
      const { fecha_desde, fecha_hasta, formato = 'JSON' } = req.query;
      
      // Validar parámetro formato
      const formatosPermitidos = ['PDF', 'CSV', 'JSON'];
      const formatoUpper = formato.toUpperCase();
      
      if (!formatosPermitidos.includes(formatoUpper)) {
        const { response, statusCode } = errorResponse(
          `Formato inválido. Formatos permitidos: ${formatosPermitidos.join(', ')}`,
          null,
          400
        );
        return res.status(statusCode).json(response);
      }
      
      // Obtener reservas detalladas (con datos relacionados mediante JOINs en stored procedure)
      const reservas = await reporteService.getReservasDetalladas(
        fecha_desde || null,
        fecha_hasta || null
      );
      
      // Manejar según formato solicitado
      if (formatoUpper === 'CSV') {
        // Generar CSV usando servicio
        const csv = reporteService.generarCSV(reservas);
        
        // Configurar headers para descarga de archivo
        const filename = `reporte_reservas_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-Type', 'text/csv;charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Enviar archivo CSV
        res.send(csv);
        return;
      }
      
      // Para PDF: generar PDF en backend
      if (formatoUpper === 'PDF') {
        const pdf = await reporteService.generarPDF(reservas);
        
        // Configurar headers para descarga de archivo PDF
        const filename = `reporte_reservas_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Enviar archivo PDF
        res.send(pdf);
        return;
      }
      
      // Formato JSON (por defecto)
      res.json(successResponse(reservas));
    } catch (error) {
      if (error.message.includes('formato') || 
          error.message.includes('anterior') ||
          error.message.includes('Formato inválido')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al generar reporte de reservas:', error);
      const { response, statusCode } = errorResponse('Error al generar el reporte', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Exportar reservas a CSV (endpoint específico para compatibilidad)
   * GET /api/v1/reportes/reservas/csv?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   * 
   * Este endpoint es un alias para GET /api/v1/reportes/reservas?formato=CSV
   */
  async exportarReservasCSV(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      // Obtener reservas detalladas (con datos relacionados mediante JOINs)
      const reservas = await reporteService.getReservasDetalladas(
        fecha_desde || null,
        fecha_hasta || null
      );
      
      // Generar CSV usando servicio
      const csv = reporteService.generarCSV(reservas);
      
      // Configurar headers para descarga de archivo
      const filename = `reporte_reservas_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Enviar archivo CSV
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
