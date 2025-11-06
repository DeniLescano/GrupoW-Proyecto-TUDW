const estadisticasService = require('../services/estadisticasService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para estadísticas
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class EstadisticasController {
  /**
   * Obtener estadísticas de reservas
   * GET /api/v1/estadisticas/reservas?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   */
  async estadisticasReservas(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const estadisticas = await estadisticasService.getEstadisticasReservas(
        fecha_desde || null,
        fecha_hasta || null
      );
      
      res.json(successResponse(estadisticas));
    } catch (error) {
      if (error.message.includes('formato') || 
          error.message.includes('anterior')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener estadísticas de reservas:', error);
      const { response, statusCode } = errorResponse('Error al obtener estadísticas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener estadísticas de salones
   * GET /api/v1/estadisticas/salones
   */
  async estadisticasSalones(req, res) {
    try {
      const estadisticas = await estadisticasService.getEstadisticasSalones();
      res.json(successResponse(estadisticas));
    } catch (error) {
      console.error('Error al obtener estadísticas de salones:', error);
      const { response, statusCode } = errorResponse('Error al obtener estadísticas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   * GET /api/v1/estadisticas/usuarios
   */
  async estadisticasUsuarios(req, res) {
    try {
      const estadisticas = await estadisticasService.getEstadisticasUsuarios();
      res.json(successResponse(estadisticas));
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      const { response, statusCode } = errorResponse('Error al obtener estadísticas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener reservas por mes
   * GET /api/v1/estadisticas/reservas-por-mes?anio=YYYY
   */
  async reservasPorMes(req, res) {
    try {
      const { anio } = req.query;
      const anioNum = anio ? parseInt(anio) : null;
      
      const reservas = await estadisticasService.getReservasPorMes(anioNum);
      res.json(successResponse(reservas));
    } catch (error) {
      if (error.message.includes('número entero')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener reservas por mes:', error);
      const { response, statusCode } = errorResponse('Error al obtener estadísticas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener reservas detalladas para informes
   * GET /api/v1/estadisticas/reservas-detalladas?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   */
  async reservasDetalladas(req, res) {
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
      
      console.error('Error al obtener reservas detalladas:', error);
      const { response, statusCode } = errorResponse('Error al obtener reservas detalladas', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new EstadisticasController();
