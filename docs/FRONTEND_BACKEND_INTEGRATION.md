# Frontend-Backend Integration Guide

## Overview
This guide explains how the frontend React components are integrated with the backend APIs for authentication (Login and Register).

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd server
npm install
npm run dev
```
Server will run on `http://localhost:5000`

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Client will run on `http://localhost:3000`

## 🔗 Integration Details

### Authentication Flow

#### 1. **API Service Configuration** (`client/src/services/api.js`)
- **Base URL**: Uses Vite proxy (`/api`) in development
- **Request Interceptor**: Automatically adds JWT token to headers
- **Response Interceptor**: Handles 401 errors by redirecting to login

#### 2. **AuthContext** (`client/src/context/AuthContext.jsx`)
- **State Management**: Uses useReducer for complex auth state
- **Functions**:
  - `login(email, password)` - Calls `/auth/login`
  - `register(email, password)` - Calls `/auth/register`
  - `logout()` - Calls `/auth/logout` and clears local storage
  - `isAdmin()` - Checks if user has admin role
  - `isCustomer()` - Checks if user has customer role

#### 3. **Login Component** (`client/src/pages/Login.jsx`)
- **Form Validation**: Email and password required
- **Error Handling**: Shows backend error messages
- **Loading States**: Disables form during API calls
- **Navigation**: Redirects to dashboard on success

#### 4. **Register Component** (`client/src/pages/Register.jsx`)
- **Form Validation**: Email, password, and password confirmation
- **Password Matching**: Client-side validation
- **Error Handling**: Shows backend validation errors
- **Loading States**: Disables form during API calls

#### 5. **Navbar Component** (`client/src/components/layout/Navbar.jsx`)
- **Authentication Status**: Shows different menus for logged in/out users
- **Role-based Navigation**: Admin users see admin links
- **Logout Functionality**: Calls logout API and redirects

## 📡 API Endpoints Used

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Request/Response Format

#### Register Request
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Register Response
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "customer",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "30d"
}
```

#### Login Request
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Login Response
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "customer",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "30d"
}
```

## 🧪 Testing the Integration

### 1. **Test Registration**
1. Navigate to `http://localhost:3000/register`
2. Fill in email and password
3. Click "Register"
4. Should redirect to dashboard if successful
5. Check browser dev tools for API calls

### 2. **Test Login**
1. Navigate to `http://localhost:3000/login`
2. Use registered credentials
3. Click "Login"
4. Should redirect to dashboard
5. Navbar should show user email and logout option

### 3. **Test Logout**
1. Click user dropdown in navbar
2. Click "Logout"
3. Should redirect to home page
4. Navbar should show login/register links

### 4. **Test Error Handling**
1. Try registering with invalid email
2. Try logging in with wrong password
3. Should see error messages

## 🔧 Configuration

### Environment Variables
Create `.env` file in client directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Vite Proxy Configuration
The `client/vite.config.js` already includes proxy configuration:
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 🐛 Common Issues

### 1. **CORS Errors**
- **Solution**: Backend CORS is configured for `http://localhost:3000`
- **Check**: Server is running on port 5000

### 2. **Proxy Not Working**
- **Solution**: Use full URL in API service
- **Check**: Vite dev server is running

### 3. **Token Not Persisting**
- **Solution**: Check localStorage in browser dev tools
- **Check**: Token is being saved after login

### 4. **401 Errors**
- **Solution**: Token might be expired or invalid
- **Check**: Clear localStorage and login again

## 📱 User Experience Features

### 1. **Loading States**
- Buttons show "Logging in..." or "Creating Account..."
- Forms are disabled during API calls

### 2. **Error Handling**
- Backend validation errors are displayed
- Errors are cleared when user starts typing

### 3. **Navigation**
- Automatic redirects after successful auth
- Protected routes (will be implemented later)

### 4. **Responsive Design**
- Forms work on mobile and desktop
- Bootstrap styling for consistent look

## 🔄 State Management Flow

1. **User Action** (login/register)
2. **Component** calls AuthContext function
3. **AuthContext** dispatches loading action
4. **API Service** makes HTTP request
5. **Backend** processes request
6. **AuthContext** receives response
7. **State** is updated with user data
8. **Component** re-renders with new state
9. **Navigation** occurs based on success/failure

## 🎯 Next Steps

After testing login and register:
1. Implement protected routes
2. Add car listing components
3. Add transaction components
4. Add admin dashboard
5. Add user profile management

The authentication foundation is now complete and ready for testing!
