import { test, expect } from '@playwright/test';

test.describe('Inspector, Formatting, and Global Properties', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should display node properties in Inspector and allow editing', async ({ page }) => {
    // Select Homer node by data-node-id
    const homerNode = page.locator('.gnode[data-node-id="homer"]');
    await homerNode.click();

    // Inspector should display node title in #ip-title input
    const inspector = page.locator('#inspector');
    await expect(inspector).toBeVisible();

    const titleInput = inspector.locator('#ip-title');
    await expect(titleInput).toHaveValue('Homer J. Simpson');

    // Edit title in inspector
    await titleInput.fill('Homer Simpson (Safety Inspector)');
    await titleInput.press('Enter');

    // Canvas node should reflect edited title
    await expect(homerNode).toContainText('Homer Simpson (Safety Inspector)');
  });

  test('should format diagram layout when Format button is clicked', async ({ page }) => {
    const formatBtn = page.locator('#btn-format');
    await formatBtn.click();

    // Toast should confirm auto-format
    const toast = page.locator('#toast');
    await expect(toast).toContainText(/Arranged|Formatted|nodes/i);
  });

  test('should filter nodes by priority badge', async ({ page }) => {
    const prioFilter = page.locator('#prio-filter');

    // Type filter for Walter White's badge (CH3)
    await prioFilter.fill('CH3');

    // Matching node should remain fully visible
    const walterNode = page.locator('.gnode:has-text("Heisenberg")');
    await expect(walterNode).toBeVisible();

    // Clear filter
    await prioFilter.fill('');
  });

  test('should open, interact with, and close Global Properties modal', async ({ page }) => {
    const globalPropsBtn = page.locator('#btn-global-props');
    await globalPropsBtn.click();

    // Modal should be visible
    const modal = page.locator('#global-props-modal');
    await expect(modal).toBeVisible();

    // Check stats label
    const statsLabel = page.locator('#gp-stats-label');
    await expect(statsLabel).toContainText('nodes');

    // Click Rectangle shape button
    const rectShapeBtn = page.locator('#gp-shapes-container button[data-shape="rectangle"]');
    await rectShapeBtn.click();
    await expect(rectShapeBtn).toHaveClass(/active/);

    // Close modal via close button
    const closeBtn = page.locator('#btn-close-global-props');
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });
});
