const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { messagesController } = require('../controllers');

const router = express.Router();

router.post('/send-message', verifyToken, messagesController.sendMessage);
router.get('/get-messages/:userId1/:userId2', verifyToken, messagesController.getMessages);

module.exports = router;
