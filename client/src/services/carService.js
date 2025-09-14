import api from './api';

// Car service for handling all car-related API calls
export const carService = {
  // Get all cars with optional filters and pagination
  getCars: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add search
    if (params.search) queryParams.append('search', params.search);
    
    // Add filters
    if (params.make) queryParams.append('make', params.make);
    if (params.model) queryParams.append('model', params.model);
    if (params.minYear) queryParams.append('minYear', params.minYear);
    if (params.maxYear) queryParams.append('maxYear', params.maxYear);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.fuelType) queryParams.append('fuelType', params.fuelType);
    if (params.transmission) queryParams.append('transmission', params.transmission);
    if (params.color) queryParams.append('color', params.color);
    if (params.city) queryParams.append('city', params.city);
    
    // Add sorting
    if (params.sort) queryParams.append('sort', params.sort);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/cars?${queryString}` : '/api/cars';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single car by ID
  getCarById: async (carId) => {
    const response = await api.get(`/api/cars/${carId}`);
    return response.data;
  },

  // Get featured cars
  getFeaturedCars: async (limit = 6) => {
    const response = await api.get(`/api/cars/featured?limit=${limit}`);
    return response.data;
  },

  // Create new car (Admin only)
  createCar: async (carData) => {
    const response = await api.post('/api/cars', carData);
    return response.data;
  },

  // Update car (Admin only)
  updateCar: async (carId, carData) => {
    const response = await api.put(`/api/cars/${carId}`, carData);
    return response.data;
  },

  // Delete car (Admin only)
  deleteCar: async (carId) => {
    const response = await api.delete(`/api/cars/${carId}`);
    return response.data;
  },

  // Get car statistics (Admin only)
  getCarStats: async () => {
    const response = await api.get('/api/cars/stats');
    return response.data;
  },

  // Get available makes for filter dropdown
  getMakes: async () => {
    const response = await api.get('/api/cars/makes');
    return response.data;
  },

  // Get available models for a specific make
  getModels: async (make) => {
    const response = await api.get(`/api/cars/models?make=${make}`);
    return response.data;
  }
};

export default carService;
