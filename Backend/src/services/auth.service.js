const  bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const { Users } = require('../models');


const signup = async (req, res) => {
    const { full_name, email, password } = req.body;
    if (password  !== confirmPassword) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Passwords do not match' });
    }

    const user = await Users.findOne({ email });
    if (user) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'User already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
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
    const user = await Users.findOne({ email });
    if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid Email or Password' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid Credentials' });
    }

    // Generate Token
    const token = jwt.sign({ id: user._id, name: user.full_name }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(httpStatus.OK).json({ message: 'User Logged In Successfully', token });
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

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findById(decoded.id);
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    await Users.findByIdAndUpdate(user._id, { password: hashedPassword });
    res.status(httpStatus.OK).json({ message: 'Password Reset Successfully' });
};

const logout = async (req, res) => {
    res.status(httpStatus.OK).json({ message: 'User Logged Out Successfully' });
};


module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout,
};