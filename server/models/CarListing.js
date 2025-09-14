const mongoose = require('mongoose');

const carListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    minlength: [5, 'Title must be at least 5 characters long']
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters'],
    minlength: [2, 'Make must be at least 2 characters long']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters'],
    minlength: [1, 'Model must be at least 1 character long']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be 1900 or later'],
    max: [2025, 'Year must be 2025 or earlier'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) && v >= 1900 && v <= 2025;
      },
      message: 'Year must be a valid integer between 1900 and 2025'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number'],
    validate: {
      validator: function(v) {
        return v >= 0 && Number.isFinite(v);
      },
      message: 'Price must be a valid positive number'
    }
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(v);
      },
      message: 'Please provide a valid image URL (jpg, jpeg, png, gif, webp)'
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  mileage: {
    type: Number,
    min: [0, 'Mileage must be a positive number'],
    validate: {
      validator: function(v) {
        return v === undefined || (Number.isInteger(v) && v >= 0);
      },
      message: 'Mileage must be a valid positive integer'
    }
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'hybrid', 'electric', 'other'],
    default: 'petrol'
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'semi-automatic'],
    default: 'manual'
  },
  color: {
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [50, 'Feature cannot exceed 50 characters']
  }],
  location: {
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    district: {
      type: String,
      trim: true,
      maxlength: [50, 'District name cannot exceed 50 characters']
    }
  },
  contactInfo: {
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending', 'inactive'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
carListingSchema.virtual('formattedPrice').get(function() {
  return `LKR ${this.price.toLocaleString()}`;
});

// Virtual for car age
carListingSchema.virtual('age').get(function() {
  const currentYear = new Date().getFullYear();
  return currentYear - this.year;
});

// Virtual for full location
carListingSchema.virtual('fullLocation').get(function() {
  if (this.location.city && this.location.district) {
    return `${this.location.city}, ${this.location.district}`;
  }
  return this.location.city || this.location.district || 'Location not specified';
});

// Indexes for better query performance
carListingSchema.index({ make: 1, model: 1 });
carListingSchema.index({ year: 1 });
carListingSchema.index({ price: 1 });
carListingSchema.index({ isAvailable: 1 });
carListingSchema.index({ status: 1 });
carListingSchema.index({ createdBy: 1 });
carListingSchema.index({ createdAt: -1 });
carListingSchema.index({ views: -1 });

// Text index for search functionality
carListingSchema.index({
  title: 'text',
  make: 'text',
  model: 'text',
  description: 'text'
});

// Pre-save middleware to update status based on availability
carListingSchema.pre('save', function(next) {
  if (this.isModified('isAvailable')) {
    if (!this.isAvailable) {
      this.status = 'sold';
    } else if (this.status === 'sold') {
      this.status = 'active';
    }
  }
  next();
});

// Instance method to increment views
carListingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to mark as sold
carListingSchema.methods.markAsSold = function() {
  this.isAvailable = false;
  this.status = 'sold';
  return this.save();
};

// Instance method to get searchable text
carListingSchema.methods.getSearchableText = function() {
  return `${this.title} ${this.make} ${this.model} ${this.year}`.toLowerCase();
};

// Static method to find available cars
carListingSchema.statics.findAvailable = function() {
  return this.find({ isAvailable: true, status: 'active' });
};

// Static method to find cars by make and model
carListingSchema.statics.findByMakeAndModel = function(make, model) {
  const query = { isAvailable: true, status: 'active' };
  if (make) query.make = new RegExp(make, 'i');
  if (model) query.model = new RegExp(model, 'i');
  return this.find(query);
};

// Static method to find cars by price range
carListingSchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  const query = { isAvailable: true, status: 'active' };
  if (minPrice !== undefined) query.price = { $gte: minPrice };
  if (maxPrice !== undefined) {
    query.price = query.price || {};
    query.price.$lte = maxPrice;
  }
  return this.find(query);
};

// Static method to search cars by text
carListingSchema.statics.searchCars = function(searchText) {
  return this.find({
    $text: { $search: searchText },
    isAvailable: true,
    status: 'active'
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Pre-remove middleware to handle related data
carListingSchema.pre('remove', async function(next) {
  try {
    // Update related transactions to cancelled
    await this.model('Transaction').updateMany(
      { carId: this._id },
      { status: 'cancelled' }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('CarListing', carListingSchema);
