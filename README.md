# Car Sales Web Application

A full-stack MERN application for buying and selling cars online.

## Features

- User authentication (Customer/Admin roles)
- Car listing management
- Search and filter functionality
- Purchase system
- Admin dashboard
- Responsive design with Bootstrap

## Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Styling**: Bootstrap
- **Authentication**: JWT

## Project Structure

```
car-sales-app/
├── README.md
├── package.json
├── .env                   
├── .gitignore
│
├── server/              
│   ├── server.js          
│   ├── config/       
│   ├── models/
│   ├── controllers/
│   ├── routes/ 
│   ├── middleware/       
│   └── utils/                 
│
├── client/               
│   ├── public/            
│   └── src/
│       ├── main.jsx     
│       ├── App.jsx
│       ├── assets/      
│       ├── styles/        
│       ├── components/ 
│       ├── pages/ 
│       ├── hooks/         
│       ├── context/      
│       └── services/     
│
└── docs/  
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd car-sales-app
   ```

2. **Install server dependencies**
   ```bash
   npm run install-server
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update environment variables with your MongoDB connection string and JWT secret

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Server Commands

- **Start server**: `npm run server`
- **Start production**: `npm start`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/car-sales-app

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d

# Server
PORT=5000
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Cars
- `GET /api/cars` - Get all car listings
- `GET /api/cars/:id` - Get specific car listing
- `POST /api/cars` - Create car listing (admin only)
- `PUT /api/cars/:id` - Update car listing (admin only)
- `DELETE /api/cars/:id` - Delete car listing (admin only)

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/user/:userId` - Get user transactions
- `GET /api/transactions/:id` - Get specific transaction

## Development

### Code Style
- Use camelCase for variables and functions
- Follow ESLint configuration
- Write meaningful commit messages

### Testing
- Backend: Test API endpoints with Postman or Thunder Client

## License

MIT License - see LICENSE file for details

## Authors

- Kavithma
- Roshana  
- Zahrun
