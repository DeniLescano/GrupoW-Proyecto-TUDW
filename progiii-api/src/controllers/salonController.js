const salonService = require('../services/salonService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para salones
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class SalonController {
  /**
   * Obtener todos los salones
   * GET /api/v1/salones
   * Query params: page, limit, sort, order, activo, titulo, direccion, all
   */
  async browse(req, res) {
    try {
      const includeInactive = req.query.all === 'true';
      
      // Si hay parámetros de paginación, usar método paginado
      if (req.query.page || req.query.limit || req.query.sort || req.query.activo || req.query.titulo || req.query.direccion) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'salon_id';
        const sortOrder = req.query.order || 'asc';
        
        const filters = {};
        if (req.query.activo !== undefined) filters.activo = parseInt(req.query.activo);
        if (req.query.titulo) filters.titulo = req.query.titulo;
        if (req.query.direccion) filters.direccion = req.query.direccion;
        
        const result = await salonService.getSalonesPaginated({
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
      const salones = await salonService.getAllSalones(includeInactive);
      res.json(successResponse(salones));
    } catch (error) {
      console.error('Error al obtener salones:', error);
      const { response, statusCode } = errorResponse('Error al obtener los salones', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener un salón por ID
   * GET /api/v1/salones/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const salon = await salonService.getSalonById(id, includeInactive);
      res.json(successResponse(salon));
    } catch (error) {
      if (error.message === 'Salón no encontrado') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener salón:', error);
      const { response, statusCode } = errorResponse('Error al obtener el salón', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Crear un nuevo salón
   * POST /api/v1/salones
   */
  async add(req, res) {
    try {
      const salon = await salonService.createSalon(req.body);
      
      res.status(201).json(successResponse(salon, 'Salón creado correctamente'));
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('negativo')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al crear salón:', error);
      const { response, statusCode } = errorResponse('Error al crear el salón', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Actualizar un salón
   * PUT /api/v1/salones/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const salon = await salonService.updateSalon(id, req.body);
      
      res.json(successResponse(salon, 'Salón actualizado correctamente'));
    } catch (error) {
      if (error.message === 'Salón no encontrado' || 
          error.message === 'Salón no encontrado para actualizar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('requeridos') || 
          error.message.includes('mayor a 0') ||
          error.message.includes('negativo')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al actualizar salón:', error);
      const { response, statusCode } = errorResponse('Error al actualizar el salón', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar (soft delete) un salón
   * DELETE /api/v1/salones/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await salonService.deleteSalon(id);
      
      res.json(successResponse(null, 'Salón eliminado correctamente (soft delete)'));
    } catch (error) {
      if (error.message === 'Salón no encontrado para eliminar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar salón:', error);
      const { response, statusCode } = errorResponse('Error al eliminar el salón', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Verificar disponibilidad de salones para una fecha/turno
   * GET /api/v1/salones/disponibilidad?fecha=YYYY-MM-DD&turno_id=?
   */
  async disponibilidad(req, res) {
    try {
      const { fecha, turno_id } = req.query;
      const turnoId = turno_id ? parseInt(turno_id) : null;
      
      const resultado = await salonService.getSalonesDisponibles(fecha, turnoId);
      
      res.json(successResponse(resultado));
    } catch (error) {
      if (error.message.includes('fecha es requerido') || 
          error.message.includes('formato')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al verificar disponibilidad:', error);
      const { response, statusCode } = errorResponse('Error al verificar disponibilidad', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new SalonController();
