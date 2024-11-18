const mongoose = require('mongoose');
const validator = require('validator');


const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email');
            }
        },
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ["Male", 'Female'],
    },
    image_url: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    passwordResetToken: {
        token: String,
        expires: Date,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Users', userSchema);