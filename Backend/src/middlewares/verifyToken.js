const jwtDecode = require('jwt-decode');
const { Users } = require('../models');
const logger = require('../config/logger');

async function verifyToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        logger.info(`No Token Provided`);
        return res.status(403).send({ message: 'No token provided.' });
    }

    const token = header.split(' ')[1];
    try {
        const decoded = jwtDecode(token);

        // Check if the token is expired
        if (Date.now() >= decoded.exp * 1000) {
        logger.info(`Token Expired`);
        return res.status(401).send({ message: 'Token expired.' });
        }

        const user = await Users.findById(decoded._id).select('password');
        req.userId = decoded._id;
        req.userName = user.full_name;

        next();
    } catch (err) {
        console.log(err)
        logger.error(`Unauthorized - ${err}`);
        return res.status(401).send({ message: 'Unauthorized.' });
    }
}

module.exports = verifyToken;
