const { authService } = require('../services');

const signup = async (req, res) => {
    try {
        await authService.signup(req.body);
        return res.status(httpStatus.CREATED).json({ message: 'User Signed Up Successfully' });
    } catch (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const user = await authService.login(req.body);
        return res.status(httpStatus.OK).json({ message: 'User Logged In Successfully', user });
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        return res.status(httpStatus.OK).json({ message: 'Password Reset Email Sent' });
    } catch (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.params.token, req.body.password);
        return res.status(httpStatus.OK).json({ message: 'Password Reset Successfully' });
    } catch (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const logout = async (req, res) => {
    try {
        await authService.logout(req.body);
        return res.status(httpStatus.OK).json({ message: 'User Logged Out Successfully' });
    } catch (error) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout,
};