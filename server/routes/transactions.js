const express = require('express');
const {
  createTransaction,
  getUserTransactions,
  getTransaction,
  completeTransaction,
  cancelTransaction,
  getTransactionStats,
  getAllTransactions
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin routes
router.get('/', authorize('admin'), getAllTransactions);
router.get('/stats', authorize('admin'), getTransactionStats);

// User routes
router.post('/', createTransaction);
router.get('/user/:userId', getUserTransactions);
router.get('/:id', getTransaction);
router.put('/:id/complete', completeTransaction);
router.put('/:id/cancel', cancelTransaction);

module.exports = router;
