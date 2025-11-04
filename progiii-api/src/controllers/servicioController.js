const servicioService = require('../services/servicioService');

/**
 * Controlador para servicios
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ServicioController {
  /**
   * Obtener todos los servicios activos
   * GET /api/servicios
   */
  async browse(req, res) {
    try {
      const servicios = await servicioService.getAllServicios();
      res.json(servicios);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      res.status(500).json({ message: 'Error al obtener los servicios', error: error.message });
    }
  }

  /**
   * Obtener un servicio por ID
   * GET /api/servicios/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const servicio = await servicioService.getServicioById(id, includeInactive);
      res.json(servicio);
    } catch (error) {
      if (error.message === 'Servicio no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al obtener servicio:', error);
      res.status(500).json({ message: 'Error al obtener el servicio', error: error.message });
    }
  }

  /**
   * Crear un nuevo servicio
   * POST /api/servicios
   */
  async add(req, res) {
    try {
      const servicio = await servicioService.createServicio(req.body);
      
      res.status(201).json({
        message: 'Servicio creado correctamente',
        servicio
      });
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('negativo')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al crear servicio:', error);
      res.status(500).json({ message: 'Error al crear el servicio', error: error.message });
    }
  }

  /**
   * Actualizar un servicio
   * PUT /api/servicios/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const servicio = await servicioService.updateServicio(id, req.body);
      
      res.json({
        message: 'Servicio actualizado correctamente',
        servicio
      });
    } catch (error) {
      if (error.message === 'Servicio no encontrado' || 
          error.message === 'Servicio no encontrado para actualizar') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('requeridos') || 
          error.message.includes('negativo')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al actualizar servicio:', error);
      res.status(500).json({ message: 'Error al actualizar el servicio', error: error.message });
    }
  }

  /**
   * Eliminar (soft delete) un servicio
   * DELETE /api/servicios/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await servicioService.deleteServicio(id);
      
      res.json({ message: 'Servicio eliminado correctamente (soft delete)' });
    } catch (error) {
      if (error.message === 'Servicio no encontrado para eliminar') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al eliminar servicio:', error);
      res.status(500).json({ message: 'Error al eliminar el servicio', error: error.message });
    }
  }
}

module.exports = new ServicioController();
