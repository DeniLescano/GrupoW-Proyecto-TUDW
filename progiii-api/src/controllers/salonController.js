const salonService = require('../services/salonService');

/**
 * Controlador para salones
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class SalonController {
  /**
   * Obtener todos los salones
   * GET /api/salones
   */
  async browse(req, res) {
    try {
      const includeInactive = req.query.all === 'true';
      const salones = await salonService.getAllSalones(includeInactive);
      res.json(salones);
    } catch (error) {
      console.error('Error al obtener salones:', error);
      res.status(500).json({ message: 'Error al obtener los salones', error: error.message });
    }
  }

  /**
   * Obtener un salón por ID
   * GET /api/salones/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const salon = await salonService.getSalonById(id, includeInactive);
      res.json(salon);
    } catch (error) {
      if (error.message === 'Salón no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al obtener salón:', error);
      res.status(500).json({ message: 'Error al obtener el salón', error: error.message });
    }
  }

  /**
   * Crear un nuevo salón
   * POST /api/salones
   */
  async add(req, res) {
    try {
      const salon = await salonService.createSalon(req.body);
      
      res.status(201).json({
        message: 'Salón creado correctamente',
        salon
      });
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('negativo')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al crear salón:', error);
      res.status(500).json({ message: 'Error al crear el salón', error: error.message });
    }
  }

  /**
   * Actualizar un salón
   * PUT /api/salones/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const salon = await salonService.updateSalon(id, req.body);
      
      res.json({
        message: 'Salón actualizado correctamente',
        salon
      });
    } catch (error) {
      if (error.message === 'Salón no encontrado' || 
          error.message === 'Salón no encontrado para actualizar') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('negativo')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al actualizar salón:', error);
      res.status(500).json({ message: 'Error al actualizar el salón', error: error.message });
    }
  }

  /**
   * Eliminar (soft delete) un salón
   * DELETE /api/salones/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await salonService.deleteSalon(id);
      
      res.json({ message: 'Salón eliminado correctamente (soft delete)' });
    } catch (error) {
      if (error.message === 'Salón no encontrado para eliminar') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al eliminar salón:', error);
      res.status(500).json({ message: 'Error al eliminar el salón', error: error.message });
    }
  }

  /**
   * Verificar disponibilidad de salones para una fecha/turno
   * GET /api/salones/disponibilidad?fecha=YYYY-MM-DD&turno_id=?
   */
  async disponibilidad(req, res) {
    try {
      const { fecha, turno_id } = req.query;
      const turnoId = turno_id ? parseInt(turno_id) : null;
      
      const resultado = await salonService.getSalonesDisponibles(fecha, turnoId);
      
      res.json(resultado);
    } catch (error) {
      if (error.message.includes('fecha es requerido') || 
          error.message.includes('formato')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al verificar disponibilidad:', error);
      res.status(500).json({ message: 'Error al verificar disponibilidad', error: error.message });
    }
  }
}

module.exports = new SalonController();
