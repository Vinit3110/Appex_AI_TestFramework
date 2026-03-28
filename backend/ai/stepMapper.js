// ─────────────────────────────────────────────────────────────
//  stepMapper.js — Map step objects to Playwright functions
// ─────────────────────────────────────────────────────────────

/**
 * Convert an array of { action, target, value } step objects into
 * executable Playwright functions of the form (page) => { … }.
 *
 * NOTE: This module returns closures that use Playwright's `page` API.
 * The `expect` assertion is imported lazily inside the closures so that
 * this module can be safely required from non-test contexts (e.g. the
 * backend server) without crashing due to @playwright/test not being
 * available at import time.
 *
 * Supported actions:
 *   navigate, fill, click, assertVisible, assertText, waitFor
 *
 * @param {Array<{action: string, target: string, value?: string}>} steps
 * @returns {Array<(page: import('playwright').Page) => Promise<void>>}
 */
function mapStepsToPlaywright(steps) {
  return steps.map((step, index) => {
    const { action, target, value } = step;

    switch (action) {
      case "navigate":
        return async (page) => {
          await page.goto(target);
        };

      case "fill":
        if (value === undefined || value === null) {
          throw new Error(
            `Step ${index} ("fill") requires a "value" field but none was provided.`
          );
        }
        return async (page) => {
          await page.fill(target, value);
        };

      case "click":
        return async (page) => {
          await page.click(target);
        };

      case "assertVisible":
        return async (page) => {
          const { expect } = require("@playwright/test");
          await expect(page.locator(target)).toBeVisible();
        };

      case "assertText":
        if (value === undefined || value === null) {
          throw new Error(
            `Step ${index} ("assertText") requires a "value" field but none was provided.`
          );
        }
        return async (page) => {
          const { expect } = require("@playwright/test");
          await expect(page.locator(target)).toHaveText(value);
        };

      case "waitFor":
        return async (page) => {
          await page.waitForSelector(target);
        };

      default:
        throw new Error(
          `Unsupported action "${action}" at step index ${index}. ` +
          `Supported actions: navigate, fill, click, assertVisible, assertText, waitFor.`
        );
    }
  });
}

module.exports = { mapStepsToPlaywright };
