# Transaction Integration Testing Guide

## Overview
This guide explains how to test the frontend payment components integrated with the backend transaction APIs.

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

### **Transaction Service** (`client/src/services/transactionService.js`)
- **API Integration**: All transaction-related API calls
- **Query Parameters**: Handles filters, pagination, status updates
- **Error Handling**: Centralized error management

### **Transaction Context** (`client/src/context/TransactionContext.jsx`)
- **State Management**: Uses useReducer for complex transaction state
- **Functions**:
  - `createTransaction(transactionData)` - Create new transaction
  - `fetchTransactionById(transactionId)` - Get single transaction
  - `fetchUserTransactions(userId, params)` - Get user's transactions
  - `completeTransaction(transactionId, paymentDetails)` - Complete transaction
  - `cancelTransaction(transactionId, reason)` - Cancel transaction

### **Payment Component** (`client/src/pages/Payment.jsx`)
- **Car Integration**: Loads car details from CarContext
- **Form Validation**: Billing address and payment details
- **Authentication Check**: Requires login to access
- **Transaction Creation**: Creates transaction before payment
- **Loading States**: Spinner during API calls
- **Error Handling**: Displays backend errors

### **PaymentSuccess Component** (`client/src/pages/PaymentSuccess.jsx`)
- **Transaction Completion**: Completes transaction with payment details
- **Receipt Display**: Shows transaction and car details
- **Navigation State**: Uses location state for data
- **Error Handling**: Handles completion errors gracefully

### **PaymentCancel Component** (`client/src/pages/PaymentCancel.jsx`)
- **Transaction Cancellation**: Cancels transaction with reason
- **User Guidance**: Explains what happened and next steps
- **Retry Options**: Links to retry purchase or browse cars

## 📡 API Endpoints Used

### Transaction Endpoints
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get single transaction
- `GET /api/transactions/user/:userId` - Get user's transactions
- `PUT /api/transactions/:id/complete` - Complete transaction
- `PUT /api/transactions/:id/cancel` - Cancel transaction
- `GET /api/transactions` - Get all transactions (Admin)
- `GET /api/transactions/stats` - Get transaction statistics (Admin)

### Request/Response Format

#### Create Transaction Request
```json
{
  "carId": "CAR_ID_HERE",
  "paymentMethod": "credit_card",
  "billingAddress": {
    "street": "123 Main Street",
    "city": "Colombo",
    "district": "Colombo",
    "postalCode": "10000",
    "country": "Sri Lanka"
  },
  "notes": "Please contact me for delivery arrangements"
}
```

#### Create Transaction Response
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "_id": "TRANSACTION_ID",
    "userId": "USER_ID",
    "carId": "CAR_ID",
    "amount": 4500000,
    "status": "pending",
    "paymentMethod": "credit_card",
    "billingAddress": { ... },
    "notes": "...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Complete Transaction Request
```json
{
  "paymentDetails": {
    "transactionId": "PAY_123456789",
    "paymentGateway": "stripe",
    "gatewayTransactionId": "pi_1234567890"
  }
}
```

## 🧪 Testing Scenarios

### 1. **Test Payment Flow (Complete)**
1. Login as a customer
2. Browse cars and click "View Details" on any car
3. Click "Purchase Now" button
4. Should redirect to `/payment/:carId`
5. Fill in payment form with billing address
6. Click "Complete Purchase"
7. Should show processing spinner
8. Should redirect to `/payment/success` with transaction details
9. Should show success message with transaction info

### 2. **Test Payment Cancellation**
1. Go to payment page for any car
2. Click "Cancel" button
3. Should redirect to `/cars` page
4. Alternatively, navigate to `/payment/cancel` directly
5. Should show cancellation message

### 3. **Test Authentication Required**
1. Logout from the application
2. Try to access `/payment/:carId` directly
3. Should redirect to `/login` page
4. After login, should redirect back to payment page

### 4. **Test Car Not Found**
1. Try to access `/payment/invalid-car-id`
2. Should show "Car not found" message
3. Should provide "Back to Cars" button

### 5. **Test Form Validation**
1. Go to payment page
2. Try to submit without filling required fields
3. Should show validation error
4. Fill in required fields and submit
5. Should proceed with transaction creation

### 6. **Test Error Handling**
1. Disconnect backend server
2. Try to complete a payment
3. Should show error message
4. Should allow retry or cancellation

### 7. **Test Transaction States**
1. Complete a successful payment
2. Check transaction status is "completed"
3. Cancel a payment
4. Check transaction status is "cancelled"

## 🔧 Sample Test Data

### Create Test Transaction
```bash
# Login as customer first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@example.com", "password": "CustomerPass123"}'

# Create transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "carId": "CAR_ID_HERE",
    "paymentMethod": "credit_card",
    "billingAddress": {
      "street": "123 Main Street",
      "city": "Colombo",
      "district": "Colombo",
      "postalCode": "10000",
      "country": "Sri Lanka"
    },
    "notes": "Please contact me for delivery arrangements"
  }'
```

## 🎯 Expected Behaviors

### **Payment Page**
- ✅ Requires authentication to access
- ✅ Loads car details from API
- ✅ Shows loading spinner during car load
- ✅ Displays car information and price
- ✅ Form validation for required fields
- ✅ Creates transaction on form submission
- ✅ Shows processing spinner during transaction creation
- ✅ Redirects to success page on completion

### **Payment Success Page**
- ✅ Receives transaction and car data from navigation state
- ✅ Completes transaction with payment details
- ✅ Shows transaction details and receipt
- ✅ Displays billing address and notes
- ✅ Provides navigation options
- ✅ Handles completion errors gracefully

### **Payment Cancel Page**
- ✅ Cancels transaction with reason
- ✅ Shows cancellation details
- ✅ Provides retry and navigation options
- ✅ Handles cancellation errors gracefully

## 🐛 Common Issues & Solutions

### **1. Payment Page Not Loading**
- **Check**: User is authenticated
- **Check**: Car ID is valid
- **Check**: Backend server is running
- **Check**: Car exists in database

### **2. Transaction Creation Fails**
- **Check**: User is authenticated
- **Check**: Car ID is valid
- **Check**: Required fields are filled
- **Check**: Backend transaction endpoint is working

### **3. Payment Success Not Working**
- **Check**: Navigation state contains transaction data
- **Check**: Transaction completion API is working
- **Check**: Payment details are properly formatted

### **4. Form Validation Issues**
- **Check**: Required fields are marked correctly
- **Check**: Form submission handler is working
- **Check**: Validation messages are displayed

### **5. Navigation Issues**
- **Check**: Routes are properly configured
- **Check**: Navigation state is passed correctly
- **Check**: Redirect logic is working

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
- State preservation during navigation
- Back buttons and cancel options

## 🔄 Transaction Flow

1. **User Action** → Click "Purchase Now" on car detail
2. **Authentication Check** → Redirect to login if not authenticated
3. **Car Load** → Fetch car details from API
4. **Form Display** → Show payment form with car details
5. **Form Submission** → Validate and create transaction
6. **Payment Processing** → Simulate payment processing
7. **Transaction Completion** → Complete transaction with payment details
8. **Success Display** → Show success page with receipt
9. **Navigation** → Provide options to dashboard or browse more cars

## 🎯 Next Steps

After testing transaction integration:
1. Implement user dashboard with transaction history
2. Add admin transaction management
3. Implement email notifications
4. Add payment gateway integration
5. Add transaction status tracking
6. Implement refund functionality

The transaction integration is now complete and ready for comprehensive testing!
