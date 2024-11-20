const { Server } = require('socket.io');
const http = require('http');
const logger = require('../config/logger');
const { Users, Messages } = require('../models');

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

    socket.on('message', async (data) => {
        const { sender, receiver, message } = data;
        const newMessage = new Messages({
            sender,
            receiver,
            message,
        });
        await newMessage.save();

        io.to(receiver).emit('message', newMessage);
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
        logger.info('user disconnected');
    });
});



