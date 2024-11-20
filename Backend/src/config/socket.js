const { Server } = require('socket.io');
const http = require('http');
const logger = require('../config/logger');
const { Users, Messages } = require('../models');
const { sendMessageToConversation, getMessagesOfConversation } = require('../services/message.service');

const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});


io.on('connection', (socket) => {
    logger.info('User connected', socket.id);

    socket.on('join', async (userId) => {
        const user = await Users.findById(userId);
        if (!user) {
            logger.error('User not found');
            return;
        }
        socket.join(userId);
    });

    socket.on('sendMessageToConversation', async (data) => {
        const { sender, receiver, message } = data;
        try {
            const sentMessage = await sendMessageToConversation(sender, receiver, message);
            socket.emit('messageSent', sentMessage);
        } catch (error) {
            logger.error('Error in sendMessageToConversation event:', error);
        }
    });

    socket.on('getMessagesOfConversation', async (data) => {
        const { userId1, userId2 } = data;
        try {
            const messages = await getMessagesOfConversation(userId1, userId2);
            socket.emit('conversationMessages', messages);
        } catch (error) {
            logger.error('Error in getMessagesOfConversation event:', error);
        }
    });

    socket.on('typing', (data) => {
        const { sender, receiver } = data;
        io.to(receiver).emit('typing', sender);
    });

    socket.on('read', async (data) => {
        const { sender, receiver } = data;
        await Messages.updateMany({ sender, receiver }, { is_read: true });
        io.to(sender).emit('read', receiver);
    });

    socket.on('readAll', async (userId) => {
        await Messages.updateMany({ receiver: userId }, { is_read: true });
        io.to(userId).emit('readAll');
    });

    socket.on('delete', async (data) => {
        const { sender, receiver } = data;
        await Messages.updateMany({ sender, receiver }, { is_deleted: true });
        io.to(sender).emit('delete', receiver);
    });

    socket.on('disconnect', () => {
        logger.info('User disconnected');
    });
});




