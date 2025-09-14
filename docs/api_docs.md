# API Testing Guide - Car Sales Application

This guide provides comprehensive cURL commands and Postman collection for testing all API endpoints.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "_id": "...",
    "email": "john.doe@example.com",
    "role": "customer",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "30d"
}
```

### 1.2 Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

### 1.3 Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 1.4 Update User Profile
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+94771234567"
  }'
```

### 1.5 Change Password
```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

### 1.6 Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 2. Car Listing Endpoints

### 2.1 Get All Cars (with filters)
```bash
# Basic request
curl -X GET "http://localhost:5000/api/cars"

# With pagination
curl -X GET "http://localhost:5000/api/cars?page=1&limit=10"

# With search
curl -X GET "http://localhost:5000/api/cars?search=Toyota"

# With filters
curl -X GET "http://localhost:5000/api/cars?make=Toyota&minYear=2020&maxPrice=50000"

# With sorting
curl -X GET "http://localhost:5000/api/cars?sort=price_asc"
```

### 2.2 Get Single Car
```bash
curl -X GET http://localhost:5000/api/cars/CAR_ID_HERE
```

### 2.3 Create Car (Admin Only)
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "title": "2020 Toyota Camry Hybrid",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "price": 4500000,
    "imageUrl": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    "description": "Well-maintained Toyota Camry Hybrid with low mileage. Excellent fuel efficiency and comfortable ride.",
    "mileage": 25000,
    "fuelType": "hybrid",
    "transmission": "automatic",
    "color": "Silver",
    "features": ["GPS Navigation", "Bluetooth", "Backup Camera", "Leather Seats"],
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

### 2.4 Update Car (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/cars/CAR_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE" \
  -d '{
    "price": 4200000,
    "description": "Updated description with more details about the car condition."
  }'
```

### 2.5 Delete Car (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/cars/CAR_ID_HERE \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

### 2.6 Get Featured Cars
```bash
curl -X GET "http://localhost:5000/api/cars/featured?limit=6"
```

### 2.7 Get Car Statistics (Admin Only)
```bash
curl -X GET http://localhost:5000/api/cars/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

---

## 3. Transaction Endpoints

### 3.1 Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
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

### 3.2 Get User Transactions
```bash
curl -X GET "http://localhost:5000/api/transactions/user/USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# With pagination and filters
curl -X GET "http://localhost:5000/api/transactions/user/USER_ID_HERE?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 3.3 Get Single Transaction
```bash
curl -X GET http://localhost:5000/api/transactions/TRANSACTION_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 3.4 Complete Transaction
```bash
curl -X PUT http://localhost:5000/api/transactions/TRANSACTION_ID_HERE/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "paymentDetails": {
      "transactionId": "PAY_123456789",
      "paymentGateway": "stripe",
      "gatewayTransactionId": "pi_1234567890"
    }
  }'
```

### 3.5 Cancel Transaction
```bash
curl -X PUT http://localhost:5000/api/transactions/TRANSACTION_ID_HERE/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "reason": "Changed my mind about the purchase"
  }'
```

### 3.6 Get All Transactions (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/transactions?page=1&limit=20" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"

# With filters
curl -X GET "http://localhost:5000/api/transactions?status=completed&userId=USER_ID_HERE" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

### 3.7 Get Transaction Statistics (Admin Only)
```bash
curl -X GET http://localhost:5000/api/transactions/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

---

## 4. Health Check Endpoints

### 4.1 Server Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

### 4.2 Database Health Check
```bash
curl -X GET http://localhost:5000/api/health/db
```

### 4.3 API Documentation
```bash
curl -X GET http://localhost:5000/api/docs
```

---

## 5. Complete Testing Workflow

### Step 1: Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carsales.com",
    "password": "AdminPass123"
  }'
```

### Step 2: Register Customer User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "CustomerPass123"
  }'
```

### Step 3: Login as Admin (Note: You'll need to manually change role to admin in database)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carsales.com",
    "password": "AdminPass123"
  }'
