const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const { userController } = require('../controllers');


router.get('/dropdown', userController.getAllUsers);
router.put('/:id', verifyToken, userController.updateUseById);
router.delete('/:id', verifyToken, userController.deleteUserById);


module.exports = router;

