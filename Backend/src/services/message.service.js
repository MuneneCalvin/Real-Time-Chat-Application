const { Users, Messages, Conversations } = require('../models');
const ApiError = require('../utils/ApiError');

const sendMessageToConversation = async (senderId, receiverId, messageBody) => {
    let conversation = await Conversations.findOne({ is_deleted: false, participants: { $all: [senderId, receiverId] } });
    if (!conversation) {
        conversation = new Conversations({
            participants: [senderId, receiverId],
        });
        await conversation.save();
    }

    const newMessage = new Messages({
        conversation: conversation._id,
        sender: senderId,
        receiver: receiverId,
        message: messageBody,
    });

    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    io.to(receiverId).emit('messageReceived', newMessage);

    return newMessage;
};


const getMessagesOfConversation = async (userId1, userId2) => {
    const conversation = await Conversations.findOne({ is_deleted: false, participants: { $all: [userId1, userId2] } });
    if (!conversation) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
    }

    const messages = await Messages.find({
        $or: [
            { sender: userId1, receiver: userId2 },
            { sender: userId2, receiver: userId1 },
        ],
        is_deleted: false,
    }).sort({ createdAt: -1 });

    return messages;
}


module.exports = {
    sendMessageToConversation,
    getMessagesOfConversation,
};