const { ObjectId } = require('mongodb');
const httpStatus = require('http-status');
const bcryptjs = require('bcryptjs');
const { Users } = require('../models');
const ApiError = require('../utils/ApiError');

const getUserById = async (userId) => {
    const result = await Users.findOne({ _id: new ObjectId(userId), is_deleted: false });
    return result;
};

const getUserByEmail = async (email) => {
    const users = await Users.findOne({ email })
    .select(' image_url full_name')
    if (users == []) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Cannot find User');
    }

    return users;
};

const getUserByCredentials = async (email, password) => {
    const user = await Users.findOne({ email: email });
    if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }

    const isPasswordMatch = await bcryptjs.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }

    return user;
};

const getUsersDropdown = async () => {
    const users = await Users.find({ is_deleted: false }).select('full_name image_url');
    return users;
}

const updateUser = async (userId, updateBody) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    if (updateBody.email && (await Users.isEmailTaken(updateBody.email, userId))) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    if (updateBody.password) {
        updateBody.password = await bcryptjs.hash(updateBody.password, 10);
    }

    const updatedUser = await Users.findOneAndUpdate({ _id: userId }, { $set: updateBody }, { new: true });
    return updatedUser;
};

const deleteUser = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    await Users.updateOne({ _id: userId }, { is_deleted: true });
}

module.exports = {
    getUserById,
    getUserByEmail,
    getUserByCredentials,
    getUsersDropdown,
    updateUser,
    deleteUser,
};