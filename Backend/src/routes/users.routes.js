const { Router } = require('express');
const router = Router();
const { usersController } = require('../controllers');


router.get('/', usersController.getAllUsers);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;