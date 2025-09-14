const { CarListing, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { validateCarListing } = require('../middleware/validation');
const { isValidImageUrl } = require('../utils/modelValidation');

/**
 * @desc    Get all car listings with pagination, search, and filters
 * @route   GET /api/cars
 * @access  Public
 */
const getCars = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query - show all cars for admin users, only available/active for others
  let query = {};
  
  // If user is not authenticated or not admin, only show available and active cars
  if (!req.user || req.user.role !== 'admin') {
    query = { isAvailable: true, status: 'active' };
  }
  // For admin users, show all cars regardless of status

  // Search functionality
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Filter by make
  if (req.query.make) {
    query.make = new RegExp(req.query.make, 'i');
  }

  // Filter by model
  if (req.query.model) {
    query.model = new RegExp(req.query.model, 'i');
  }

  // Filter by year range
  if (req.query.minYear || req.query.maxYear) {
    query.year = {};
    if (req.query.minYear) query.year.$gte = parseInt(req.query.minYear);
    if (req.query.maxYear) query.year.$lte = parseInt(req.query.maxYear);
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Filter by fuel type
  if (req.query.fuelType) {
    query.fuelType = req.query.fuelType;
  }

  // Filter by transmission
  if (req.query.transmission) {
    query.transmission = req.query.transmission;
  }

  // Sort options
  let sort = { createdAt: -1 }; // Default: newest first
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'year_asc':
        sort = { year: 1 };
        break;
      case 'year_desc':
        sort = { year: -1 };
        break;
      case 'views':
        sort = { views: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
    }
  }

  // Execute query
  const cars = await CarListing.find(query)
    .populate('createdBy', 'email profile.firstName profile.lastName')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const total = await CarListing.countDocuments(query);

  // Get unique makes and models for filter options
  const makes = await CarListing.distinct('make', { isAvailable: true, status: 'active' });
  const models = await CarListing.distinct('model', { isAvailable: true, status: 'active' });

  res.status(200).json({
    success: true,
    count: cars.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: cars,
    filters: {
      makes: makes.sort(),
      models: models.sort(),
      fuelTypes: ['petrol', 'diesel', 'hybrid', 'electric', 'other'],
      transmissions: ['manual', 'automatic', 'semi-automatic']
    }
  });
});

/**
 * @desc    Get single car listing
 * @route   GET /api/cars/:id
 * @access  Public
 */
const getCar = asyncHandler(async (req, res) => {
  const car = await CarListing.findById(req.params.id)
    .populate('createdBy', 'email profile.firstName profile.lastName profile.phone contactInfo');

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car listing not found'
    });
  }

  // Increment views
  await CarListing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.status(200).json({
    success: true,
    data: car
  });
});

/**
 * @desc    Create new car listing
 * @route   POST /api/cars
 * @access  Private (Admin only)
 */
const createCar = asyncHandler(async (req, res) => {
  // Validate image URL
  if (!isValidImageUrl(req.body.imageUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid image URL'
    });
  }

  const carData = {
    ...req.body,
    createdBy: req.user.id
  };

  const car = await CarListing.create(carData);

  // Populate createdBy field
  await car.populate('createdBy', 'email profile.firstName profile.lastName');

  res.status(201).json({
    success: true,
    message: 'Car listing created successfully',
    data: car
  });
});

/**
 * @desc    Update car listing
 * @route   PUT /api/cars/:id
 * @access  Private (Admin only)
 */
const updateCar = asyncHandler(async (req, res) => {
  let car = await CarListing.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car listing not found'
    });
  }

  // Validate image URL if provided
  if (req.body.imageUrl && !isValidImageUrl(req.body.imageUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid image URL'
    });
  }

  car = await CarListing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('createdBy', 'email profile.firstName profile.lastName');

  res.status(200).json({
    success: true,
    message: 'Car listing updated successfully',
    data: car
  });
});

/**
 * @desc    Delete car listing
 * @route   DELETE /api/cars/:id
 * @access  Private (Admin only)
 */
const deleteCar = asyncHandler(async (req, res) => {
  const car = await CarListing.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car listing not found'
    });
  }

  await car.remove();

  res.status(200).json({
    success: true,
    message: 'Car listing deleted successfully'
  });
});

/**
 * @desc    Get car statistics
 * @route   GET /api/cars/stats
 * @access  Private (Admin only)
 */
const getCarStats = asyncHandler(async (req, res) => {
  const stats = await CarListing.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        averagePrice: { $avg: '$price' }
      }
    }
  ]);

  const totalCars = await CarListing.countDocuments();
  const availableCars = await CarListing.countDocuments({ isAvailable: true, status: 'active' });
  const soldCars = await CarListing.countDocuments({ status: 'sold' });

  res.status(200).json({
    success: true,
    data: {
      totalCars,
      availableCars,
      soldCars,
      statusBreakdown: stats,
      totalViews: stats.reduce((sum, stat) => sum + stat.totalViews, 0)
    }
  });
});

/**
 * @desc    Get featured cars (most viewed)
 * @route   GET /api/cars/featured
 * @access  Public
 */
const getFeaturedCars = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const cars = await CarListing.find({ isAvailable: true, status: 'active' })
    .sort({ views: -1 })
    .limit(limit)
    .populate('createdBy', 'email profile.firstName profile.lastName')
    .lean();

  res.status(200).json({
    success: true,
    count: cars.length,
    data: cars
  });
});

module.exports = {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getCarStats,
  getFeaturedCars
};
