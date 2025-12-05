const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

const JWT_SECRET = config.jwt.secret;

/**
 * Middleware to authenticate JWT token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Přístup odepřen. Přihlaste se prosím.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ // Invalid token is authentication failure, not forbidden
        success: false,
        error: 'Neplatný nebo expirovaný token'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Optional authentication middleware - adds user to request if valid token present
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};

module.exports = { authenticateToken, optionalAuth };
