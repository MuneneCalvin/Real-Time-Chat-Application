const express = require('express');
const authRoutes = require('./auth.routes');
const messagesRoutes = require('./messages.routes');
const userRoutes = require('./users.routes');

const router = express.Router();

const defaultRoutes = [
    { path: '/auth', route: authRoutes },
    { path: '/messages', route: messagesRoutes },
    { path: '/users', route: userRoutes },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});


module.exports = router;