```

### Step 4: Create Car Listing (Admin)
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "title": "2021 Honda Civic Sport",
    "make": "Honda",
    "model": "Civic",
    "year": 2021,
    "price": 3800000,
    "imageUrl": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    "description": "Sporty Honda Civic with excellent performance and fuel efficiency.",
    "mileage": 15000,
    "fuelType": "petrol",
    "transmission": "manual",
    "color": "Red",
    "features": ["Sport Package", "Touchscreen", "Bluetooth", "USB Ports"],
    "location": {
      "city": "Kandy",
      "district": "Kandy"
    }
  }'
```

### Step 5: Login as Customer
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "CustomerPass123"
  }'
```

### Step 6: Browse Cars
```bash
curl -X GET "http://localhost:5000/api/cars?make=Honda"
```

### Step 7: Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE" \
  -d '{
    "carId": "CAR_ID_FROM_STEP_4",
    "paymentMethod": "credit_card",
    "billingAddress": {
      "street": "456 Customer Street",
      "city": "Colombo",
      "district": "Colombo",
      "postalCode": "10000",
      "country": "Sri Lanka"
    }
  }'
```

### Step 8: Complete Transaction
```bash
curl -X PUT http://localhost:5000/api/transactions/TRANSACTION_ID_HERE/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN_HERE" \
  -d '{
    "paymentDetails": {
      "transactionId": "PAY_COMPLETED_123",
      "paymentGateway": "stripe",
      "gatewayTransactionId": "pi_completed_123"
    }
  }'
```

---

## 6. Sample Data for Testing

### Sample Car Listings
```json
{
  "title": "2020 Toyota Prius Hybrid",
  "make": "Toyota",
  "model": "Prius",
  "year": 2020,
  "price": 4200000,
  "imageUrl": "https://images.unsplash.com/photo-1549317336-206569e8475c?w=800",
  "description": "Eco-friendly hybrid with excellent fuel economy.",
  "mileage": 30000,
  "fuelType": "hybrid",
  "transmission": "automatic",
  "color": "White",
  "features": ["Hybrid Engine", "Eco Mode", "Touchscreen", "Bluetooth"],
  "location": {
    "city": "Galle",
    "district": "Galle"
  }
}
```

```json
{
  "title": "2019 Ford Mustang GT",
  "make": "Ford",
  "model": "Mustang",
  "year": 2019,
  "price": 8500000,
  "imageUrl": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
  "description": "Powerful V8 engine with sporty design.",
  "mileage": 20000,
  "fuelType": "petrol",
  "transmission": "manual",
  "color": "Blue",
  "features": ["V8 Engine", "Sport Package", "Leather Seats", "Premium Audio"],
  "location": {
    "city": "Negombo",
    "district": "Gampaha"
  }
}
```

---

## 7. Error Testing

### Test Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "ValidPass123"
  }'
```

### Test Weak Password
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123"
  }'
```

### Test Unauthorized Access
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Car",
    "make": "Test",
    "model": "Test",
    "year": 2020,
    "price": 1000000,
    "imageUrl": "https://example.com/image.jpg"
  }'
```

### Test Invalid Car Data
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "title": "Test Car",
    "make": "Test",
    "model": "Test",
    "year": 1800,
    "price": -1000,
    "imageUrl": "invalid-url"
  }'
```

---

## 8. Postman Collection Import

You can import this collection into Postman by creating a new collection and adding these requests:

1. **Environment Variables:**
   - `base_url`: `http://localhost:5000/api`
   - `admin_token`: `{{admin_jwt_token}}`
   - `customer_token`: `{{customer_jwt_token}}`
   - `car_id`: `{{car_id}}`
   - `transaction_id`: `{{transaction_id}}`

2. **Pre-request Scripts:**
   - Set environment variables after successful login
   - Extract tokens from response and store in variables

3. **Tests:**
   - Check response status codes
   - Validate response structure
   - Extract IDs for subsequent requests

---

## 9. Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

### Paginated Response
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [ ... ]
}
```

---

## 10. Testing Checklist

- [ ] Server is running on port 5000
- [ ] MongoDB is connected
- [ ] Register user endpoint works
- [ ] Login endpoint returns JWT token
- [ ] Protected routes require authentication
- [ ] Admin-only routes require admin role
- [ ] Car CRUD operations work
- [ ] Transaction lifecycle works
- [ ] Error handling works properly
- [ ] Pagination works
- [ ] Search and filters work
- [ ] Health checks return proper status

This comprehensive guide should help you test all API endpoints thoroughly!
