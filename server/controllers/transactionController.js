const { Transaction, CarListing, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { generateReference } = require('../utils/modelValidation');

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { carId, paymentMethod, billingAddress, notes } = req.body;

  // Check if car exists and is available
  const car = await CarListing.findById(carId);
  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car listing not found'
    });
  }

  if (!car.isAvailable || car.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'This car is no longer available for purchase'
    });
  }

  // Check if user already has a pending transaction for this car
  const existingTransaction = await Transaction.findOne({
    userId: req.user.id,
    carId: carId,
    status: 'pending'
  });

  if (existingTransaction) {
    return res.status(400).json({
      success: false,
      message: 'You already have a pending transaction for this car'
    });
  }

  // Create transaction
  const transactionData = {
    userId: req.user.id,
    carId: carId,
    amount: car.price,
    paymentMethod: paymentMethod || 'credit_card',
    billingAddress: billingAddress || {},
    notes: notes || '',
    paymentDetails: {
      transactionId: generateReference('TXN')
    }
  };

  const transaction = await Transaction.create(transactionData);

  // Populate related data
  await transaction.populate([
    { path: 'userId', select: 'email profile.firstName profile.lastName' },
    { path: 'carId', select: 'title make model year price imageUrl' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: transaction
  });
});

/**
 * @desc    Get user transactions
 * @route   GET /api/transactions/user/:userId
 * @access  Private
 */
const getUserTransactions = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if user is accessing their own transactions or is admin
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access these transactions'
    });
  }

  // Build query
  let query = { userId };
  if (req.query.status) {
    query.status = req.query.status;
  }

  const transactions = await Transaction.find(query)
    .populate('carId', 'title make model year price imageUrl')
    .populate('userId', 'email profile.firstName profile.lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('userId', 'email profile.firstName profile.lastName profile.phone')
    .populate('carId', 'title make model year price imageUrl createdBy')
    .populate('cancelledBy', 'email profile.firstName profile.lastName');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user is authorized to view this transaction
  if (req.user.id !== transaction.userId._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this transaction'
    });
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

/**
 * @desc    Complete transaction
 * @route   PUT /api/transactions/:id/complete
 * @access  Private
 */
const completeTransaction = asyncHandler(async (req, res) => {
  const { paymentDetails } = req.body;

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user is authorized to complete this transaction
  if (req.user.id !== transaction.userId.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this transaction'
    });
  }

  if (transaction.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Transaction is not in pending status'
    });
  }

  // Complete the transaction
  await transaction.complete(paymentDetails);

  // Mark car as sold
  const car = await CarListing.findById(transaction.carId);
  if (car) {
    await car.markAsSold();
  }

  // Populate related data
  await transaction.populate([
    { path: 'userId', select: 'email profile.firstName profile.lastName' },
    { path: 'carId', select: 'title make model year price imageUrl' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Transaction completed successfully',
    data: transaction
  });
});

/**
 * @desc    Cancel transaction
 * @route   PUT /api/transactions/:id/cancel
 * @access  Private
 */
const cancelTransaction = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check if user is authorized to cancel this transaction
  if (req.user.id !== transaction.userId.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this transaction'
    });
  }

  if (transaction.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Transaction is not in pending status'
    });
  }

  // Cancel the transaction
  await transaction.cancel(req.user.id, reason);

  // Populate related data
  await transaction.populate([
    { path: 'userId', select: 'email profile.firstName profile.lastName' },
    { path: 'carId', select: 'title make model year price imageUrl' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Transaction cancelled successfully',
    data: transaction
  });
});

/**
 * @desc    Get transaction statistics
 * @route   GET /api/transactions/stats
 * @access  Private (Admin only)
 */
const getTransactionStats = asyncHandler(async (req, res) => {
  const stats = await Transaction.getStatistics();

  const totalTransactions = await Transaction.countDocuments();
  const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
  const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
  const cancelledTransactions = await Transaction.countDocuments({ status: 'cancelled' });

  // Calculate total revenue
  const revenueStats = await Transaction.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        averageTransactionValue: { $avg: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      cancelledTransactions,
      statusBreakdown: stats,
      revenue: revenueStats[0] || { totalRevenue: 0, averageTransactionValue: 0, count: 0 }
    }
  });
});

/**
 * @desc    Get all transactions (Admin only)
 * @route   GET /api/transactions
 * @access  Private (Admin only)
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query
  let query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.userId) {
    query.userId = req.query.userId;
  }

  const transactions = await Transaction.find(query)
    .populate('userId', 'email profile.firstName profile.lastName')
    .populate('carId', 'title make model year price imageUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

module.exports = {
  createTransaction,
  getUserTransactions,
  getTransaction,
  completeTransaction,
  cancelTransaction,
  getTransactionStats,
  getAllTransactions
};
