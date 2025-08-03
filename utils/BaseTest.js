/**
 * BaseTest - Abstract base class for all Selenium tests
 * Provides common setup, teardown, and utility methods
 */
const WebDriverManager = require('./setup');
const logger = require('./logger');

class BaseTest {
  constructor() {
    this.driverManager = null;
    this.driver = null;
    this.testStartTime = null;
  }

  /**
   * Set up WebDriver before all tests in a suite
   */
  async setupSuite() {
    try {
      this.driverManager = new WebDriverManager();
      this.driver = await this.driverManager.createDriver();
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
   * Navigate to a URL with retry logic
   */
  async navigateTo(url, maxRetries = 3) {
    if (!this.driver) {
      throw new Error('WebDriver not initialized');
    }

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.step(`Navigate to: ${url} (attempt ${attempt})`);
        await this.driver.get(url);
        
        // Handle any popup dialogs that might appear after navigation
        await this.handlePopups();
        
        return;
      } catch (error) {
        lastError = error;
        logger.warn(`Navigation attempt ${attempt} failed: ${error.message}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError || new Error(`Failed to navigate to ${url} after ${maxRetries} attempts`);
  }

  /**
   * Handle common browser popups (password manager, notifications, etc.)
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
      
      // Give a short time for any popups to appear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check for Chrome password manager "Change your password" dialog
      const { By } = require('selenium-webdriver');
      
      const changePasswordElements = await this.driver.findElements(
        By.xpath("//*[contains(text(), 'Change your password') or contains(text(), 'Update your password')]")
      );
      
      if (changePasswordElements.length > 0) {
        logger.step('Detected password change popup, attempting to dismiss');
        
        // Look for OK, Cancel, or dismiss buttons
        const dismissButtons = await this.driver.findElements(
          By.xpath("//button[text()='OK' or text()='Ok' or text()='Cancel' or @aria-label='OK' or @aria-label='Close']")
        );
        
        if (dismissButtons.length > 0) {
          // Only click if the button is displayed and enabled
          const button = dismissButtons[0];
          const isDisplayed = await button.isDisplayed();
          const isEnabled = await button.isEnabled();
          
          if (isDisplayed && isEnabled) {
            await button.click();
            logger.step('Popup dismissed successfully');
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
    } catch (error) {
      // Popup handling is best effort - don't fail the test if it doesn't work
      logger.warn(`Popup handling encountered error: ${error.message}`);
    }
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady(timeout = 10000) {
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
