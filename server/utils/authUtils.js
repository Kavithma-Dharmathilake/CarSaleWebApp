const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate JWT token for user
 * @param {string} userId - User ID
 * @returns {string} - JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, config.jwt.secret, {
    expiresIn: '7d', // Refresh token valid for 7 days
  });
};

/**
 * Create authentication response
 * @param {object} user - User object
 * @param {string} token - JWT token
 * @returns {object} - Authentication response
 */
const createAuthResponse = (user, token) => {
  return {
    success: true,
    message: 'Authentication successful',
    user: user.getPublicProfile(),
    token,
    expiresIn: config.jwt.expiresIn
  };
};

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {object} - Error response
 */
const createErrorResponse = (message, statusCode = 400) => {
  return {
    success: false,
    message,
    statusCode
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  createAuthResponse,
  createErrorResponse
};
