# Product Requirements Document (PRD)
## Car Sales Web Application

### Document Information
- **Version**: 1.0
- **Date**: September 2025
- **Author**: Kavithma, Roshana, Zahrun
- **Status**: Complete

---

## 1. Executive Summary

### 1.1 Product Overview
The Car Sales Web Application is a full-stack MERN-based platform that enables users to buy and sell cars online. The application provides a seamless experience for customers to browse, search, and purchase vehicles, while giving administrators comprehensive management capabilities.

### 1.2 Business Objectives
- Create a user-friendly platform for car sales and purchases
- Provide efficient car listing management for administrators
- Enable secure user authentication and authorization
- Implement robust search and filtering capabilities
- Ensure scalable architecture for future growth

---

## 2. Product Vision & Goals

### 2.1 Vision Statement
To become the leading online marketplace for car sales, providing a secure, intuitive, and efficient platform that connects car buyers and sellers seamlessly.

### 2.2 Success Metrics
- User registration and retention rates
- Number of successful car transactions
- Average time to complete a purchase

---

## 3. Target Users

### 3.1 Primary Users

#### 3.1.1 Customers
- **Demographics**: Car buyers and sellers of all ages
- **Goals**: 
  - Browse and search for cars easily
  - Purchase cars securely
  - List their own cars for sale
- **Pain Points**:
  - Difficulty finding specific car models
  - Lack of trust in online transactions
  - Complex listing processes

#### 3.1.2 Administrators
- **Demographics**: Platform managers and moderators
- **Goals**:
  - Manage all car listings
  - Monitor user activities
  - Ensure platform security and quality
- **Pain Points**:
  - Managing large volumes of listings
  - Ensuring data accuracy
  - Handling user disputes

---

## 4. Functional Requirements

### 4.1 User Authentication & Authorization

#### 4.1.1 User Registration
- **FR-001**: Users can create accounts with email and password
- **FR-002**: Email verification required for account activation
- **FR-003**: Password must meet security requirements (8+ characters, mixed case, numbers)
- **FR-004**: Users cannot select role (Customer or Admin) during registration.

#### 4.1.2 User Login
- **FR-005**: Users can log in with email and password
- **FR-006**: System remembers login session for 30 days
- **FR-007**: Password reset functionality via email
- **FR-008**: Account lockout after 5 failed login attempts

#### 4.1.3 Role-Based Access Control
- **FR-009**: Customers can view and purchase cars
- **FR-010**: Admins inherit all customer permissions
- **FR-011**: Admins can create, edit, and delete car listings
- **FR-012**: Admins can manage user accounts

### 4.2 Car Listing Management

#### 4.2.1 Car Listing Creation
- **FR-013**: Admins can create car listings with required fields:
  - Title (string, max 100 characters)
  - Make (string, max 50 characters)
  - Model (string, max 50 characters)
  - Year (integer, 1900-2025)
  - Price (decimal, min 0)
  - Image URL (string, valid URL format)
- **FR-014**: All fields are mandatory for listing creation
- **FR-015**: Price must be in LKR format
- **FR-016**: Image URL must be accessible and valid

#### 4.2.2 Car Listing Display
- **FR-017**: All users can view car listings in a grid format
- **FR-018**: Each listing displays: title, make, model, year, price, and image
- **FR-019**: Listings are paginated (20 items per page)
- **FR-020**: Listings are sorted by creation date (newest first) by default

#### 4.2.3 Car Listing Search & Filter
- **FR-021**: Users can search by make, model, or title
- **FR-022**: Users can filter by:
  - Make (dropdown selection)
  - Model (dropdown selection)
  - Price range (min-max slider)
  - Year range (min-max selection)
- **FR-023**: Search results update in real-time
- **FR-024**: Users can combine multiple filters
- **FR-025**: Clear all filters functionality

### 4.3 Purchase Management

#### 4.3.1 Car Purchase
- **FR-026**: Customers can purchase cars from listings
- **FR-027**: Purchase requires user authentication
- **FR-028**: Purchase confirmation dialog with car details
- **FR-029**: Purchase updates car availability status
- **FR-030**: Purchase generates transaction record

