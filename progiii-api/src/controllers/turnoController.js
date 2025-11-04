const turnoService = require('../services/turnoService');

/**
 * Controlador para turnos
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class TurnoController {
  /**
   * Obtener todos los turnos activos ordenados
   * GET /api/turnos
   */
  async browse(req, res) {
    try {
      const turnos = await turnoService.getAllTurnos();
      res.json(turnos);
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      res.status(500).json({ message: 'Error al obtener los turnos', error: error.message });
    }
  }

  /**
   * Obtener un turno por ID
   * GET /api/turnos/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const turno = await turnoService.getTurnoById(id, includeInactive);
      res.json(turno);
    } catch (error) {
      if (error.message === 'Turno no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al obtener turno:', error);
      res.status(500).json({ message: 'Error al obtener el turno', error: error.message });
    }
  }

  /**
   * Crear un nuevo turno
   * POST /api/turnos
   */
  async add(req, res) {
    try {
      const turno = await turnoService.createTurno(req.body);
      
      res.status(201).json({
        message: 'Turno creado correctamente',
        turno
      });
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('formato') ||
          error.message.includes('posterior')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al crear turno:', error);
      res.status(500).json({ message: 'Error al crear el turno', error: error.message });
    }
  }

  /**
   * Actualizar un turno
   * PUT /api/turnos/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const turno = await turnoService.updateTurno(id, req.body);
      
      res.json({
        message: 'Turno actualizado correctamente',
        turno
      });
    } catch (error) {
      if (error.message === 'Turno no encontrado' || 
          error.message === 'Turno no encontrado para actualizar') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('formato') ||
          error.message.includes('posterior')) {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al actualizar turno:', error);
      res.status(500).json({ message: 'Error al actualizar el turno', error: error.message });
    }
  }

  /**
   * Eliminar (soft delete) un turno
   * DELETE /api/turnos/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await turnoService.deleteTurno(id);
      
      res.json({ message: 'Turno eliminado correctamente (soft delete)' });
    } catch (error) {
      if (error.message === 'Turno no encontrado para eliminar') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al eliminar turno:', error);
      res.status(500).json({ message: 'Error al eliminar el turno', error: error.message });
    }
  }
}

module.exports = new TurnoController();
