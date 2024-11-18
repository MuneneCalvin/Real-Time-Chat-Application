const httpStatus = require('http-status');
const { authService } = require('../services');

const signup = async (req, res) => {
    try {
        const result = await authService.signup(req.body);
        res.status(201).json({ message: 'User Signed Up Successfully', token: result.token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const user = await authService.login(req.body);
        res.status(200).json({ message: 'User Logged In Successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.status(httpStatus.OK).json({ message: 'Password Reset Email Sent' });
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.params.token, req.body.password);
        res.status(httpStatus.OK).json({ message: 'Password Reset Successfully' });
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        await authService.logout(req.body);
        res.status(httpStatus.OK).json({ message: 'User Logged Out Successfully' });
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout,
};