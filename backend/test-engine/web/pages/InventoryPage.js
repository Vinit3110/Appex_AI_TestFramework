// backend/test-engine/web/pages/InventoryPage.js
//
// Page Object Model for the SauceDemo inventory (products) page.
// After a successful login the user lands here.
// ─────────────────────────────────────────────────────────────────────────────

class InventoryPage {
  /**
   * @param {import('@playwright/test').Page} page  Playwright page instance
   */
  constructor(page) {
    this.page = page;

    // ── Locators ─────────────────────────────────────────────────────────────
    this.pageTitle      = page.locator('.title');                  // "Products"
    this.inventoryList  = page.locator('.inventory_list');         // Product grid
    this.inventoryItems = page.locator('.inventory_item');         // Each product card
    this.cartIcon       = page.locator('.shopping_cart_link');
    this.menuButton     = page.locator('#react-burger-menu-btn');
    this.logoutLink     = page.locator('#logout_sidebar_link');
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * Wait until the inventory page is fully loaded.
   * Call this right after a successful login to confirm navigation succeeded.
   */
  async waitForLoad() {
    await this.inventoryList.waitFor({ state: 'visible' });
  }

  /**
   * Returns the heading text of the current page (should be "Products").
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return (await this.pageTitle.textContent()).trim();
  }

  /**
   * Returns the number of product cards visible on the page.
   * @returns {Promise<number>}
   */
  async getProductCount() {
    return await this.inventoryItems.count();
  }

  /**
   * Open the hamburger menu, then click Logout.
   */
  async logout() {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();
  }

  // ── Assertions / Getters ─────────────────────────────────────────────────────

  /**
   * Returns true when the inventory list is visible — confirms we're on this page.
   * @returns {Promise<boolean>}
   */
  async isLoaded() {
    return await this.inventoryList.isVisible();
  }

  /**
   * Returns the current page URL.
   * @returns {string}
   */
  getURL() {
    return this.page.url();
  }
}

module.exports = { InventoryPage };
