const { User } = require('../models');
const { generateToken, createAuthResponse, createErrorResponse } = require('../utils/authUtils');
const asyncHandler = require('../utils/asyncHandler');
const { validatePasswordStrength, isValidEmail } = require('../utils/modelValidation');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json(createErrorResponse('Please provide a valid email address'));
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json(createErrorResponse(passwordValidation.message));
  }

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json(createErrorResponse('User already exists with this email'));
  }

  // Create user
  const user = await User.create({
    email,
    password,
    role: 'customer' // Default role is customer
  });

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json(createAuthResponse(user, token));
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json(createErrorResponse('Please provide a valid email address'));
  }

  // Check if password is provided
  if (!password) {
    return res.status(400).json(createErrorResponse('Password is required'));
  }

  // Find user and include password for comparison
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    return res.status(401).json(createErrorResponse('Invalid email or password'));
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json(createErrorResponse('Account is deactivated. Please contact support.'));
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json(createErrorResponse('Invalid email or password'));
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(200).json(createAuthResponse(user, token));
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    user: user.getPublicProfile()
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  
  const user = await User.findById(req.user.id);
  
  if (firstName) user.profile.firstName = firstName;
  if (lastName) user.profile.lastName = lastName;
  if (phone) user.profile.phone = phone;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: user.getPublicProfile()
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json(createErrorResponse(passwordValidation.message));
  }
  
  // Get user with password
  const user = await User.findById(req.user.id).select('+password');
  
  // Check current password
  const isCurrentPasswordValid = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json(createErrorResponse('Current password is incorrect'));
  }
  
  // Update password
  user.password = newPassword;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // We could implement token blacklisting here if needed
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Refresh token
 * @route   POST /api/auth/refresh
 * @access  Private
 */
const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user || !user.isActive) {
    return res.status(401).json(createErrorResponse('User not found or inactive'));
  }
  
  // Generate new token
  const token = generateToken(user._id);
  
  res.status(200).json({
    success: true,
    token,
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken
};
