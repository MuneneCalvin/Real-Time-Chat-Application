const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAuthTokens } = require('./token.service');
const { getUserByEmail, getUserByCredentials } = require('../services/user.service');
const { Users, Tokens } = require('../models');


const signup = async (userData) => {
    const { first_name, last_name, email, password, confirmPassword, gender, role } = userData;
    if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
    }

    const user = await Users.findOne({ email });
    if (user) {
        throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Assign Profile Picture to User based on gender
    const maleImageUrl = `https://avatar.iran.liara.run/public/boy?username=${first_name}`;
    const femaleImageUrl = `https://avatar.iran.liara.run/public/boy?username=${first_name}`;
    const image_url = gender === 'Male' ? maleImageUrl : femaleImageUrl;

    // Create the user in the database
    const newUser = await Users.create({ 
        full_name: `${first_name} ${last_name}`, 
        email, 
        password: hashedPassword, 
        image_url,
        role,
        gender,
    });

    // Generate Token
    const token = jwt.sign({ id: newUser._id, name: newUser.full_name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return { token, user: newUser };
};

const login = async (userData) => {
    const { email, password } = userData;
    let user = await getUserByCredentials(email, password);
    if (user) {
        const token = await generateAuthTokens(user);

        const isAdmin = user.role === 'admin' ? true : false;
        const isMale = user.gender == 'Male' ? true : user.gender == 'Female' ? true : false;

        let response = {user, isAdmin, isMale, token };
        return response;   
    } else {
        return "User not found";
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await Users.findOne({ email });
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    // Generate Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    // Send Email
    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const message = `Click here to reset your password: ${resetPasswordUrl}`;
    // Send Email
    // sendEmail(email, 'Password Reset', message);
    res.status(httpStatus.OK).json({ message: 'Password Reset Email Sent' });
};

const resetPassword = async (resetPasswordToken, newPassword, res) => {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await Users.findById(resetPasswordTokenDoc.user);
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    await userService.updateUser(user._id, { password: newPassword });
    await Tokens.deleteMany({ user: user._id, type: tokenTypes.RESET_PASSWORD });
    res.status(httpStatus.OK).json({ message: 'Password Reset Successfully' });
};

const logout = async (refreshToken) => {
    const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
    }
    await refreshTokenDoc.remove();
};


module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout,
};