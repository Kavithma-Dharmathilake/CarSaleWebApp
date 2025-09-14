import api from './api';

// Transaction service for handling all transaction-related API calls
export const transactionService = {
  // Create a new transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/api/transactions', transactionData);
    return response.data;
  },

  // Get user's transactions
  getUserTransactions: async (userId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.carId) queryParams.append('carId', params.carId);
    
    // Add sorting
    if (params.sort) queryParams.append('sort', params.sort);
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `/api/transactions/user/${userId}?${queryString}` 
      : `/api/transactions/user/${userId}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get single transaction by ID
  getTransactionById: async (transactionId) => {
    const response = await api.get(`/api/transactions/${transactionId}`);
    return response.data;
  },

  // Complete a transaction
  completeTransaction: async (transactionId, paymentDetails) => {
    const response = await api.put(`/api/transactions/${transactionId}/complete`, {
      paymentDetails
    });
    return response.data;
  },

  // Cancel a transaction
  cancelTransaction: async (transactionId, reason) => {
    const response = await api.put(`/api/transactions/${transactionId}/cancel`, {
      reason
    });
    return response.data;
  },

  // Get all transactions (Admin only)
  getAllTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.carId) queryParams.append('carId', params.carId);
    
    // Add date filters
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    // Add sorting
    if (params.sort) queryParams.append('sort', params.sort);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/transactions?${queryString}` : '/api/transactions';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get transaction statistics (Admin only)
  getTransactionStats: async () => {
    const response = await api.get('/api/transactions/stats');
    return response.data;
  }
};

export default transactionService;
