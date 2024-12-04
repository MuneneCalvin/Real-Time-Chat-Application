const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
    .keys({
        NODE_ENV: Joi.string().valid('production', 'staging', 'development', 'test', 'preprod').required(),
        PORT: Joi.number().default(3000).required(),
        DATABASE_URL: Joi.string().required().description('Mongo DB url'),
        CLIENT_URL: Joi.string().required().description('Client Portal url'),
        JWT_SECRET: Joi.string().required().description('JWT secret key'),
        JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
        JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10).description('minutes after which reset password token expires'),

        SMTP_HOST: Joi.string().description('server that will send the emails'),
        SMTP_PORT: Joi.number().description('port to connect to the email server'),
        SMTP_USERNAME: Joi.string().description('username for email server'),
        SMTP_PASSWORD: Joi.string().description('password for email server'),

        FIREBASE_API_KEY: Joi.string().required().description('Firebase API key'),
        FIREBASE_AUTH_DOMAIN: Joi.string().required().description('Firebase auth domain'),
        FIREBASE_DATABASE_URL: Joi.string().required().description('Firebase database url'),
        FIREBASE_PROJECT_ID: Joi.string().required().description('Firebase project id'),
        FIREBASE_STORAGE_BUCKET: Joi.string().required().description('Firebase storage bucket'),
        FIREBASE_MESSAGING_SENDER_ID: Joi.string().required().description('Firebase messaging sender id'),
        FIREBASE_APP_ID: Joi.string().required().description('Firebase app id'),
        FIREBASE_MEASUREMENT_ID: Joi.string().required().description('Firebase measurement id'),
    })
    .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    clientUrl: envVars.CLIENT_URL,
    mongoose: {
        url: envVars.DATABASE_URL,
        options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        },
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
        resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
        verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    },
    email: {
        smtp: {
        host: envVars.SMTP_HOST,
        port: envVars.SMTP_PORT,
        auth: {
            user: envVars.SMTP_USERNAME,
            pass: envVars.SMTP_PASSWORD,
        },
        },
        from: envVars.EMAIL_FROM,
    },
    logins: {
        username: envVars.USERNAME,
        password: envVars.USER_PASSWORD,
        base_url_erp: envVars.BASE_URL_ERP
    },
    firebaseConfig: {
        apiKey: envVars.FIREBASE_API_KEY,
        authDomain: envVars.FIREBASE_AUTH_DOMAIN,
        databaseURL: envVars.FIREBASE_DATABASE_URL,
        projectId: envVars.FIREBASE_PROJECT_ID,
        storageBucket: envVars.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: envVars.FIREBASE_MESSAGING_SENDER_ID,
        appId: envVars.FIREBASE_APP_ID,
        measurementId: envVars.FIREBASE_MEASUREMENT_ID,
    },
};
