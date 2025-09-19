const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    uri = 'mongodb+srv://username:password@cluster0.koga8.mongodb.net/?retryWrites=true&w=majority'
    // const conn = await mongoose.connect(config.database.uri, config.database.options);
    const conn = await mongoose.connect(uri, config.database.options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
