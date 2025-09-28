const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');

// BREAD (Browse, Read, Edit, Add, Delete)
router.get('/', salonController.browse);
router.get('/:id', salonController.read);
router.put('/:id', salonController.edit);
router.post('/', salonController.add);
router.delete('/:id', salonController.delete);

module.exports = router;
