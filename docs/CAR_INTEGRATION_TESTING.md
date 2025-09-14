# Car Integration Testing Guide

## Overview
This guide explains how to test the frontend car components integrated with the backend car APIs.

## 🚀 Quick Start

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### 2. Access the Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## 🔗 Integration Details

### **Car Service** (`client/src/services/carService.js`)
- **API Integration**: All car-related API calls
- **Query Parameters**: Handles filters, pagination, search
- **Error Handling**: Centralized error management

### **Car Context** (`client/src/context/CarContext.jsx`)
- **State Management**: Uses useReducer for complex car state
- **Functions**:
  - `fetchCars(filters, page, limit)` - Get cars with filters
  - `fetchCarById(carId)` - Get single car details
  - `fetchFeaturedCars(limit)` - Get featured cars
  - `applyFilters(newFilters, page)` - Apply search filters
  - `clearFilters()` - Reset all filters

### **Cars Component** (`client/src/pages/Cars.jsx`)
- **Search & Filter**: Real-time search and filtering
- **Pagination**: Page navigation with car count
- **Loading States**: Spinner during API calls
- **Error Handling**: Displays backend errors
- **Responsive Grid**: Bootstrap card layout

### **CarDetail Component** (`client/src/pages/CarDetail.jsx`)
- **Detailed View**: Complete car information
- **Purchase Flow**: Redirects to payment (when implemented)
- **Authentication Check**: Requires login for purchase
- **Error States**: Handles car not found scenarios

### **Home Component** (`client/src/pages/Home.jsx`)
- **Featured Cars**: Shows featured car listings
- **Hero Section**: Call-to-action buttons
- **Loading States**: Handles API loading

## 📡 API Endpoints Used

### Car Endpoints
- `GET /api/cars` - Get all cars with filters
- `GET /api/cars/:id` - Get single car details
- `GET /api/cars/featured` - Get featured cars
- `POST /api/cars` - Create car (Admin only)
- `PUT /api/cars/:id` - Update car (Admin only)
- `DELETE /api/cars/:id` - Delete car (Admin only)

### Query Parameters
- `page` - Page number for pagination
- `limit` - Number of cars per page
- `search` - Search term for make/model/title
- `make` - Filter by car make
- `model` - Filter by car model
- `minYear` - Minimum year filter
- `maxYear` - Maximum year filter
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `fuelType` - Filter by fuel type
- `transmission` - Filter by transmission
- `color` - Filter by color
- `city` - Filter by location
- `sort` - Sort order (price_asc, price_desc, year_asc, etc.)

## 🧪 Testing Scenarios

### 1. **Test Car Listing Page**
1. Navigate to `http://localhost:3000/cars`
2. Should see loading spinner initially
3. Should display cars in grid layout
4. Should show pagination if more than 12 cars

### 2. **Test Search Functionality**
1. Go to `/cars` page
2. Enter search term (e.g., "Toyota")
3. Click search button
4. Should filter results by search term
5. Should update URL with search parameters

### 3. **Test Filtering**
1. Go to `/cars` page
2. Select make from dropdown (e.g., "Honda")
3. Should filter results by make
4. Try multiple filters simultaneously
5. Test "Clear Filters" button

### 4. **Test Pagination**
1. Go to `/cars` page
2. If more than 12 cars, pagination should appear
3. Click "Next" button
4. Should load next page of cars
5. Click "Previous" button
6. Should go back to previous page

### 5. **Test Car Detail Page**
1. Click "View Details" on any car card
2. Should navigate to `/cars/:id`
3. Should show detailed car information
4. Should display car image, specifications, features
5. Should show purchase button

### 6. **Test Purchase Flow**
1. Go to car detail page
2. Click "Purchase Now" button
3. If not logged in, should redirect to login
4. If logged in, should redirect to payment page

### 7. **Test Featured Cars on Home**
1. Navigate to `http://localhost:3000/`
2. Should see hero section
3. Should see "Featured Cars" section
4. Should display featured cars in grid
5. Click "View Details" should navigate to car detail

### 8. **Test Error Handling**
1. Try accessing non-existent car ID
2. Should show "Car not found" message
3. Should provide "Back to Cars" button
4. Test with invalid API responses

## 🔧 Sample Test Data

### Create Test Cars (Admin Required)
```bash
# Login as admin first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@carsales.com", "password": "AdminPass123"}'

# Create test cars
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "title": "2020 Toyota Camry Hybrid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "price": 4500000,
    "imageUrl": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    "description": "Well-maintained Toyota Camry Hybrid with low mileage.",
    "mileage": 25000,
    "fuelType": "hybrid",
    "transmission": "automatic",
    "color": "Silver",
    "features": ["GPS Navigation", "Bluetooth", "Backup Camera"],
    "location": {"city": "Colombo", "district": "Colombo"}
  }'
```

## 🎯 Expected Behaviors

### **Cars Page**
- ✅ Loads cars from API on mount
- ✅ Shows loading spinner during API calls
- ✅ Displays error messages for API failures
- ✅ Search functionality works
- ✅ Filters work independently and together
- ✅ Pagination works correctly
- ✅ "Clear Filters" resets all filters
- ✅ Car cards link to detail pages

### **Car Detail Page**
- ✅ Loads car details from API
- ✅ Shows loading spinner during API calls
- ✅ Displays comprehensive car information
- ✅ Shows availability status
- ✅ Purchase button requires authentication
- ✅ Handles car not found scenarios
- ✅ Image fallback for broken images

### **Home Page**
- ✅ Shows featured cars from API
- ✅ Handles loading and error states
- ✅ Car cards link to detail pages
- ✅ Call-to-action buttons work

## 🐛 Common Issues & Solutions

### **1. Cars Not Loading**
- **Check**: Backend server is running on port 5000
- **Check**: API endpoints are accessible
- **Check**: CORS configuration allows frontend requests

### **2. Search Not Working**
- **Check**: Search term is being sent to API
- **Check**: Backend search endpoint is working
- **Check**: API response format matches frontend expectations

### **3. Filters Not Applied**
- **Check**: Filter values are being sent to API
- **Check**: Backend filter logic is working
- **Check**: Query parameters are properly formatted

### **4. Pagination Issues**
- **Check**: Pagination data from API response
- **Check**: Page numbers are being sent correctly
- **Check**: Total count and page count calculations

### **5. Car Detail Page Errors**
- **Check**: Car ID is being passed correctly
- **Check**: API endpoint for single car is working
- **Check**: Car data structure matches frontend expectations

## 📱 User Experience Features

### **Loading States**
- Spinners during API calls
- Disabled buttons during loading
- Loading messages for user feedback

### **Error Handling**
- User-friendly error messages
- Dismissible error alerts
- Fallback content for errors

### **Responsive Design**
- Mobile-friendly car grid
- Responsive filter controls
- Touch-friendly buttons

### **Navigation**
- Breadcrumb navigation
- Back buttons on detail pages
- Consistent routing

## 🔄 State Management Flow

1. **Component Mount** → Load cars from API
2. **User Action** (search/filter) → Update filters
3. **API Call** → Send request with filters
4. **Response** → Update car state
5. **Re-render** → Display updated cars
6. **Navigation** → Route to car detail
7. **Detail Load** → Fetch single car data
8. **Display** → Show comprehensive details

## 🎯 Next Steps

After testing car integration:
1. Implement transaction/payment components
2. Add admin car management features
3. Add user dashboard with purchase history
4. Implement advanced search features
5. Add car comparison functionality

The car integration is now complete and ready for comprehensive testing!
