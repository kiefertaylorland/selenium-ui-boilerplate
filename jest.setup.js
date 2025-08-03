/**
 * Jest setup file for Selenium UI tests
 * Handles global configuration, directory setup, and error handling
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set default timeout for all test operations
jest.setTimeout(60000);

// Global setup - ensure required directories exist
beforeAll(async () => {
  const requiredDirs = ['screenshots', 'logs', 'test-results'];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
});

// Enhanced global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', {
    promise,
    reason: reason?.message || reason
  });
  
  // Log to file if logger is available
  try {
    const logger = require('./utils/logger');
    logger.error('Unhandled Promise Rejection', { 
      reason: reason?.message || reason,
      stack: reason?.stack 
    });
  } catch (err) {
    // Logger not available, continue with console only
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  
  // Log to file if logger is available
  try {
    const logger = require('./utils/logger');
    logger.error('Uncaught Exception', { 
      message: error.message,
      stack: error.stack 
    });
  } catch (err) {
    // Logger not available, continue with console only
  }
  
  process.exit(1);
});
