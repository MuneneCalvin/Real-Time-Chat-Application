const { messageService } = require('../services');

const sendMessage = async (req, res) => {
    try {
        const message = await messageService.sendMessageToConversation(req.body);
        res.status(201).json({ message: 'Message Sent Successfully', message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await messageService.getMessagesOfConversation(req.params.userId1, req.params.userId2);
        res.status(200).json({ message: 'Messages Fetched Successfully', messages });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


module.exports = {
    sendMessage,
    getMessages,
};