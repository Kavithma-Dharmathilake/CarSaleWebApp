const express = require('express');
const router = express.Router();

/**
 * @desc    API Documentation
 * @route   GET /api/docs
 * @access  Public
 */
router.get('/', (req, res) => {
  const apiDocs = {
    title: 'Car Sales API Documentation',
    version: '1.0.0',
    description: 'RESTful API for Car Sales Web Application',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      authentication: {
        'POST /auth/register': {
          description: 'Register a new user',
          access: 'Public',
          body: {
            email: 'string (required)',
            password: 'string (required, min 8 chars)'
          },
          response: {
            success: 'boolean',
            message: 'string',
            user: 'object',
            token: 'string'
          }
        },
        'POST /auth/login': {
          description: 'Login user',
          access: 'Public',
          body: {
            email: 'string (required)',
            password: 'string (required)'
          },
          response: {
            success: 'boolean',
            message: 'string',
            user: 'object',
            token: 'string'
          }
        },
        'GET /auth/me': {
          description: 'Get current user profile',
          access: 'Private',
          headers: {
            Authorization: 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            user: 'object'
          }
        },
        'POST /auth/logout': {
          description: 'Logout user',
          access: 'Private',
          headers: {
            Authorization: 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            message: 'string'
          }
        }
      },
      cars: {
        'GET /cars': {
          description: 'Get all car listings with pagination and filters',
          access: 'Public',
          query: {
            page: 'number (default: 1)',
            limit: 'number (default: 20)',
            search: 'string',
            make: 'string',
            model: 'string',
            minYear: 'number',
            maxYear: 'number',
            minPrice: 'number',
            maxPrice: 'number',
            fuelType: 'string',
            transmission: 'string',
            sort: 'string (price_asc, price_desc, year_asc, year_desc, views, oldest)'
          },
          response: {
            success: 'boolean',
            count: 'number',
            total: 'number',
            page: 'number',
            pages: 'number',
            data: 'array',
            filters: 'object'
          }
        },
        'GET /cars/:id': {
          description: 'Get single car listing',
          access: 'Public',
          response: {
            success: 'boolean',
            data: 'object'
          }
        },
        'POST /cars': {
          description: 'Create new car listing',
          access: 'Private (Admin only)',
          headers: {
            Authorization: 'Bearer <token>'
          },
          body: {
            title: 'string (required)',
            make: 'string (required)',
            model: 'string (required)',
            year: 'number (required, 1900-2025)',
            price: 'number (required, min 0)',
            imageUrl: 'string (required, valid URL)',
            description: 'string (optional)',
            mileage: 'number (optional)',
            fuelType: 'string (optional)',
            transmission: 'string (optional)',
            color: 'string (optional)',
            features: 'array (optional)',
            location: 'object (optional)',
            contactInfo: 'object (optional)'
          },
          response: {
            success: 'boolean',
            message: 'string',
            data: 'object'
          }
        },
        'PUT /cars/:id': {
          description: 'Update car listing',
          access: 'Private (Admin only)',
          headers: {
            Authorization: 'Bearer <token>'
          },
          body: 'object (same as POST /cars)',
          response: {
            success: 'boolean',
            message: 'string',
            data: 'object'
          }
        },
        'DELETE /cars/:id': {
          description: 'Delete car listing',
          access: 'Private (Admin only)',
          headers: {
            Authorization: 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            message: 'string'
          }
        },
        'GET /cars/featured': {
          description: 'Get featured cars (most viewed)',
          access: 'Public',
          query: {
            limit: 'number (default: 6)'
          },
          response: {
            success: 'boolean',
            count: 'number',
            data: 'array'
          }
        },
        'GET /cars/stats': {
          description: 'Get car statistics',
          access: 'Private (Admin only)',
          headers: {
            Authorization: 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            data: 'object'
          }
        }
      },
      transactions: {
        'POST /transactions': {
          description: 'Create new transaction',
          access: 'Private',
          headers: {
            Authorization: 'Bearer <token>'
          },
          body: {
            carId: 'string (required)',
            paymentMethod: 'string (optional)',
            billingAddress: 'object (optional)',
            notes: 'string (optional)'
          },
          response: {
            success: 'boolean',
            message: 'string',
            data: 'object'
          }
        },
        'GET /transactions/user/:userId': {
          description: 'Get user transactions',
          access: 'Private',
          headers: {
            Authorization: 'Bearer <token>'
          },
          query: {
            page: 'number (default: 1)',
            limit: 'number (default: 10)',
            status: 'string (optional)'
          },
          response: {
            success: 'boolean',
            count: 'number',
            total: 'number',
            page: 'number',
            pages: 'number',
            data: 'array'
          }
        },
        'GET /transactions/:id': {
          description: 'Get single transaction',
          access: 'Private',
          headers: {
            Authorization: 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            data: 'object'
          }
        },
        'PUT /transactions/:id/complete': {
          description: 'Complete transaction',
          access: 'Private',
          headers: {
            Authorization: 'Bearer <token>'
          },
          body: {
            paymentDetails: 'object (optional)'
          },
          response: {
            success: 'boolean',
            message: 'string',
            data: 'object'
          }
        },
        'PUT /transactions/:id/cancel': {
          description: 'Cancel transaction',
          access: 'Private',
          headers: {
            Authorization: 'Bearer <token>'
          },
          body: {
            reason: 'string (optional)'
          },
          response: {
            success: 'boolean',
            message: 'string',
            data: 'object'
          }
        },
        'GET /transactions': {
          description: 'Get all transactions (Admin only)',
          access: 'Private (Admin only)',
          headers: {
            Authorization: 'Bearer <token>'
          },
          query: {
            page: 'number (default: 1)',
            limit: 'number (default: 20)',
            status: 'string (optional)',
            userId: 'string (optional)'
          },
          response: {
            success: 'boolean',
            count: 'number',
            total: 'number',
            page: 'number',
            pages: 'number',
            data: 'array'
          }
        },
        'GET /transactions/stats': {
          description: 'Get transaction statistics',
          access: 'Private (Admin only)',
          headers: {
            Authorization: 'Bearer <token>'
          },
          response: {
            success: 'boolean',
            data: 'object'
          }
        }
      },
      health: {
        'GET /health': {
          description: 'Server health check',
          access: 'Public',
          response: {
            success: 'boolean',
            message: 'string',
            timestamp: 'string',
            uptime: 'number',
            environment: 'string'
          }
        },
        'GET /health/db': {
          description: 'Database health check',
          access: 'Public',
          response: {
            success: 'boolean',
            message: 'string',
            database: 'object'
          }
        }
      }
    },
    errorResponses: {
      400: 'Bad Request - Invalid input data',
      401: 'Unauthorized - Invalid or missing token',
      403: 'Forbidden - Insufficient permissions',
      404: 'Not Found - Resource not found',
      500: 'Internal Server Error - Server error'
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      note: 'Include the token in the Authorization header for protected routes'
    }
  };

  res.status(200).json(apiDocs);
});

module.exports = router;
