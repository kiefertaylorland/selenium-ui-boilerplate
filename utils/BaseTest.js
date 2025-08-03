/**
 * BaseTest - Abstract base class for all Selenium tests
 * Provides common setup, teardown, and utility methods
 */
const WebDriverManager = require('./setup');
const ElementHelper = require('./ElementHelper');
const logger = require('./logger');

class BaseTest {
  constructor() {
    this.driverManager = null;
    this.driver = null;
    this.elementHelper = null;
    this.testStartTime = null;
  }

  /**
   * Set up WebDriver before all tests in a suite
   */
  async setupSuite() {
    try {
      this.driverManager = new WebDriverManager();
      this.driver = await this.driverManager.createDriver();
      this.elementHelper = new ElementHelper(this.driver);
      logger.info('Test suite setup completed successfully');
    } catch (error) {
      logger.error('Failed to initialize WebDriver in suite setup:', error);
      throw error;
    }
  }

  /**
   * Clean up after all tests in a suite
   */
  async teardownSuite() {
    try {
      if (this.driverManager) {
        await this.driverManager.quit();
        logger.info('Test suite teardown completed');
      }
    } catch (error) {
      logger.error('Error during suite teardown:', error);
    } finally {
      this.driverManager = null;
      this.driver = null;
      this.elementHelper = null;
    }
  }

  /**
   * Set up before each individual test
   */
  async setupTest(testName) {
    this.testStartTime = Date.now();
    logger.testStart(testName);
  }

  /**
   * Clean up after each individual test
   */
  async teardownTest(testName, testPassed = true) {
    const duration = Date.now() - this.testStartTime;
    const result = testPassed ? 'passed' : 'failed';
    
    // Take screenshot on failure
    if (!testPassed && this.driverManager) {
      try {
        const sanitizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
        await this.driverManager.takeScreenshot(`failed_${sanitizedTestName}.png`);
      } catch (screenshotError) {
        logger.error(`Failed to capture failure screenshot: ${screenshotError.message}`);
      }
    }
    
    logger.testEnd(testName, result);
    logger.info(`Test duration: ${duration}ms`);
  }

  /**
   * Navigate to a URL with retry logic and performance optimizations
   */
  async navigateTo(url, maxRetries = 2) { // Reduced retries from 3 to 2
    if (!this.driver) {
      throw new Error('WebDriver not initialized');
    }

    // Check if we're already on the target URL to avoid unnecessary navigation
    try {
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl === url || (url.includes('/login') && currentUrl.includes('/login'))) {
        logger.step(`Already on target page: ${url}`);
        return;
      }
    } catch (error) {
      // Ignore errors here, proceed with navigation
    }

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.step(`Navigate to: ${url} (attempt ${attempt})`);
        await this.driver.get(url);
        return; // Success, no need for popup handling delay
      } catch (error) {
        lastError = error;
        logger.warn(`Navigation attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay
        }
      }
    }
    
    throw lastError || new Error(`Failed to navigate to ${url} after ${maxRetries} attempts`);
  }

  /**
   * Handle common browser popups (password manager, notifications, etc.)
   * Optimized for performance - reduced delays and simplified logic
   */
  async handlePopups() {
    if (!this.driver) {
      return;
    }

    try {
      // Check if the window is still available first
      const windowHandles = await this.driver.getAllWindowHandles();
      if (windowHandles.length === 0) {
        logger.warn('No browser windows available for popup handling');
        return;
      }
      
      // Minimal delay for popup detection
      await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 500ms
      
      // Quick check for common popup patterns
      const { By } = require('selenium-webdriver');
      
      // Look for any dismiss buttons without complex text matching
      const dismissButtons = await this.driver.findElements(
        By.css('button[aria-label*="close"], button[aria-label*="dismiss"], button[data-dismiss], .close, .dismiss')
      );
      
      if (dismissButtons.length > 0) {
        try {
          const button = dismissButtons[0];
          const isDisplayed = await button.isDisplayed();
          const isEnabled = await button.isEnabled();
          
          if (isDisplayed && isEnabled) {
            await button.click();
            logger.step('Popup dismissed');
            await new Promise(resolve => setTimeout(resolve, 100)); // Reduced delay
          }
        } catch (clickError) {
          // Ignore click errors
        }
      }
      
    } catch (error) {
      // Popup handling is best effort - don't fail the test if it doesn't work
      logger.warn(`Popup handling encountered error: ${error.message}`);
    }
  }

  /**
   * Wait for page to be ready with faster timeout
   */
  async waitForPageReady(timeout = 5000) { // Reduced from 10s to 5s
    if (!this.driver) {
      throw new Error('WebDriver not initialized');
    }

    try {
      await this.driver.wait(
        async () => {
          const readyState = await this.driver.executeScript('return document.readyState');
          return readyState === 'complete';
        },
        timeout
      );
    } catch (error) {
      logger.warn(`Page ready timeout after ${timeout}ms: ${error.message}`);
    }
  }

  /**
   * Get page information for debugging
   */
  async getPageInfo() {
    if (this.driverManager) {
      return await this.driverManager.getPageInfo();
    }
    return { url: 'unknown', title: 'unknown' };
  }
}

module.exports = BaseTest;
