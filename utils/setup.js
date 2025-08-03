const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const logger = require('./logger');

class WebDriverManager {
  constructor() {
    this.driver = null;
    this.browser = process.env.BROWSER || 'chrome';
    this.headless = process.env.HEADLESS === 'true';
  }

  async createDriver() {
    try {
      const builder = new Builder();
      
      switch (this.browser.toLowerCase()) {
        case 'chrome':
          const chromeOptions = new chrome.Options();
          if (this.headless) {
            chromeOptions.addArguments('--headless=new'); // Use new headless mode
          }
          // Security and stability options
          chromeOptions.addArguments(
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor'
          );
          
          // Let selenium-manager handle ChromeDriver version automatically
          builder.forBrowser('chrome').setChromeOptions(chromeOptions);
          break;
          
        case 'firefox':
          const firefoxOptions = new firefox.Options();
          if (this.headless) {
            firefoxOptions.addArguments('--headless');
          }
          firefoxOptions.addArguments('--width=1920', '--height=1080');
          builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions);
          break;
          
        default:
          throw new Error(`Unsupported browser: ${this.browser}`);
      }

      this.driver = await builder.build();
      
      // Set implicit wait
      await this.driver.manage().setTimeouts({ implicit: 10000 });
      
      logger.info(`WebDriver initialized successfully - Browser: ${this.browser}, Headless: ${this.headless}`);
      return this.driver;
      
    } catch (error) {
      logger.error(`Failed to initialize WebDriver: ${error.message}`);
      throw error;
    }
  }

  async takeScreenshot(filename = null) {
    if (!this.driver) {
      throw new Error('WebDriver not initialized');
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = filename || `screenshot-${timestamp}.png`;
      const screenshotPath = `screenshots/${screenshotName}`;
      
      const screenshot = await this.driver.takeScreenshot();
      require('fs').writeFileSync(screenshotPath, screenshot, 'base64');
      
      logger.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
      
    } catch (error) {
      logger.error(`Failed to take screenshot: ${error.message}`);
      throw error;
    }
  }

  async quit() {
    if (this.driver) {
      try {
        await this.driver.quit();
        logger.info('WebDriver closed successfully');
      } catch (error) {
        logger.error(`Error closing WebDriver: ${error.message}`);
      }
    }
  }
}

module.exports = WebDriverManager;
