const rateLimit = require('express-rate-limit');


const generalLimiter = rateLimit({

    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    validate: {xForwardedForHeader: false}
});

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    validate: {xForwardedForHeader: false}
});

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 5 minutes',
    validate: {xForwardedForHeader: false}
});

module.exports = { generalLimiter, authLimiter, otpLimiter }; 