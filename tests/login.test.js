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
    
    logger.step('Click login button');
    await driver.findElement(By.css('button[type="submit"]')).click();
    
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
    
    await baseTest.navigateTo('https://the-internet.herokuapp.com/login');
    
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
    await baseTest.driverManager.takeScreenshot('login_error.png');
  });
});
