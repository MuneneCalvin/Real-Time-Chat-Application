const { Users, Messages } = require('../models');
const ApiError = require('../utils/ApiError');


const sendMessage = async (messageBody) => {
    let newMessage = new Messages(messageBody);
    // const 
}