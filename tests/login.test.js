const { By, until } = require('selenium-webdriver');
const WebDriverManager = require('../utils/setup');
const logger = require('../utils/logger');

describe('Login Page Tests', () => {
  let driverManager;
  let driver;

  beforeAll(async () => {
    driverManager = new WebDriverManager();
    driver = await driverManager.createDriver();
  });

  afterAll(async () => {
    await driverManager.quit();
  });

  beforeEach(async () => {
    logger.testStart(expect.getState().currentTestName);
  });

  afterEach(async () => {
    const testResult = expect.getState().numPassingAsserts > 0 ? 'passed' : 'failed';
    
    // Take screenshot on test failure
    if (testResult === 'failed') {
      try {
        const testName = expect.getState().currentTestName.replace(/\s+/g, '_');
        await driverManager.takeScreenshot(`failed_${testName}.png`);
      } catch (screenshotError) {
        logger.error(`Failed to capture failure screenshot: ${screenshotError.message}`);
      }
    }
    
    logger.testEnd(expect.getState().currentTestName, testResult);
  });

  test('should load login page successfully', async () => {
    logger.step('Navigate to demo login page');
    await driver.get('https://the-internet.herokuapp.com/login');
    
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
    await driverManager.takeScreenshot('login_page_loaded.png');
  });

  test('should perform successful login', async () => {
    logger.step('Navigate to login page');
    await driver.get('https://the-internet.herokuapp.com/login');
    
    logger.step('Enter valid credentials');
    await driver.findElement(By.id('username')).sendKeys('tomsmith');
    await driver.findElement(By.id('password')).sendKeys('SuperSecretPassword!');
    
    logger.step('Click login button');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    logger.step('Wait for secure area page to load');
    await driver.wait(until.urlContains('/secure'), 10000);
    
    logger.step('Verify successful login');
    const successMessage = await driver.findElement(By.css('.flash.success'));
    const messageText = await successMessage.getText();
    expect(messageText).toContain('You logged into a secure area!');
    
    // Take success screenshot
    await driverManager.takeScreenshot('successful_login.png');
  });

  test('should show error for invalid credentials', async () => {
    logger.step('Navigate to login page');
    await driver.get('https://the-internet.herokuapp.com/login');
    
    logger.step('Enter invalid credentials');
    await driver.findElement(By.id('username')).sendKeys('invaliduser');
    await driver.findElement(By.id('password')).sendKeys('invalidpass');
    
    logger.step('Click login button');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    logger.step('Verify error message is displayed');
    const errorMessage = await driver.wait(
      until.elementLocated(By.css('.flash.error')), 
      10000
    );
    const messageText = await errorMessage.getText();
    expect(messageText).toContain('Your username is invalid!');
    
    // Take screenshot of error state
    await driverManager.takeScreenshot('login_error.png');
  });
});
