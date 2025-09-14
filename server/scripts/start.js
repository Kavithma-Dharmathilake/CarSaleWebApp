#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Car Sales Server...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env file not found!');
  console.log('   Please create a .env file with your environment variables.');
  console.log('   You can use the following template:\n');
  console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  console.log('   JWT_SECRET=your-super-secret-jwt-key');
  console.log('   JWT_EXPIRE=30d');
  console.log('   PORT=5000');
  console.log('   NODE_ENV=development');
  console.log('   CLIENT_URL=http://localhost:3000\n');
}

// Start the server
const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n🛑 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
});
