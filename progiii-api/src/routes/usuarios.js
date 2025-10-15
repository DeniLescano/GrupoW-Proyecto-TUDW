const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rutas BREAD para usuarios
router.get('/', usuarioController.browse);
router.get('/:id', usuarioController.read);
router.post('/', usuarioController.add);
router.put('/:id', usuarioController.edit);
router.delete('/:id', usuarioController.delete);

module.exports = router;
