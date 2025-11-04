const servicioService = require('../services/servicioService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para servicios
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class ServicioController {
  /**
   * Obtener todos los servicios activos
   * GET /api/v1/servicios
   * Query params: page, limit, sort, order, activo, descripcion, all
   */
  async browse(req, res) {
    try {
      const includeInactive = req.query.all === 'true';
      
      // Si hay parámetros de paginación, usar método paginado
      if (req.query.page || req.query.limit || req.query.sort || req.query.activo || req.query.descripcion) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'servicio_id';
        const sortOrder = req.query.order || 'asc';
        
        const filters = {};
        if (req.query.activo !== undefined) filters.activo = parseInt(req.query.activo);
        if (req.query.descripcion) filters.descripcion = req.query.descripcion;
        
        const result = await servicioService.getServiciosPaginated({
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
      const servicios = await servicioService.getAllServicios();
      res.json(successResponse(servicios));
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      const { response, statusCode } = errorResponse('Error al obtener los servicios', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener un servicio por ID
   * GET /api/v1/servicios/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const servicio = await servicioService.getServicioById(id, includeInactive);
      res.json(successResponse(servicio));
    } catch (error) {
      if (error.message === 'Servicio no encontrado') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener servicio:', error);
      const { response, statusCode } = errorResponse('Error al obtener el servicio', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Crear un nuevo servicio
   * POST /api/v1/servicios
   */
  async add(req, res) {
    try {
      const servicio = await servicioService.createServicio(req.body);
      
      res.status(201).json(successResponse(servicio, 'Servicio creado correctamente'));
    } catch (error) {
      if (error.message.includes('requeridos') || 
          error.message.includes('negativo')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al crear servicio:', error);
      const { response, statusCode } = errorResponse('Error al crear el servicio', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Actualizar un servicio
   * PUT /api/v1/servicios/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      
      const servicio = await servicioService.updateServicio(id, req.body);
      
      res.json(successResponse(servicio, 'Servicio actualizado correctamente'));
    } catch (error) {
      if (error.message === 'Servicio no encontrado' || 
          error.message === 'Servicio no encontrado para actualizar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('requeridos') || 
          error.message.includes('negativo')) {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al actualizar servicio:', error);
      const { response, statusCode } = errorResponse('Error al actualizar el servicio', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar (soft delete) un servicio
   * DELETE /api/v1/servicios/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      await servicioService.deleteServicio(id);
      
      res.json(successResponse(null, 'Servicio eliminado correctamente (soft delete)'));
    } catch (error) {
      if (error.message === 'Servicio no encontrado para eliminar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar servicio:', error);
      const { response, statusCode } = errorResponse('Error al eliminar el servicio', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar definitivamente (hard delete) un servicio
   * DELETE /api/v1/servicios/:id/permanent
   */
  async permanentDelete(req, res) {
    try {
      const { id } = req.params;
      
      await servicioService.permanentDeleteServicio(id);
      
      res.json(successResponse(null, 'Servicio eliminado definitivamente'));
    } catch (error) {
      if (error.message === 'Servicio no encontrado' || error.message.includes('no encontrado')) {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('activo')) {
        const { response, statusCode } = errorResponse(error.message, null, 403);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar definitivamente servicio:', error);
      const { response, statusCode } = errorResponse('Error al eliminar definitivamente el servicio', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new ServicioController();
