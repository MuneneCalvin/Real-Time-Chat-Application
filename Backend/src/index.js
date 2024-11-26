require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const timeout = require('connect-timeout');
const cors = require('cors');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const config = require('./config/config');
const morgan = require('./config/morgan');
const logger = require('./config/logger');
const { jwtStrategy } = require('./config/passport');
const ApiError = require('./utils/ApiError')
const routes = require('./routes');


const app = express();
let expressServer;

if (config.env !== 'test') {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
}

mongoose.connect(config.mongoose.url, config.mongoose.options)
    .then(() => {
    logger.info('Connected to MongoDB');
    expressServer = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });
});

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(cors());
app.options('*', cors());
app.use(timeout('180s'));

// parse json request body
app.use(express.json({ limit: '50mb' }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);


// Api routes
app.get('/', (req, res) => {
    res.send("Hello, welcome to the Real Time Chat App. 🚀👋");
});

app.use('/.netlify/functions/api', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

module.exports = app;