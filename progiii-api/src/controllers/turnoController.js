const turnoService = require('../services/turnoService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para turnos
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class TurnoController {
  /**
   * Obtener todos los turnos activos ordenados
   * GET /api/v1/turnos
   * Query params: page, limit, sort, order, activo, orden, all
   */
  async browse(req, res) {
    try {
      const includeInactive = req.query.all === 'true';
      
      // Si hay parámetros de paginación, usar método paginado
      if (req.query.page || req.query.limit || req.query.sort || req.query.activo || req.query.orden) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'orden';
        const sortOrder = req.query.order || 'asc';
        
        const filters = {};
        if (req.query.activo !== undefined) filters.activo = parseInt(req.query.activo);
        if (req.query.orden) filters.orden = parseInt(req.query.orden);
        
        const result = await turnoService.getTurnosPaginated({
          page,
          limit,
          filters,
          sortField,
          sortOrder,
          includeInactive
        });
        
        return res.json(successResponse(result.data, null, { pagination: result.pagination }));
      }
      
      // Si no hay paginación, usar método tradicional
      const turnos = await turnoService.getAllTurnos();
      res.json(successResponse(turnos));
    } catch (error) {
      console.error('Error al obtener turnos:', error);
      const { response, statusCode } = errorResponse('Error al obtener los turnos', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener un turno por ID
   * GET /api/v1/turnos/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const turno = await turnoService.getTurnoById(id, includeInactive);
      res.json(successResponse(turno));
    } catch (error) {
      if (error.message === 'Turno no encontrado') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener turno:', error);
      const { response, statusCode } = errorResponse('Error al obtener el turno', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Crear un nuevo turno
   * POST /api/v1/turnos
   */
  async add(req, res) {
    try {
      const turno = await turnoService.createTurno(req.body);
      
      res.status(201).json(successResponse(turno, 'Turno creado correctamente'));
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('formato') ||
          error.message.includes('posterior')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al crear turno:', error);
      const { response, statusCode } = errorResponse('Error al crear el turno', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Actualizar un turno
   * PUT /api/v1/turnos/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const turno = await turnoService.updateTurno(id, req.body);
      
      res.json(successResponse(turno, 'Turno actualizado correctamente'));
    } catch (error) {
      if (error.message === 'Turno no encontrado' || 
          error.message === 'Turno no encontrado para actualizar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('formato') ||
          error.message.includes('posterior')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al actualizar turno:', error);
      const { response, statusCode } = errorResponse('Error al actualizar el turno', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar (soft delete) un turno
   * DELETE /api/v1/turnos/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await turnoService.deleteTurno(id);
      
      res.json(successResponse(null, 'Turno eliminado correctamente (soft delete)'));
    } catch (error) {
      if (error.message === 'Turno no encontrado para eliminar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar turno:', error);
      const { response, statusCode } = errorResponse('Error al eliminar el turno', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new TurnoController();
