const rateLimit = require('express-rate-limit');


const generalLimiter = rateLimit({

    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

module.exports = { generalLimiter, authLimiter }; 