const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Setup test database
const testDbPath = path.join(__dirname, 'test.db');

// Clean up test database before each test suite
beforeAll(() => {
  // Remove test database if it exists
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-characters-long';
  process.env.ACCESS_TOKEN_EXPIRY = '15m';
  process.env.REFRESH_TOKEN_EXPIRY = '7d';
  process.env.DB_PATH = testDbPath;
});

// Clean up after all tests
afterAll(() => {
  if (fs.existsSync(testDbPath)) {
    try {
      fs.unlinkSync(testDbPath);
    } catch (error) {
      console.error('Failed to clean up test database:', error);
    }
  }
});

// Global test utilities
global.testDbPath = testDbPath;
