/**
 * Jest configuration for Selenium UI tests
 * Optimized for CI/CD environments with proper timeouts and reporting
 */
module.exports = {
  // Test environment configuration
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 60000, // 60s timeout for UI tests
  verbose: true,
  
  // Performance optimization for CI
  collectCoverage: false,
  maxConcurrency: 1, // Sequential execution to avoid resource conflicts
  maxWorkers: 1, // Single worker for stability
  
  // Test reporting configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      suiteNameTemplate: '{filepath}',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testSequencer: '<rootDir>/jest.sequencer.js'
};
