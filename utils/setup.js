const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

/**
 * WebDriverManager - Centralized WebDriver management with enhanced configuration
 * Supports Chrome and Firefox with optimized settings for CI/CD environments
 */
class WebDriverManager {
  constructor() {
    this.driver = null;
    this.browser = (process.env.BROWSER || 'chrome').toLowerCase();
    this.headless = process.env.HEADLESS === 'true';
    this.retries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Create and configure WebDriver instance
   * @returns {Promise<WebDriver>} Configured WebDriver instance
   */
  async createDriver() {
    try {
      const builder = new Builder();
      
      if (this.browser === 'chrome') {
        this._configureChromeOptions(builder);
      } else if (this.browser === 'firefox') {
        this._configureFirefoxOptions(builder);
      } else {
        throw new Error(`Unsupported browser: ${this.browser}`);
      }

      // Retry logic for driver creation
      this.driver = await this._createDriverWithRetry(builder);
      
      // Configure timeouts
      await this._configureTimeouts();
      
      logger.info(`WebDriver initialized successfully`, {
        browser: this.browser,
        headless: this.headless,
        version: await this._getBrowserVersion()
      });
      
      return this.driver;
      
    } catch (error) {
      logger.error(`Failed to initialize WebDriver: ${error.message}`);
      throw error;
    }
  }

  /**
   * Configure Chrome browser options
   * @private
   */
  _configureChromeOptions(builder) {
    const chromeOptions = new chrome.Options();
    
    // Basic options
    const basicArgs = [
      '--window-size=1920,1080',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=VizDisplayCompositor',
      '--remote-debugging-port=9222'
    ];

    // Headless mode
    if (this.headless) {
      chromeOptions.addArguments('--headless=new');
    }

    // CI-specific optimizations
    if (process.env.CI) {
      const ciArgs = [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-background-networking',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-hang-monitor',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--password-store=basic',
        '--use-mock-keychain'
      ];
      basicArgs.push(...ciArgs);
    }

    chromeOptions.addArguments(...basicArgs);
    builder.forBrowser('chrome').setChromeOptions(chromeOptions);
  }

  /**
   * Configure Firefox browser options
   * @private
   */
  _configureFirefoxOptions(builder) {
    const firefoxOptions = new firefox.Options();
    
    const basicArgs = [
      '--width=1920', 
      '--height=1080',
      '--disable-gpu',
      '--no-sandbox'
    ];

    if (this.headless) {
      firefoxOptions.addArguments('--headless');
    }

    // CI-specific preferences
    if (process.env.CI) {
      firefoxOptions.setPreference('media.volume_scale', '0.0');
      firefoxOptions.setPreference('dom.webnotifications.enabled', false);
      firefoxOptions.setPreference('browser.safebrowsing.downloads.enabled', false);
    }

    firefoxOptions.addArguments(...basicArgs);
    builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions);
  }
  /**
   * Create driver with retry logic
   * @private
   */
  async _createDriverWithRetry(builder) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        return await builder.build();
      } catch (error) {
        lastError = error;
        logger.warn(`Driver creation attempt ${attempt}/${this.retries} failed: ${error.message}`);
        
        if (attempt < this.retries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }
    
    throw lastError || new Error(`Failed to create driver after ${this.retries} attempts`);
  }

  /**
   * Configure WebDriver timeouts
   * @private
   */
  async _configureTimeouts() {
    await this.driver.manage().setTimeouts({ 
      implicit: 10000,    // 10 seconds for element location
      pageLoad: 30000,    // 30 seconds for page load
      script: 30000       // 30 seconds for script execution
    });
  }

  /**
   * Get browser version for logging
   * @private
   */
  async _getBrowserVersion() {
    try {
      const capabilities = await this.driver.getCapabilities();
      return capabilities.get('browserVersion') || 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Take screenshot with improved naming and error handling
   * @param {string} filename - Optional custom filename
   * @returns {Promise<string>} Screenshot file path
   */
  async takeScreenshot(filename = null) {
    if (!this.driver) {
      throw new Error('WebDriver not initialized');
    }

    try {
      // Ensure screenshots directory exists
      const screenshotsDir = path.join(__dirname, '..', 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = filename || `screenshot-${timestamp}.png`;
      const screenshotPath = path.join(screenshotsDir, screenshotName);
      
      const screenshot = await this.driver.takeScreenshot();
      fs.writeFileSync(screenshotPath, screenshot, 'base64');
      
      logger.screenshot(screenshotPath);
      return screenshotPath;
      
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current page information for debugging
   * @returns {Promise<Object>} Page information
   */
  async getPageInfo() {
    if (!this.driver) {
      throw new Error('WebDriver not initialized');
    }

    try {
      const [url, title] = await Promise.all([
        this.driver.getCurrentUrl(),
        this.driver.getTitle()
      ]);

      return { url, title };
    } catch (error) {
      logger.error(`Failed to get page info: ${error.message}`);
      return { url: 'unknown', title: 'unknown' };
    }
  }

  /**
   * Gracefully quit the WebDriver
   */
  async quit() {
    if (this.driver) {
      try {
        await this.driver.quit();
        logger.info('WebDriver closed successfully');
      } catch (error) {
        logger.error(`Error closing WebDriver: ${error.message}`);
      } finally {
        this.driver = null;
      }
    }
  }
}

module.exports = WebDriverManager;
