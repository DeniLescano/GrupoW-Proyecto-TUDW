const estadisticasService = require('../services/estadisticasService');

/**
 * Controlador para estadísticas
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class EstadisticasController {
  /**
   * Obtener estadísticas de reservas
   * GET /api/estadisticas/reservas?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   */
  async estadisticasReservas(req, res) {
    try {
      const { fecha_desde, fecha_hasta } = req.query;
      
      const estadisticas = await estadisticasService.getEstadisticasReservas(
        fecha_desde || null,
        fecha_hasta || null
      );
      
      res.json(estadisticas);
    } catch (error) {
      if (error.message.includes('formato') || 
          error.message.includes('anterior')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al obtener estadísticas de reservas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
  }

  /**
   * Obtener estadísticas de salones
   * GET /api/estadisticas/salones
   */
  async estadisticasSalones(req, res) {
    try {
      const estadisticas = await estadisticasService.getEstadisticasSalones();
      res.json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas de salones:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
  }

  /**
   * Obtener estadísticas de usuarios
   * GET /api/estadisticas/usuarios
   */
  async estadisticasUsuarios(req, res) {
    try {
      const estadisticas = await estadisticasService.getEstadisticasUsuarios();
      res.json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
  }

  /**
   * Obtener reservas por mes
   * GET /api/estadisticas/reservas-por-mes?anio=YYYY
   */
  async reservasPorMes(req, res) {
    try {
      const { anio } = req.query;
      const anioNum = anio ? parseInt(anio) : null;
      
      const reservas = await estadisticasService.getReservasPorMes(anioNum);
      res.json(reservas);
    } catch (error) {
      if (error.message.includes('número entero')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al obtener reservas por mes:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
  }

  /**
   * Obtener reservas detalladas para informes
   * GET /api/estadisticas/reservas-detalladas?fecha_desde=YYYY-MM-DD&fecha_hasta=YYYY-MM-DD
   */
  async reservasDetalladas(req, res) {
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
      
      console.error('Error al obtener reservas detalladas:', error);
      res.status(500).json({ message: 'Error al obtener reservas detalladas', error: error.message });
    }
  }
}

module.exports = new EstadisticasController();
