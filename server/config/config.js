// Configuration file for environment variables
module.exports = {
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.koga8.mongodb.net/?retryWrites=true&w=majority',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'a-string-secret-at-least-256-bits-long',
    expiresIn: process.env.JWT_EXPIRE || '30d'
  },

  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // CORS configuration
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
  }
};
