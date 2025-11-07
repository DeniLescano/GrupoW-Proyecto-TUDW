const usuarioService = require('../services/usuarioService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

/**
 * Controlador para usuarios
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class UsuarioController {
  /**
   * Obtener todos los usuarios
   * GET /api/v1/usuarios
   * Query params: page, limit, sort, order, tipo_usuario, activo, nombre_usuario, all
   */
  async browse(req, res) {
    try {
      const includeInactive = req.query.all === 'true';
      
      // Si hay parámetros de paginación, usar método paginado
      if (req.query.page || req.query.limit || req.query.sort || req.query.tipo_usuario || req.query.activo || req.query.nombre_usuario) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'usuario_id';
        const sortOrder = req.query.order || 'asc';
        
        const filters = {};
        if (req.query.tipo_usuario) filters.tipo_usuario = parseInt(req.query.tipo_usuario);
        if (req.query.activo !== undefined) filters.activo = parseInt(req.query.activo);
        if (req.query.nombre_usuario) filters.nombre_usuario = req.query.nombre_usuario;
        
        const result = await usuarioService.getUsuariosPaginated({
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
      const usuarios = await usuarioService.getAllUsuarios(includeInactive);
      res.json(successResponse(usuarios));
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      const { response, statusCode } = errorResponse('Error al obtener los usuarios', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Obtener un usuario por ID
   * GET /api/v1/usuarios/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const usuario = await usuarioService.getUsuarioById(id, includeInactive);
      res.json(successResponse(usuario));
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener usuario:', error);
      const { response, statusCode } = errorResponse('Error al obtener el usuario', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Crear un nuevo usuario
   * POST /api/v1/usuarios
   */
  async add(req, res) {
    try {
      const usuario = await usuarioService.createUsuario(req.body);
      
      res.status(201).json(successResponse(usuario, 'Usuario creado correctamente'));
    } catch (error) {
      if (error.message === 'El nombre de usuario ya existe') {
        const { response, statusCode } = errorResponse(error.message, null, 400);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al crear usuario:', error);
      const { response, statusCode } = errorResponse('Error al crear el usuario', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Actualizar un usuario
   * PUT /api/v1/usuarios/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.usuario_id : null;
      
      const usuario = await usuarioService.updateUsuario(id, req.body, currentUserId);
      
      res.json(successResponse(usuario, 'Usuario actualizado correctamente'));
    } catch (error) {
      if (error.message === 'Usuario no encontrado' || 
          error.message === 'Usuario no encontrado para actualizar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('No puedes desactivar tu propio usuario')) {
        const { response, statusCode } = errorResponse(error.message, null, 403);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al actualizar usuario:', error);
      const { response, statusCode } = errorResponse('Error al actualizar el usuario', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar (soft delete) un usuario
   * DELETE /api/v1/usuarios/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.usuario_id : null;
      
      await usuarioService.deleteUsuario(id, currentUserId);
      
      res.json(successResponse(null, 'Usuario eliminado correctamente (soft delete)'));
    } catch (error) {
      if (error.message === 'Usuario no encontrado para eliminar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('No puedes desactivar tu propio usuario')) {
        const { response, statusCode } = errorResponse(error.message, null, 403);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar usuario:', error);
      const { response, statusCode } = errorResponse('Error al eliminar el usuario', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Eliminar definitivamente (hard delete) un usuario
   * DELETE /api/v1/usuarios/:id/permanent
   */
  async permanentDelete(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.usuario_id : null;
      
      await usuarioService.permanentDeleteUsuario(id, currentUserId);
      
      res.json(successResponse(null, 'Usuario eliminado definitivamente'));
    } catch (error) {
      if (error.message === 'Usuario no encontrado' || error.message.includes('no encontrado')) {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      if (error.message.includes('No puedes eliminar tu propio usuario') || error.message.includes('activo')) {
        const { response, statusCode } = errorResponse(error.message, null, 403);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al eliminar definitivamente usuario:', error);
      const { response, statusCode } = errorResponse('Error al eliminar definitivamente el usuario', error.message, 500);
      res.status(statusCode).json(response);
    }

  /**
   * Obtener el perfil del usuario autenticado
   * GET /api/v1/me
   */
  async readMe(req, res) {
    try {
      const usuarioId = req.user.usuario_id;
      const usuario = await usuarioService.getUsuarioById(usuarioId, true); // Incluir inactivos por si acaso
      res.json(successResponse(usuario));
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al obtener perfil:', error);
      const { response, statusCode } = errorResponse('Error al obtener el perfil', error.message, 500);
      res.status(statusCode).json(response);
    }
  }

  /**
   * Actualizar el perfil del usuario autenticado
   * PUT /api/v1/me
   */
  async editMe(req, res) {
    try {
      const usuarioId = req.user.usuario_id;
      
      // Filtrar los campos que un usuario puede modificar de su propio perfil
      const allowedUpdates = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        celular: req.body.celular,
        foto: req.body.foto
      };

      // Eliminar campos undefined para no enviar `null` a la BD innecesariamente
      Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

      if (Object.keys(allowedUpdates).length === 0) {
        const { response, statusCode } = errorResponse('No se proporcionaron datos para actualizar', null, 400);
        return res.status(statusCode).json(response);
      }

      const usuario = await usuarioService.updateUsuario(usuarioId, allowedUpdates, usuarioId);
      
      res.json(successResponse(usuario, 'Perfil actualizado correctamente'));
    } catch (error) {
      if (error.message === 'Usuario no encontrado' || 
          error.message === 'Usuario no encontrado para actualizar') {
        const { response, statusCode } = errorResponse(error.message, null, 404);
        return res.status(statusCode).json(response);
      }
      
      console.error('Error al actualizar perfil:', error);
      const { response, statusCode } = errorResponse('Error al actualizar el perfil', error.message, 500);
      res.status(statusCode).json(response);
    }
  }
}

module.exports = new UsuarioController();
