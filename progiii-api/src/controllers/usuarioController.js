const usuarioService = require('../services/usuarioService');

/**
 * Controlador para usuarios
 * Solo maneja HTTP (req/res), delega lógica de negocio a servicios
 */
class UsuarioController {
  /**
   * Obtener todos los usuarios
   * GET /api/usuarios
   */
  async browse(req, res) {
    try {
      const includeInactive = req.query.all === 'true';
      const usuarios = await usuarioService.getAllUsuarios(includeInactive);
      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
  }

  /**
   * Obtener un usuario por ID
   * GET /api/usuarios/:id
   */
  async read(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.all === 'true';
      
      const usuario = await usuarioService.getUsuarioById(id, includeInactive);
      res.json(usuario);
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
  }

  /**
   * Crear un nuevo usuario
   * POST /api/usuarios
   */
  async add(req, res) {
    try {
      const usuario = await usuarioService.createUsuario(req.body);
      
      res.status(201).json({
        message: 'Usuario creado correctamente',
        id: usuario.usuario_id
      });
    } catch (error) {
      if (error.message === 'El nombre de usuario ya existe') {
        return res.status(400).json({ message: error.message });
      }
      
      console.error('Error al crear usuario:', error);
      res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
  }

  /**
   * Actualizar un usuario
   * PUT /api/usuarios/:id
   */
  async edit(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.usuario_id : null;
      
      const usuario = await usuarioService.updateUsuario(id, req.body, currentUserId);
      
      res.json({
        message: 'Usuario actualizado correctamente',
        usuario
      });
    } catch (error) {
      if (error.message === 'Usuario no encontrado' || 
          error.message === 'Usuario no encontrado para actualizar') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('No puedes desactivar tu propio usuario')) {
        return res.status(403).json({ message: error.message });
      }
      
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
  }

  /**
   * Eliminar (soft delete) un usuario
   * DELETE /api/usuarios/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const currentUserId = req.user ? req.user.usuario_id : null;
      
      await usuarioService.deleteUsuario(id, currentUserId);
      
      res.json({ message: 'Usuario eliminado correctamente (soft delete)' });
    } catch (error) {
      if (error.message === 'Usuario no encontrado para eliminar') {
        return res.status(404).json({ message: error.message });
      }
      
      if (error.message.includes('No puedes desactivar tu propio usuario')) {
        return res.status(403).json({ message: error.message });
      }
      
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
  }
}

module.exports = new UsuarioController();
