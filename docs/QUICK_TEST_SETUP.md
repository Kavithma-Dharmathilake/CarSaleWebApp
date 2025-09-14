# Quick API Testing Setup

## Prerequisites
1. Make sure your server is running: `npm run dev` (from server directory)
2. MongoDB should be connected
3. Postman installed (optional)

## Quick Start Testing

### 1. Start the Server
```bash
cd server
npm install
npm run dev
```

### 2. Test Server Health
```bash
curl http://localhost:5000/api/health
```

### 3. Register Test Users
```bash
# Register Admin User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carsales.com",
    "password": "AdminPass123"
  }'

# Register Customer User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "CustomerPass123"
  }'
```

### 4. Login and Get Tokens
```bash
# Login as Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carsales.com",
    "password": "AdminPass123"
  }'

# Login as Customer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "CustomerPass123"
  }'
```

### 5. Create Sample Car (Admin)
```bash
curl -X POST http://localhost:5000/api/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE" \
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
    "color": "Silver"
  }'
```

### 6. Browse Cars
```bash
curl -X GET "http://localhost:5000/api/cars"
```

### 7. Create Transaction (Customer)
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN_HERE" \
  -d '{
    "carId": "CAR_ID_FROM_STEP_5",
    "paymentMethod": "credit_card",
    "billingAddress": {
      "street": "123 Main Street",
      "city": "Colombo",
      "district": "Colombo",
      "postalCode": "10000",
      "country": "Sri Lanka"
    }
  }'
```

## Postman Collection Import

1. Open Postman
2. Click "Import" button
3. Select the file: `docs/Car_Sales_API.postman_collection.json`
4. The collection will be imported with all requests ready to use

## Environment Variables in Postman

After importing, set these environment variables:
- `base_url`: `http://localhost:5000/api`
- `admin_token`: (will be set automatically after admin login)
- `customer_token`: (will be set automatically after customer login)
- `car_id`: (will be set automatically after creating a car)
- `transaction_id`: (will be set automatically after creating a transaction)
- `user_id`: (will be set automatically after login)

## Testing Workflow

1. **Register Users** → Get tokens
2. **Create Cars** (Admin) → Get car IDs
3. **Browse Cars** → Test filters and search
4. **Create Transactions** (Customer) → Test transaction flow
5. **Complete/Cancel Transactions** → Test transaction lifecycle
6. **Test Error Cases** → Validate error handling

## Common Issues

### Server Not Starting
- Check if port 5000 is available
- Ensure MongoDB is running
- Check environment variables

### Authentication Errors
- Make sure to include `Authorization: Bearer <token>` header
- Check if token is expired
- Verify user role for admin-only endpoints

### Validation Errors
- Check required fields
- Validate email format
- Ensure password meets requirements (8+ chars, mixed case, numbers)

## Sample Data for Testing

### Valid Car Data
```json
{
  "title": "2021 Honda Civic Sport",
  "make": "Honda",
  "model": "Civic",
  "year": 2021,
  "price": 3800000,
  "imageUrl": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
  "description": "Sporty Honda Civic with excellent performance.",
  "mileage": 15000,
  "fuelType": "petrol",
  "transmission": "manual",
  "color": "Red"
}
```

### Valid User Data
```json
{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

### Valid Transaction Data
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
  }
}
```

This should get you started with comprehensive API testing!
