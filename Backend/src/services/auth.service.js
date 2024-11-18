const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const { tokenService, userService } = require('../services');
const { Users, Tokens } = require('../models');


const signup = async (req, res) => {
    const { full_name, email, password } = req.body;
    if (password  !== confirmPassword) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Passwords do not match' });
    }

    const user = await userService.getUserByEmail(email);
    if (user) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already registered' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    await Users.create({ email, password: hashedPassword });

    // Assign Profile Picture to User
    const maleImageUrl = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const femaleImageUrl = `https://avatar.iran.liara.run/public/boy?username=${username}`;

    const newUser = await Users({ full_name, email, password: hashedPassword, image_url: gender === 'Male' ? maleImageUrl : femaleImageUrl })

    // Generate Token
    const token = jwt.sign({ id: newUser._id, name: newUser.full_name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(httpStatus.CREATED).json({ message: 'User Signed Up Successfully', token });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    let user = await getUserByCredentials(email, password);
    if (user) {
        const token = await tokenService.generateAuthTokens(user);

        const isAdmin = user.role === 'admin' ? true : false;
        const isMale = user.gender == 'Male' ? true : user.gender == 'Female' ? true : false;

        let response = { isAdmin, isMale, token, user };
        return response
    } else {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Incorrect email or password' });
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

const resetPassword = async (resetPasswordToken, newPassword) => {
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