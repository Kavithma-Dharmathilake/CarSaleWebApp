const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarListing',
    required: [true, 'Car ID is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be a positive number'],
    validate: {
      validator: function(v) {
        return v >= 0 && Number.isFinite(v);
      },
      message: 'Amount must be a valid positive number'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed', 'refunded'],
    default: 'pending',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'other'],
    default: 'credit_card'
  },
  paymentDetails: {
    transactionId: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction ID cannot exceed 100 characters']
    },
    paymentGateway: {
      type: String,
      trim: true,
      maxlength: [50, 'Payment gateway cannot exceed 50 characters']
    },
    gatewayTransactionId: {
      type: String,
      trim: true,
      maxlength: [100, 'Gateway transaction ID cannot exceed 100 characters']
    }
  },
  billingAddress: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    district: {
      type: String,
      trim: true,
      maxlength: [50, 'District cannot exceed 50 characters']
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: [10, 'Postal code cannot exceed 10 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters'],
      default: 'Sri Lanka'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
  },
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount must be a positive number'],
    validate: {
      validator: function(v) {
        return v === undefined || (v >= 0 && Number.isFinite(v));
      },
      message: 'Refund amount must be a valid positive number'
    }
  },
  refundedAt: {
    type: Date
  },
  refundReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Refund reason cannot exceed 200 characters']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `LKR ${this.amount.toLocaleString()}`;
});

// Virtual for transaction duration
transactionSchema.virtual('duration').get(function() {
  if (this.completedAt) {
    return this.completedAt - this.createdAt;
  }
  return Date.now() - this.createdAt;
});

// Virtual for is active (not completed or cancelled)
transactionSchema.virtual('isActive').get(function() {
  return this.status === 'pending';
});

// Indexes for better query performance
transactionSchema.index({ userId: 1 });
transactionSchema.index({ carId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ completedAt: -1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ carId: 1, status: 1 });

// Compound index for user transactions
transactionSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to set completion/cancellation dates
transactionSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if ((this.status === 'cancelled' || this.status === 'failed') && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

// Instance method to complete transaction
transactionSchema.methods.complete = function(paymentDetails = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (paymentDetails.transactionId) {
    this.paymentDetails.transactionId = paymentDetails.transactionId;
  }
  if (paymentDetails.paymentGateway) {
    this.paymentDetails.paymentGateway = paymentDetails.paymentGateway;
  }
  if (paymentDetails.gatewayTransactionId) {
    this.paymentDetails.gatewayTransactionId = paymentDetails.gatewayTransactionId;
  }
  return this.save();
};

// Instance method to cancel transaction
transactionSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  if (reason) {
    this.cancellationReason = reason;
  }
  return this.save();
};

// Instance method to process refund
transactionSchema.methods.processRefund = function(amount, reason) {
  this.status = 'refunded';
  this.refundAmount = amount || this.amount;
  this.refundedAt = new Date();
  if (reason) {
    this.refundReason = reason;
  }
  return this.save();
};

// Instance method to get transaction summary
transactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    amount: this.formattedAmount,
    status: this.status,
    createdAt: this.createdAt,
    completedAt: this.completedAt,
    isActive: this.isActive
  };
};

// Static method to find user transactions
transactionSchema.statics.findByUser = function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('carId', 'title make model year price imageUrl');
};

// Static method to find car transactions
transactionSchema.statics.findByCar = function(carId) {
  return this.find({ carId }).populate('userId', 'email profile.firstName profile.lastName');
};

// Static method to find completed transactions
transactionSchema.statics.findCompleted = function() {
  return this.find({ status: 'completed' }).populate('userId carId');
};

// Static method to find pending transactions
transactionSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).populate('userId carId');
};

// Static method to get transaction statistics
transactionSchema.statics.getStatistics = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

// Pre-remove middleware to handle related data
transactionSchema.pre('remove', async function(next) {
  try {
    // If transaction is completed, mark car as unavailable
    if (this.status === 'completed') {
      await this.model('CarListing').findByIdAndUpdate(
        this.carId,
        { isAvailable: false, status: 'sold' }
      );
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
