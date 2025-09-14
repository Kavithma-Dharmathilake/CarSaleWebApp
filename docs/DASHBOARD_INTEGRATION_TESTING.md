# Dashboard Integration Testing Guide

## Overview
This guide explains how to test the customer and admin dashboard functionality integrated with the backend APIs.

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

### **Customer Dashboard** (`client/src/pages/Dashboard.jsx`)

#### **Features Implemented:**
- **Transaction History**: View past transactions with status badges
- **Statistics Cards**: Cars purchased, total spent, completed/pending orders
- **Download Receipts**: Download transaction receipts as JSON files
- **Recent Activity**: Quick view of recent transactions
- **Quick Actions**: Navigation to browse cars, edit profile
- **Authentication Check**: Redirects to login if not authenticated

#### **API Integration:**
- `GET /api/transactions/user/:userId` - Fetch user's transactions
- Real-time statistics calculation from transaction data
- Error handling and loading states

#### **User Experience:**
- Loading spinners during data fetch
- Error alerts with dismissible functionality
- Responsive design with Bootstrap components
- Status badges for transaction states
- Dropdown actions for each transaction

### **Admin Dashboard** (`client/src/pages/AdminDashboard.jsx`)

#### **Features Implemented:**
- **Car Management**: Create, edit, delete car listings
- **Statistics Overview**: Total cars, users, sales, revenue
- **Car Listing Table**: View all cars with thumbnails and status
- **Modal Forms**: Add/Edit car forms with comprehensive fields
- **Delete Confirmation**: Safe deletion with confirmation modal
- **Access Control**: Admin-only access with role checking

#### **API Integration:**
- `GET /api/cars` - Fetch all cars for admin view
- `POST /api/cars` - Create new car listing
- `PUT /api/cars/:id` - Update existing car
- `DELETE /api/cars/:id` - Delete car listing
- Error handling and loading states

#### **Form Fields:**
- **Basic Info**: Title, Make, Model, Year, Price
- **Media**: Image URL
- **Description**: Detailed car description
- **Specifications**: Mileage, Fuel Type, Transmission, Color
- **Features**: Comma-separated feature list
- **Location**: City, District
- **Contact**: Phone, Email

## 📡 API Endpoints Used

### Customer Dashboard Endpoints
- `GET /api/transactions/user/:userId?limit=10` - Get user transactions
- `GET /api/cars/:id` - Get car details for transaction links

### Admin Dashboard Endpoints
- `GET /api/cars?limit=10` - Get all cars for admin view
- `POST /api/cars` - Create new car listing
- `PUT /api/cars/:id` - Update car listing
- `DELETE /api/cars/:id` - Delete car listing

### Request/Response Format

#### Create Car Request
```json
{
  "title": "2020 Toyota Camry Hybrid",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "price": 4500000,
  "imageUrl": "https://example.com/image.jpg",
  "description": "Well-maintained hybrid sedan",
  "mileage": 50000,
  "fuelType": "hybrid",
  "transmission": "automatic",
  "color": "Silver",
  "features": ["GPS", "Bluetooth", "Backup Camera"],
  "location": {
    "city": "Colombo",
    "district": "Colombo"
  },
  "contactInfo": {
    "phone": "+94771234567",
    "email": "seller@example.com"
  }
}
```

#### Create Car Response
```json
{
  "success": true,
  "message": "Car created successfully",
  "data": {
    "_id": "CAR_ID",
    "title": "2020 Toyota Camry Hybrid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "price": 4500000,
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🧪 Testing Scenarios

### **Customer Dashboard Testing**

#### 1. **Test Transaction History Display**
1. Login as a customer
2. Navigate to `/dashboard`
3. Should see statistics cards with transaction data
4. Should see transactions table with recent purchases
5. Should see status badges (completed, pending, cancelled)
6. Should see download receipt option in dropdown

#### 2. **Test Download Receipt Functionality**
1. Go to customer dashboard
2. Click "Actions" dropdown on any transaction
3. Click "Download Receipt"
4. Should download a JSON file with transaction details
5. File should contain transaction ID, date, amount, status, etc.

#### 3. **Test Statistics Calculation**
1. Complete some transactions (via payment flow)
2. Go to customer dashboard
3. Should see updated statistics:
   - Cars Purchased: Count of completed transactions
   - Total Spent: Sum of completed transaction amounts
   - Completed Orders: Count of completed transactions
   - Pending Orders: Count of pending transactions

#### 4. **Test Authentication Required**
1. Logout from the application
2. Try to access `/dashboard` directly
3. Should redirect to `/login` page
4. After login, should redirect back to dashboard

#### 5. **Test Error Handling**
1. Disconnect backend server
2. Try to access customer dashboard
3. Should show error message
4. Should allow retry or navigation to other pages

### **Admin Dashboard Testing**

#### 1. **Test Admin Access Control**
1. Login as a regular customer
2. Try to access `/admin` directly
3. Should redirect to `/dashboard` with access denied message
4. Login as admin user
5. Should be able to access admin dashboard

#### 2. **Test Car Listing Display**
1. Login as admin
2. Navigate to `/admin`
3. Should see statistics cards
4. Should see car listings table with thumbnails
5. Should see car details (title, make/model, year, price, status)
6. Should see edit/delete buttons for each car

#### 3. **Test Add New Car**
1. Go to admin dashboard
2. Click "Add New Car" button
3. Should open modal with comprehensive form
4. Fill in required fields (title, make, model, year, price)
5. Add optional fields (description, specs, location, contact)
6. Click "Add Car"
7. Should create car and refresh the table
8. Should show success message

#### 4. **Test Edit Car**
1. Go to admin dashboard
2. Click "Edit" button on any car
3. Should open modal with pre-filled form data
4. Modify some fields
5. Click "Update Car"
6. Should update car and refresh the table
7. Should show success message

#### 5. **Test Delete Car**
1. Go to admin dashboard
2. Click "Delete" button on any car
3. Should open confirmation modal
4. Click "Delete Car" to confirm
5. Should delete car and refresh the table
6. Should show success message

#### 6. **Test Form Validation**
1. Try to submit add/edit form without required fields
2. Should show validation errors
3. Fill in required fields and submit
4. Should proceed with API call

#### 7. **Test Error Handling**
1. Disconnect backend server
2. Try to perform admin actions (add/edit/delete)
3. Should show error messages
4. Should allow retry or cancellation

## 🔧 Sample Test Data

### Create Test Car (Admin)
```bash
# Login as admin first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "AdminPass123"}'

