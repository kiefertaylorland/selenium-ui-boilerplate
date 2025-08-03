/**
 * Jest configuration for Selenium UI tests
 * Optimized for performance with faster timeouts and parallel execution
 */
module.exports = {
  // Test environment configuration
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000, // Reduced from 60s to 30s for faster feedback
  verbose: false, // Disable verbose to reduce output overhead
  
  // Performance optimization
  collectCoverage: false,
  maxConcurrency: process.env.CI ? 1 : 2, // Allow 2 concurrent tests locally, 1 in CI
  maxWorkers: process.env.CI ? 1 : '50%', // Use 50% of available cores locally
  
  // Faster test detection
  watchPathIgnorePatterns: ['<rootDir>/screenshots/', '<rootDir>/logs/', '<rootDir>/test-results/'],
  
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
  testSequencer: '<rootDir>/jest.sequencer.js',
  
  // Performance improvements
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false
};
