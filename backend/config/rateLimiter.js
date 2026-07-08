const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request on this ip.',
});

module.exports = apiLimiter;