# Create car
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "2020 Toyota Camry Hybrid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "price": 4500000,
    "imageUrl": "https://example.com/image.jpg",
    "description": "Well-maintained hybrid sedan with low mileage",
    "mileage": 50000,
    "fuelType": "hybrid",
    "transmission": "automatic",
    "color": "Silver",
    "features": ["GPS", "Bluetooth", "Backup Camera", "Sunroof"],
    "location": {
      "city": "Colombo",
      "district": "Colombo"
    },
    "contactInfo": {
      "phone": "+94771234567",
      "email": "seller@example.com"
    }
  }'
```

### Get User Transactions (Customer)
```bash
# Login as customer first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "CustomerPass123"}'

# Get user transactions
curl -X GET "http://localhost:5000/api/transactions/user/USER_ID_HERE?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎯 Expected Behaviors

### **Customer Dashboard**
- ✅ Requires authentication to access
- ✅ Loads user transactions from API
- ✅ Calculates statistics from transaction data
- ✅ Shows loading spinner during data fetch
- ✅ Displays error messages for API failures
- ✅ Provides download functionality for receipts
- ✅ Shows transaction status with color-coded badges
- ✅ Provides quick navigation to browse cars

### **Admin Dashboard**
- ✅ Requires admin authentication to access
- ✅ Redirects non-admin users to customer dashboard
- ✅ Loads car listings from API
- ✅ Shows comprehensive add/edit forms
- ✅ Provides delete confirmation for safety
- ✅ Shows loading states during API calls
- ✅ Displays error messages for failures
- ✅ Refreshes data after successful operations
- ✅ Validates form inputs before submission

## 🐛 Common Issues & Solutions

### **1. Customer Dashboard Not Loading**
- **Check**: User is authenticated
- **Check**: Backend server is running
- **Check**: User has transactions in database
- **Check**: Transaction API endpoint is working

### **2. Admin Dashboard Access Denied**
- **Check**: User is logged in as admin
- **Check**: User role is set to 'admin' in database
- **Check**: Admin authentication is working

### **3. Car Creation/Update Fails**
- **Check**: User is authenticated as admin
- **Check**: Required fields are filled
- **Check**: Form validation is working
- **Check**: Backend car endpoints are working

### **4. Statistics Not Updating**
- **Check**: Transaction data is being fetched
- **Check**: Statistics calculation logic is working
- **Check**: Data refresh after operations

### **5. Form Validation Issues**
- **Check**: Required fields are marked correctly
- **Check**: Form submission handler is working
- **Check**: Validation messages are displayed

## 📱 User Experience Features

### **Loading States**
- Spinners during API calls
- Disabled buttons during processing
- Loading messages for user feedback

### **Error Handling**
- User-friendly error messages
- Dismissible error alerts
- Graceful fallbacks for errors

### **Form Validation**
- Required field validation
- Real-time form feedback
- Clear error messages

### **Navigation**
- Seamless flow between pages
- Role-based access control
- Quick action buttons

### **Data Management**
- Real-time data updates
- Confirmation dialogs for destructive actions
- Success feedback for operations

## 🔄 Dashboard Flow

### **Customer Dashboard Flow**
1. **Authentication Check** → Redirect to login if not authenticated
2. **Data Load** → Fetch user transactions from API
3. **Statistics Calculation** → Calculate stats from transaction data
4. **Display** → Show transactions table and statistics cards
5. **Actions** → Provide download, view car, and navigation options

### **Admin Dashboard Flow**
1. **Admin Check** → Verify admin role and redirect if needed
2. **Data Load** → Fetch car listings from API
3. **Display** → Show cars table and statistics
4. **Car Management** → Provide add/edit/delete functionality
5. **Form Handling** → Validate and submit car data
6. **Data Refresh** → Update display after operations

## 🎯 Next Steps

After testing dashboard integration:
1. Implement user management for admin
2. Add transaction analytics and reporting
3. Implement email notifications for transactions
4. Add bulk operations for car management
5. Implement advanced search and filtering
6. Add data export functionality
7. Implement audit logging for admin actions

The dashboard integration is now complete and ready for comprehensive testing!
