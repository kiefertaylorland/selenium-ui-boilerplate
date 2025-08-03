const { By, until } = require('selenium-webdriver');
const BaseTest = require('../utils/BaseTest');
const logger = require('../utils/logger');

describe('Dashboard Navigation Tests', () => {
  let baseTest;

  beforeAll(async () => {
    baseTest = new BaseTest();
    await baseTest.setupSuite();
    
    // Login before running dashboard tests
    logger.step('Performing login setup for dashboard tests');
    const driver = baseTest.driver;
    await baseTest.navigateTo('https://the-internet.herokuapp.com/login');
    await driver.findElement(By.id('username')).sendKeys('tomsmith');
    await driver.findElement(By.id('password')).sendKeys('SuperSecretPassword!');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/secure'), 10000);
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

  test('should display secure area after login', async () => {
    const driver = baseTest.driver;
    
    logger.step('Verify we are on the secure area page');
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/secure');
    
    logger.step('Verify secure area header is present');
    const header = await driver.findElement(By.css('h2'));
    const headerText = await header.getText();
    expect(headerText).toBe('Secure Area');
    
    // Take screenshot of dashboard
    await baseTest.driverManager.takeScreenshot('dashboard_loaded.png');
  });

  test('should have logout functionality', async () => {
    const driver = baseTest.driver;
    
    logger.step('Locate logout button');
    const logoutButton = await driver.findElement(By.css('a[href="/logout"]'));
    expect(logoutButton).toBeTruthy();
    
    logger.step('Verify logout button text');
    const buttonText = await logoutButton.getText();
    expect(buttonText).toContain('Logout');
    
    logger.step('Click logout button');
    await logoutButton.click();
    
    logger.step('Verify redirect to login page');
    await driver.wait(until.urlContains('/login'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
    
    logger.step('Verify logout success message');
    const successMessage = await driver.findElement(By.css('.flash.success'));
    const messageText = await successMessage.getText();
    expect(messageText).toContain('You logged out of the secure area!');
    
    // Take screenshot of logout
    await baseTest.driverManager.takeScreenshot('logout_success.png');
  });

  test('should prevent unauthorized access to secure area', async () => {
    const driver = baseTest.driver;
    
    logger.step('Navigate directly to secure area without login');
    await baseTest.navigateTo('https://the-internet.herokuapp.com/secure');
    
    logger.step('Verify redirect to login page');
    await driver.wait(until.urlContains('/login'), 10000);
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).toContain('/login');
    
    logger.step('Verify unauthorized access message');
    const errorMessage = await driver.findElement(By.css('.flash.error'));
    const messageText = await errorMessage.getText();
    expect(messageText).toContain('You must login to view the secure area!');
    
    // Take screenshot of unauthorized access
    await baseTest.driverManager.takeScreenshot('unauthorized_access.png');
  });
});
