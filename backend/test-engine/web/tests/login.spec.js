// backend/test-engine/web/tests/login.spec.js
//
// Test suite: SauceDemo Login Flows
// ─────────────────────────────────────────────────────────────────────────────
// Covers:
//   ✅  TC-01  Valid credentials   → lands on inventory page
//   ❌  TC-02  Wrong password      → shows error banner
//   ❌  TC-03  Empty username      → shows error banner
//   ❌  TC-04  Empty password      → shows error banner
//   ❌  TC-05  Both fields empty   → shows error banner
//   🔒  TC-06  Locked-out user     → shows specific locked message
//   🔁  TC-07  Logout + re-login   → full round-trip session
// ─────────────────────────────────────────────────────────────────────────────

const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');

// ─── Test credentials (sourced from .env or defaults) ─────────────────────────
const VALID_USER     = process.env.VALID_USERNAME || 'standard_user';
const VALID_PASS     = process.env.VALID_PASSWORD || 'secret_sauce';
const LOCKED_USER    = 'locked_out_user';
const WRONG_PASS     = 'wrong_password_123';

// ─── Expected error message substrings ───────────────────────────────────────
const ERR_INVALID_CREDS = 'Username and password do not match';
const ERR_REQUIRED      = 'is required';
const ERR_LOCKED        = 'Sorry, this user has been locked out';

// ─────────────────────────────────────────────────────────────────────────────
test.describe('SauceDemo — Login', () => {

  // Each test gets a fresh page + fresh page objects
  let loginPage;
  let inventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage     = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  // ── TC-01: Happy path ────────────────────────────────────────────────────────
  test('TC-01 | Valid credentials → redirects to inventory page', async ({ page }) => {
    await loginPage.login(VALID_USER, VALID_PASS);

    // Wait for inventory page to fully render
    await inventoryPage.waitForLoad();

    // ✅ URL should contain /inventory
    expect(page.url()).toContain('/inventory');

    // ✅ Page heading should be "Products"
    expect(await inventoryPage.getPageTitle()).toBe('Products');

    // ✅ Should show at least one product
    const count = await inventoryPage.getProductCount();
    expect(count).toBeGreaterThan(0);
  });

  // ── TC-02: Wrong password ────────────────────────────────────────────────────
  test('TC-02 | Wrong password → shows credential error', async () => {
    await loginPage.login(VALID_USER, WRONG_PASS);

    // ✅ Error banner must appear
    expect(await loginPage.isErrorVisible()).toBe(true);

    // ✅ Error text must mention credentials mismatch
    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain(ERR_INVALID_CREDS);
  });

  // ── TC-03: Empty username ────────────────────────────────────────────────────
  test('TC-03 | Empty username → shows "Username is required" error', async () => {
    await loginPage.login('', VALID_PASS);

    expect(await loginPage.isErrorVisible()).toBe(true);

    const errorText = await loginPage.getErrorText();
    expect(errorText.toLowerCase()).toContain('username');
    expect(errorText).toContain(ERR_REQUIRED);
  });

  // ── TC-04: Empty password ────────────────────────────────────────────────────
  test('TC-04 | Empty password → shows "Password is required" error', async () => {
    await loginPage.login(VALID_USER, '');

    expect(await loginPage.isErrorVisible()).toBe(true);

    const errorText = await loginPage.getErrorText();
    expect(errorText.toLowerCase()).toContain('password');
    expect(errorText).toContain(ERR_REQUIRED);
  });

  // ── TC-05: Both fields empty ─────────────────────────────────────────────────
  test('TC-05 | Both fields empty → shows error', async () => {
    await loginPage.clickLogin(); // submit with nothing filled

    expect(await loginPage.isErrorVisible()).toBe(true);

    // Verify the error message mentions the first required field
    const errorText = await loginPage.getErrorText();
    expect(errorText.toLowerCase()).toContain('username');
    expect(errorText).toContain(ERR_REQUIRED);
  });

  // ── TC-06: Locked-out user ───────────────────────────────────────────────────
  test('TC-06 | Locked-out user → shows locked account message', async () => {
    await loginPage.login(LOCKED_USER, VALID_PASS);

    expect(await loginPage.isErrorVisible()).toBe(true);

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain(ERR_LOCKED);
  });

  // ── TC-07: Logout then re-login ──────────────────────────────────────────────
  test('TC-07 | Valid login → logout → re-login succeeds', async ({ page }) => {
    // First login
    await loginPage.login(VALID_USER, VALID_PASS);
    await inventoryPage.waitForLoad();
    expect(await inventoryPage.isLoaded()).toBe(true);

    // Logout
    await inventoryPage.logout();

    // Should be back on login page
    expect(page.url()).not.toContain('/inventory');

    // Re-initialize login page and ensure clean state
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(VALID_USER, VALID_PASS);

    await inventoryPage.waitForLoad();
    expect(await inventoryPage.isLoaded()).toBe(true);
  });

});
