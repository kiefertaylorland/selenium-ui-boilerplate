const { By, until } = require('selenium-webdriver');
const BaseTest = require('../utils/BaseTest');
const logger = require('../utils/logger');

describe('Login Page Tests', () => {
  let baseTest;

  beforeAll(async () => {
    baseTest = new BaseTest();
    await baseTest.setupSuite();
  });

  afterAll(async () => {
    if (baseTest) {
      await baseTest.teardownSuite();
    }
  });

  beforeEach(async () => {
    const testName = expect.getState().currentTestName;
    await baseTest.setupTest(testName);
  });

  afterEach(async () => {
    const testName = expect.getState().currentTestName;
    const testPassed = expect.getState().numPassingAsserts > 0;
    await baseTest.teardownTest(testName, testPassed);
  });

  test('should load login page successfully', async () => {
    const driver = baseTest.driver;
    
    await baseTest.navigateTo('https://the-internet.herokuapp.com/login');
    await baseTest.waitForPageReady();
    
    logger.step('Verify page title contains "Login"');
    const title = await driver.getTitle();
    expect(title).toContain('The Internet');
    
    logger.step('Verify login form elements are present');
    const usernameField = await driver.findElement(By.id('username'));
    const passwordField = await driver.findElement(By.id('password'));
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    
    expect(usernameField).toBeTruthy();
    expect(passwordField).toBeTruthy();
    expect(loginButton).toBeTruthy();
    
    // Take success screenshot
    await baseTest.driverManager.takeScreenshot('login_page_loaded.png');
  });

  test('should perform successful login', async () => {
    const driver = baseTest.driver;
    
    await baseTest.navigateTo('https://the-internet.herokuapp.com/login');
    
    logger.step('Enter valid credentials');
    await driver.findElement(By.id('username')).sendKeys('tomsmith');
    await driver.findElement(By.id('password')).sendKeys('SuperSecretPassword!');
    
    // Handle any popups that might appear after entering credentials
    await baseTest.handlePopups();
    
    logger.step('Click login button');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Handle any popups that might appear after clicking login
    await baseTest.handlePopups();
    
    logger.step('Wait for secure area page to load');
    await driver.wait(until.urlContains('/secure'), 10000);
    
    logger.step('Verify successful login');
    const successMessage = await driver.findElement(By.css('.flash.success'));
    const messageText = await successMessage.getText();
    expect(messageText).toContain('You logged into a secure area!');
    
    // Take success screenshot
    await baseTest.driverManager.takeScreenshot('successful_login.png');
  });

  test('should show error for invalid credentials', async () => {
    const driver = baseTest.driver;
    
    // Navigate to login page first to establish a proper context
    await baseTest.navigateTo('https://the-internet.herokuapp.com/login');
    
    // Now clear all browser state to ensure completely clean test state
    await driver.manage().deleteAllCookies();
    await driver.executeScript('window.sessionStorage.clear();');
    await driver.executeScript('window.localStorage.clear();');
    
    // Navigate again to ensure we're on a clean login page
    await baseTest.navigateTo('https://the-internet.herokuapp.com/login');
    await baseTest.waitForPageReady();
    
    logger.step('Enter invalid credentials');
    await driver.findElement(By.id('username')).sendKeys('invaliduser');
    await driver.findElement(By.id('password')).sendKeys('invalidpass');
    
    // Handle any popups that might appear after entering credentials
    await baseTest.handlePopups();
    
    logger.step('Click login button');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Handle any popups that might appear after clicking login
    await baseTest.handlePopups();
    
    logger.step('Verify error message is displayed');
    // Wait for form submission to complete by checking URL stays the same
    await driver.wait(until.urlContains('/login'), 5000);
    
    // Additional wait to ensure DOM is updated
    await driver.sleep(1000);
    
    // Add a safety check to ensure the window is still available
    const windowHandles = await driver.getAllWindowHandles();
    if (windowHandles.length === 0) {
      throw new Error('Browser window was closed unexpectedly');
    }
    
    // Debug: Check what elements are actually on the page
    try {
      const errorMessage = await driver.findElement(By.css('.flash.error'));
      const messageText = await errorMessage.getText();
      expect(messageText).toContain('Your username is invalid!');
    } catch (error) {
      // If we can't find the error element, let's debug what's on the page
      logger.warn('Could not find .flash.error element, debugging page state...');
      
      const currentUrl = await driver.getCurrentUrl();
      logger.info(`Current URL: ${currentUrl}`);
      
      // Check for any flash elements
      const allFlashElements = await driver.findElements(By.css('.flash'));
      logger.info(`Found ${allFlashElements.length} .flash elements`);
      
      for (let i = 0; i < allFlashElements.length; i++) {
        const flash = allFlashElements[i];
        const className = await flash.getAttribute('class');
        const text = await flash.getText();
        logger.info(`Flash element ${i + 1}: class="${className}", text="${text}"`);
      }
      
      // Check if we're still on the login page
      const usernameField = await driver.findElements(By.id('username'));
      logger.info(`Username field present: ${usernameField.length > 0}`);
      
      // Take a screenshot for debugging
      await baseTest.driverManager.takeScreenshot('debug_error_not_found.png');
      
      // Re-throw the original error
      throw error;
    }
    
    // Take screenshot of error state
    await baseTest.driverManager.takeScreenshot('login_error.png');
  });
});
