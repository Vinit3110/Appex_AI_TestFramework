// backend/test-engine/web/pages/LoginPage.js
//
// Page Object Model for the SauceDemo login page.
// ─────────────────────────────────────────────────────────────────────────────
// WHY PAGE OBJECTS?
//   If SauceDemo changes a selector, you fix it HERE — not in every test file.
//   Tests stay readable ("loginPage.login(user, pass)") instead of
//   being cluttered with raw locator strings.
// ─────────────────────────────────────────────────────────────────────────────

class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page  Playwright page instance
   */
  constructor(page) {
    this.page = page;

    // ── Locators ─────────────────────────────────────────────────────────────
    // Using stable attribute-based selectors (id) — less brittle than CSS classes
    this.usernameInput    = page.locator('#user-name');
    this.passwordInput    = page.locator('#password');
    this.loginButton      = page.locator('#login-button');
    this.errorMessage     = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * Navigate to the login page.
   * Always call this before interacting with the page in a test.
   */
  async goto() {
    await this.page.goto('/');
    // Wait until the login button is visible so we know the page fully loaded
    await this.loginButton.waitFor({ state: 'visible' });
  }

  /**
   * Fill the username field.
   * @param {string} username
   */
  async fillUsername(username) {
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
  }

  /**
   * Fill the password field.
   * @param {string} password
   */
  async fillPassword(password) {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  /**
   * Click the login button.
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Full login flow: fill credentials + submit.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  // ── Assertions / Getters ─────────────────────────────────────────────────────

  /**
   * Returns true if the red error banner is currently visible.
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  /**
   * Returns the trimmed text content of the error banner.
   * @returns {Promise<string>}
   */
  async getErrorText() {
    return (await this.errorMessage.textContent()).trim();
  }

  /**
   * Dismiss the error banner by clicking the ✕ button.
   */
  async dismissError() {
    await this.errorCloseButton.click();
  }
}

module.exports = { LoginPage };
