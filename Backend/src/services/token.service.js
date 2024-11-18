const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const moment = require('moment');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { Tokens } = require('../models');


const generateAuthTokens = async (user) => {
    const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_MINUTES, 'minutes');
    const accessPayload = {
        _id: user._id,
        iat: moment().unix(),
        exp: accessTokenExpires.unix(),
        type: 'access',
    };
    const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET_API);
    console.log('Access token generated', accessToken);

    /* Refresh token generation */
    const refreshTokenExpires = moment().add(process.env.JWT_REFRESH_EXPIRATION_HOURS, 'hours');

    const refreshPayload = {
        _id: user._id,
        iat: moment().unix(),
        exp: refreshTokenExpires.unix(),
        type: 'refresh',
    };

    const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET_API);

    let token = {
        blacklisted: false,
        token: refreshToken,
        user: user._id,
        expires: refreshTokenExpires,
        type: 'refresh',
    };

    const token_insert = new Tokens(token);
    let insertToken = await token_insert.save();

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

const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, config.jwt.secret);
    const tokenDoc = await getToken(token, payload.sub, type);
    if (!tokenDoc) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Token not found');
    }

    return tokenDoc;
}


module.exports = {
    generateAuthTokens,
    verifyToken,
};