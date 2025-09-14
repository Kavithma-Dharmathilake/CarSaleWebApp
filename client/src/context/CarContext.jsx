import React, { createContext, useContext, useReducer, useEffect } from 'react';
import carService from '../services/carService';

// Create Car Context
const CarContext = createContext();

// Car Reducer
const carReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_CARS_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_CARS_SUCCESS':
      return {
        ...state,
        loading: false,
        cars: action.payload.cars,
        pagination: action.payload.pagination,
        error: null
      };
    case 'FETCH_CARS_FAILURE':
      return {
        ...state,
        loading: false,
        cars: [],
        pagination: null,
        error: action.payload
      };
    case 'FETCH_CAR_START':
      return {
        ...state,
        carLoading: true,
        carError: null
      };
    case 'FETCH_CAR_SUCCESS':
      return {
        ...state,
        carLoading: false,
        selectedCar: action.payload,
        carError: null
      };
    case 'FETCH_CAR_FAILURE':
      return {
        ...state,
        carLoading: false,
        selectedCar: null,
        carError: action.payload
      };
    case 'FETCH_FEATURED_START':
      return {
        ...state,
        featuredLoading: true,
        featuredError: null
      };
    case 'FETCH_FEATURED_SUCCESS':
      return {
        ...state,
        featuredLoading: false,
        featuredCars: action.payload,
        featuredError: null
      };
    case 'FETCH_FEATURED_FAILURE':
      return {
        ...state,
        featuredLoading: false,
        featuredCars: [],
        featuredError: action.payload
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          search: '',
          make: '',
          model: '',
          minYear: '',
          maxYear: '',
          minPrice: '',
          maxPrice: '',
          fuelType: '',
          transmission: '',
          color: '',
          city: '',
          sort: 'createdAt_desc'
        }
      };
    case 'CREATE_CAR_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'CREATE_CAR_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'CREATE_CAR_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'UPDATE_CAR_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'UPDATE_CAR_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'UPDATE_CAR_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'DELETE_CAR_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'DELETE_CAR_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'DELETE_CAR_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        carError: null,
        featuredError: null
      };
    default:
      return state;
  }
};

// Initial State
const initialState = {
  cars: [],
  selectedCar: null,
  featuredCars: [],
  loading: false,
  carLoading: false,
  featuredLoading: false,
  error: null,
  carError: null,
  featuredError: null,
  pagination: null,
  filters: {
    search: '',
    make: '',
    model: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    fuelType: '',
    transmission: '',
    color: '',
    city: '',
    sort: 'createdAt_desc'
  }
};

// Car Provider Component
export const CarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(carReducer, initialState);

  // Fetch cars with filters
  const fetchCars = async (filters = {}, page = 1, limit = 12) => {
    dispatch({ type: 'FETCH_CARS_START' });
    try {
      const params = {
        ...filters,
        page,
        limit
      };
      const response = await carService.getCars(params);
      
      dispatch({
        type: 'FETCH_CARS_SUCCESS',
        payload: {
          cars: response.data,
          pagination: {
            currentPage: response.page,
            totalPages: response.pages,
            totalCount: response.total,
            hasNext: response.page < response.pages,
            hasPrev: response.page > 1
          }
        }
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch cars';
      dispatch({
        type: 'FETCH_CARS_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch single car
  const fetchCarById = async (carId) => {
    dispatch({ type: 'FETCH_CAR_START' });
    try {
      const response = await carService.getCarById(carId);
      
      dispatch({
        type: 'FETCH_CAR_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch car details';
      dispatch({
        type: 'FETCH_CAR_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch featured cars
  const fetchFeaturedCars = async (limit = 6) => {
    dispatch({ type: 'FETCH_FEATURED_START' });
    try {
      const response = await carService.getFeaturedCars(limit);
      
      dispatch({
        type: 'FETCH_FEATURED_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch featured cars';
      dispatch({
        type: 'FETCH_FEATURED_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: { ...state.filters, ...filters }
    });
  };

  // Clear filters
  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Search cars
  const searchCars = async (searchTerm, page = 1) => {
    const filters = { ...state.filters, search: searchTerm };
    return await fetchCars(filters, page);
  };

  // Apply filters
  const applyFilters = async (newFilters, page = 1) => {
    const filters = { ...state.filters, ...newFilters };
    setFilters(filters);
    return await fetchCars(filters, page);
  };

  // Create car (Admin only)
  const createCar = async (carData) => {
    dispatch({ type: 'CREATE_CAR_START' });
    try {
      const response = await carService.createCar(carData);
      
      dispatch({
        type: 'CREATE_CAR_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create car';
      dispatch({
        type: 'CREATE_CAR_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update car (Admin only)
  const updateCar = async (carId, carData) => {
    dispatch({ type: 'UPDATE_CAR_START' });
    try {
      const response = await carService.updateCar(carId, carData);
      
      dispatch({
        type: 'UPDATE_CAR_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update car';
      dispatch({
        type: 'UPDATE_CAR_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete car (Admin only)
  const deleteCar = async (carId) => {
    dispatch({ type: 'DELETE_CAR_START' });
    try {
      const response = await carService.deleteCar(carId);
      
      dispatch({
        type: 'DELETE_CAR_SUCCESS',
        payload: carId
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete car';
      dispatch({
        type: 'DELETE_CAR_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    ...state,
    fetchCars,
    fetchCarById,
    fetchFeaturedCars,
    setFilters,
    clearFilters,
    clearError,
    searchCars,
    applyFilters,
    createCar,
    updateCar,
    deleteCar
  };

  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  );
};

// Custom hook to use car context
export const useCar = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCar must be used within a CarProvider');
  }
  return context;
};

export default CarContext;