#### 4.3.2 Transaction History
- **FR-031**: Users can view their purchase history
- **FR-032**: Transaction records include: car details, purchase date, price
- **FR-033**: Users can download purchase receipts

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- **NFR-001**: Page load time < 3 seconds
- **NFR-002**: Search results return within 1 second

### 5.2 Security Requirements
- **NFR-003**: Passwords stored using bcrypt hashing
- **NFR-004**: JWT tokens for session management
- **NFR-005**: Input validation and sanitization

### 5.3 Usability Requirements
- **NFR-009**: Responsive design for mobile and desktop
- **NFR-010**: Intuitive navigation and user interface

---

## 6. Technical Architecture

### 6.1 Technology Stack
- **Frontend**: React.js with modern hooks and functional components
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Bootstrap

### 6.2 System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Node.js/      │    │   MongoDB       │
│   Frontend      │◄──►│   Express.js    │◄──►│   Database      │
│                 │    │   Backend       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 6.3 Database Schema

#### 6.3.1 User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['customer', 'admin'], required),
  createdAt: Date,
  updatedAt: Date
}
```

#### 6.3.2 Car Listing Collection
```javascript
{
  _id: ObjectId,
  title: String (required, max 100),
  make: String (required, max 50),
  model: String (required, max 50),
  year: Number (required, min 1900, max 2025),
  price: Number (required, min 0),
  imageUrl: String (required, valid URL),
  isAvailable: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### 6.3.3 Transaction Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  carId: ObjectId (ref: CarListing),
  amount: Number (required),
  status: String (enum: ['pending', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 7. User Stories

### 7.1 Customer Stories
- **As a customer**, I want to browse car listings so that I can find cars I'm interested in
- **As a customer**, I want to search for specific car makes and models so that I can quickly find what I'm looking for
- **As a customer**, I want to filter cars by price range so that I can find cars within my budget
- **As a customer**, I want to purchase a car so that I can complete my transaction
- **As a customer**, I want to view my purchase history so that I can track my transactions

### 7.2 Admin Stories
- **As an admin**, I want to create car listings so that customers can see available cars
- **As an admin**, I want to edit car listings so that I can keep information accurate
- **As an admin**, I want to delete car listings so that I can remove sold or unavailable cars
- **As an admin**, I want to view all user activities so that I can monitor the platform

---

## 8. API Endpoints

### 8.1 Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request
- `GET /api/auth/verify-email/:token` - Email verification

### 8.2 Car Listing Endpoints
- `GET /api/cars` - Get all car listings (with pagination, search, filters)
- `GET /api/cars/:id` - Get specific car listing
- `POST /api/cars` - Create new car listing (admin only)
- `PUT /api/cars/:id` - Update car listing (admin only)
- `DELETE /api/cars/:id` - Delete car listing (admin only)

### 8.3 Transaction Endpoints
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/user/:userId` - Get user's transaction history
- `GET /api/transactions/:id` - Get specific transaction details

---

## 9. User Interface Requirements

### 9.1 Page Structure
1. **Home Page**: Featured car listings, search bar, filter options
2. **Login/Register Page**: Authentication forms
3. **Car Listings Page**: Grid/list view of all cars with search and filters
4. **Car Detail Page**: Individual car information and purchase option
5. **User Dashboard**: Purchase history, account settings
6. **Admin Dashboard**: Car management, user management
7. **Payment Page**: Purchasing car through payment portal. A minimal design
6. **Payment Success/Cancel Page**: A payment success/cancel page where user can download the receipt

### 9.2 Design Principles
- Clean, modern interface
- Mobile-first responsive design
- Consistent color scheme and typography
- Intuitive navigation
- Fast loading times
- Accessibility compliance
- Use Bootstrap for styling — no plain CSS files.

---

## 10. Testing Requirements

### 10.1 Unit Testing
- Component testing for React components
- API endpoint testing
- Database operation testing
- Authentication logic testing

### 10.2 Integration Testing
- End-to-end user workflows
- API integration testing
- Database integration testing



## 15. Conclusion

This PRD outlines a comprehensive car sales web application that addresses the needs of both customers and administrators. The MERN stack provides a robust foundation for building a scalable, secure, and user-friendly platform. The phased approach allows for iterative development and continuous improvement based on user feedback and market demands.

The success of this project depends on careful attention to user experience, security, and performance requirements. Regular testing, monitoring, and user feedback will be crucial for the long-term success of the platform.
