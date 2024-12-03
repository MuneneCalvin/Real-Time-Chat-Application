const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const moment = require('moment');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Tokens } = require('../models');
const { userService } = require('../services');


// const generateAuthTokens = async (user) => {
//     const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
//     const accessPayload = {
//         _id: user._id,
//         iat: moment().unix(),
//         exp: accessTokenExpires.unix(),
//         type: 'access',
//     };
//     const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET_API);
//     console.log('Access token generated', accessToken);

//     /* Refresh token generation */
//     const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_HOURS, 'hours');

//     const refreshPayload = {
//         _id: user._id,
//         iat: moment().unix(),
//         exp: refreshTokenExpires.unix(),
//         type: 'refresh',
//     };

//     const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET_API);

//     let token = {
//         blacklisted: false,
//         token: refreshToken,
//         user: user._id,
//         expires: refreshTokenExpires,
//         type: 'refresh',
//     };

//     const token_insert = new Tokens(token);
//     let insertToken = await token_insert.save();

//     return {
//         access: {
//             token: accessToken,
//             expires: accessTokenExpires.toDate(),
//         },
//         refresh: {
//             token: refreshToken,
//             expires: refreshTokenExpires.toDate(),
//         },
//     };
// };


/**
    * Generate token
    * @param {ObjectId} userId
    * @param {Moment} expires
    * @param {string} type
    * @param {string} [secret]
    * @returns {string}
 */
const generateToken = (user, expires, type, secret = config.jwt.secret) => {
    const payload = {
        _id: user._id,
        email: user.email,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    };
    return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false, isClient = true) => {
    const tokenDoc = await Tokens.create({
        token,
        user: userId,
        isClient,
        expires: expires.toDate(),
        type,
        blacklisted,
    });
    return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await getToken(token, payload.sub, type);
    if (!tokenDoc) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Token not found');
    }

    return tokenDoc;
};

/**
   * Get token
   * @param {ObjectId} userId
   * @param {String} type
   * @returns {Promise<string>}
   */
const getToken = async (userId, type) => {
    return Tokens.findOne({ user: userId, type });
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, isClient = true, overrideExpiryNumber = null, ignoreRefreshToken = false) => {
    let { accessExpirationMinutes } = config.jwt;
    if (overrideExpiryNumber) {
        accessExpirationMinutes = overrideExpiryNumber;
    }
    const accessTokenExpires = moment().add(accessExpirationMinutes, 'minutes');
    const accessToken = generateToken(user, accessTokenExpires, tokenTypes.ACCESS);
    if (ignoreRefreshToken) {
        return accessToken;
    }

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
    const refreshToken = generateToken(user, refreshTokenExpires, tokenTypes.REFRESH);
    await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH, false, isClient);

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email, isClient = true) => {
    const user = isClient ? await userService.getUserByEmail(email) : await userService.getUserByEmail(email);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
    }
    const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
    const resetPasswordToken = generateToken(user, expires, tokenTypes.RESET_PASSWORD);
    await saveToken(resetPasswordToken, user._id, expires, tokenTypes.RESET_PASSWORD, false, isClient);
    return resetPasswordToken;
};

/**
   * Generate verify email token
   * @param {User} user
   * @returns {Promise<string>}
*/
const generateVerifyEmailToken = async (user, isClient = false) => {
    const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
    const verifyEmailToken = generateToken(user, expires, tokenTypes.VERIFY_EMAIL);
    await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL, false, isClient);
    return verifyEmailToken;
};


module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    getToken,
    generateAuthTokens,
    generateResetPasswordToken,
    generateVerifyEmailToken,
};