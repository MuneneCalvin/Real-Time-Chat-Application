const router = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { authController } = require('../controllers');


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;