import React, { createContext, useContext, useReducer } from 'react';
import transactionService from '../services/transactionService';

// Create Transaction Context
const TransactionContext = createContext();

// Transaction Reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_TRANSACTION_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'CREATE_TRANSACTION_SUCCESS':
      return {
        ...state,
        loading: false,
        currentTransaction: action.payload,
        error: null
      };
    case 'CREATE_TRANSACTION_FAILURE':
      return {
        ...state,
        loading: false,
        currentTransaction: null,
        error: action.payload
      };
    case 'FETCH_TRANSACTION_START':
      return {
        ...state,
        transactionLoading: true,
        transactionError: null
      };
    case 'FETCH_TRANSACTION_SUCCESS':
      return {
        ...state,
        transactionLoading: false,
        selectedTransaction: action.payload,
        transactionError: null
      };
    case 'FETCH_TRANSACTION_FAILURE':
      return {
        ...state,
        transactionLoading: false,
        selectedTransaction: null,
        transactionError: action.payload
      };
    case 'FETCH_USER_TRANSACTIONS_START':
      return {
        ...state,
        userTransactionsLoading: true,
        userTransactionsError: null
      };
    case 'FETCH_USER_TRANSACTIONS_SUCCESS':
      return {
        ...state,
        userTransactionsLoading: false,
        userTransactions: action.payload.transactions,
        userTransactionsPagination: action.payload.pagination,
        userTransactionsError: null
      };
    case 'FETCH_USER_TRANSACTIONS_FAILURE':
      return {
        ...state,
        userTransactionsLoading: false,
        userTransactions: [],
        userTransactionsPagination: null,
        userTransactionsError: action.payload
      };
    case 'COMPLETE_TRANSACTION_START':
      return {
        ...state,
        completingTransaction: true,
        completeError: null
      };
    case 'COMPLETE_TRANSACTION_SUCCESS':
      return {
        ...state,
        completingTransaction: false,
        currentTransaction: action.payload,
        completeError: null
      };
    case 'COMPLETE_TRANSACTION_FAILURE':
      return {
        ...state,
        completingTransaction: false,
        completeError: action.payload
      };
    case 'CANCEL_TRANSACTION_START':
      return {
        ...state,
        cancellingTransaction: true,
        cancelError: null
      };
    case 'CANCEL_TRANSACTION_SUCCESS':
      return {
        ...state,
        cancellingTransaction: false,
        currentTransaction: action.payload,
        cancelError: null
      };
    case 'CANCEL_TRANSACTION_FAILURE':
      return {
        ...state,
        cancellingTransaction: false,
        cancelError: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        transactionError: null,
        userTransactionsError: null,
        completeError: null,
        cancelError: null
      };
    case 'CLEAR_CURRENT_TRANSACTION':
      return {
        ...state,
        currentTransaction: null
      };
    default:
      return state;
  }
};

// Initial State
const initialState = {
  currentTransaction: null,
  selectedTransaction: null,
  userTransactions: [],
  loading: false,
  transactionLoading: false,
  userTransactionsLoading: false,
  completingTransaction: false,
  cancellingTransaction: false,
  error: null,
  transactionError: null,
  userTransactionsError: null,
  completeError: null,
  cancelError: null,
  userTransactionsPagination: null
};

// Transaction Provider Component
export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Create transaction
  const createTransaction = async (transactionData) => {
    dispatch({ type: 'CREATE_TRANSACTION_START' });
    try {
      const response = await transactionService.createTransaction(transactionData);
      
      dispatch({
        type: 'CREATE_TRANSACTION_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create transaction';
      dispatch({
        type: 'CREATE_TRANSACTION_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch transaction by ID
  const fetchTransactionById = async (transactionId) => {
    dispatch({ type: 'FETCH_TRANSACTION_START' });
    try {
      const response = await transactionService.getTransactionById(transactionId);
      
      dispatch({
        type: 'FETCH_TRANSACTION_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch transaction';
      dispatch({
        type: 'FETCH_TRANSACTION_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch user transactions
  const fetchUserTransactions = async (userId, params = {}) => {
    dispatch({ type: 'FETCH_USER_TRANSACTIONS_START' });
    try {
      const response = await transactionService.getUserTransactions(userId, params);
      
      dispatch({
        type: 'FETCH_USER_TRANSACTIONS_SUCCESS',
        payload: {
          transactions: response.data,
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
      const errorMessage = error.response?.data?.message || 'Failed to fetch user transactions';
      dispatch({
        type: 'FETCH_USER_TRANSACTIONS_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Complete transaction
  const completeTransaction = async (transactionId, paymentDetails) => {
    dispatch({ type: 'COMPLETE_TRANSACTION_START' });
    try {
      const response = await transactionService.completeTransaction(transactionId, paymentDetails);
      
      dispatch({
        type: 'COMPLETE_TRANSACTION_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete transaction';
      dispatch({
        type: 'COMPLETE_TRANSACTION_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Cancel transaction
  const cancelTransaction = async (transactionId, reason) => {
    dispatch({ type: 'CANCEL_TRANSACTION_START' });
    try {
      const response = await transactionService.cancelTransaction(transactionId, reason);
      
      dispatch({
        type: 'CANCEL_TRANSACTION_SUCCESS',
        payload: response.data
      });
      
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel transaction';
      dispatch({
        type: 'CANCEL_TRANSACTION_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Clear current transaction
  const clearCurrentTransaction = () => {
    dispatch({ type: 'CLEAR_CURRENT_TRANSACTION' });
  };

  const value = {
    ...state,
    createTransaction,
    fetchTransactionById,
    fetchUserTransactions,
    completeTransaction,
    cancelTransaction,
    clearError,
    clearCurrentTransaction
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use transaction context
export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export default TransactionContext;
