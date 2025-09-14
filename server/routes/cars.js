const express = require('express');
const { 
  getCars, 
  getCar, 
  createCar, 
  updateCar, 
  deleteCar, 
  getCarStats, 
  getFeaturedCars 
} = require('../controllers/carController');
const { protect, optionalProtect, authorize } = require('../middleware/auth');
const { validateCarListing } = require('../middleware/validation');

const router = express.Router();

// Public routes (but with optional authentication for admin features)
router.get('/', optionalProtect, getCars); // Add optional protect middleware to get user info if available
router.get('/featured', getFeaturedCars);
router.get('/stats', protect, authorize('admin'), getCarStats);
router.get('/:id', getCar);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), validateCarListing, createCar);
router.put('/:id', protect, authorize('admin'), updateCar);
router.delete('/:id', protect, authorize('admin'), deleteCar);

module.exports = router;
