/**
 * ElementHelper - Performance-optimized element interaction utilities
 * Reduces overhead of common Selenium operations
 */
const { By, until } = require('selenium-webdriver');

class ElementHelper {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Fast element finder with optimized locators
   */
  async findElement(locator, timeout = 5000) {
    try {
      return await this.driver.wait(until.elementLocated(locator), timeout);
    } catch (error) {
      throw new Error(`Element not found: ${locator.toString()} within ${timeout}ms`);
    }
  }

  /**
   * Find multiple elements quickly
   */
  async findElements(locators) {
    const promises = locators.map(locator => 
      this.driver.findElement(locator).catch(() => null)
    );
    return await Promise.all(promises);
  }

  /**
   * Fast form fill - fills multiple fields in parallel
   */
  async fillForm(fieldMap) {
    const promises = Object.entries(fieldMap).map(async ([selector, value]) => {
      const element = await this.findElement(By.css(selector));
      await element.clear();
      return element.sendKeys(value);
    });
    return await Promise.all(promises);
  }

  /**
   * Quick click with retry
   */
  async clickElement(locator, maxRetries = 2) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const element = await this.findElement(locator);
        await element.click();
        return;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    throw lastError;
  }

  /**
   * Get text from element with error handling
   */
  async getElementText(locator, defaultText = '') {
    try {
      const element = await this.findElement(locator);
      return await element.getText();
    } catch (error) {
      return defaultText;
    }
  }

  /**
   * Check if element exists without throwing error
   */
  async elementExists(locator, timeout = 1000) {
    try {
      await this.driver.wait(until.elementLocated(locator), timeout);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(locator, timeout = 5000) {
    return await this.driver.wait(until.elementIsEnabled(
      await this.findElement(locator)
    ), timeout);
  }
}

module.exports = ElementHelper;
