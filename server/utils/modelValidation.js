const { User, CarListing, Transaction } = require('../models');

/**
 * Validate if user exists and is active
 * @param {string} userId - User ID to validate
 * @returns {Promise<boolean>} - True if user exists and is active
 */
const validateUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.isActive;
  } catch (error) {
    return false;
  }
};

/**
 * Validate if car listing exists and is available
 * @param {string} carId - Car ID to validate
 * @returns {Promise<boolean>} - True if car exists and is available
 */
const validateCarListing = async (carId) => {
  try {
    const car = await CarListing.findById(carId);
    return car && car.isAvailable && car.status === 'active';
  } catch (error) {
    return false;
  }
};

/**
 * Validate if transaction exists and is pending
 * @param {string} transactionId - Transaction ID to validate
 * @returns {Promise<boolean>} - True if transaction exists and is pending
 */
const validateTransaction = async (transactionId) => {
  try {
    const transaction = await Transaction.findById(transactionId);
    return transaction && transaction.status === 'pending';
  } catch (error) {
    return false;
  }
};

/**
 * Check if user has permission to access resource
 * @param {string} userId - User ID
 * @param {string} resourceUserId - Resource owner's user ID
 * @param {string} userRole - User's role
 * @returns {boolean} - True if user has permission
 */
const hasPermission = (userId, resourceUserId, userRole) => {
  // Admin can access everything
  if (userRole === 'admin') {
    return true;
  }
  
  // User can only access their own resources
  return userId.toString() === resourceUserId.toString();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and message
 */
const validatePasswordStrength = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validate image URL format
 * @param {string} imageUrl - Image URL to validate
 * @returns {boolean} - True if image URL is valid
 */
const isValidImageUrl = (imageUrl) => {
  if (!isValidUrl(imageUrl)) {
    return false;
  }
  
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  return imageExtensions.test(imageUrl);
};

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Generate unique reference number
 * @param {string} prefix - Prefix for the reference
 * @returns {string} - Unique reference number
 */
const generateReference = (prefix = 'REF') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

module.exports = {
  validateUser,
  validateCarListing,
  validateTransaction,
  hasPermission,
  isValidEmail,
  validatePasswordStrength,
  isValidUrl,
  isValidImageUrl,
  sanitizeString,
  generateReference
};
