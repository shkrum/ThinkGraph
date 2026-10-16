import { test, expect } from '@playwright/test';

test.describe('File Menu, Export, and AI Help', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should open and close File menu dropdown', async ({ page }) => {
    const fileMenuBtn = page.locator('#btn-file-menu');
    const fileMenuWrap = page.locator('#file-menu-wrap');

    // Click to open
    await fileMenuBtn.click();
    await expect(fileMenuWrap).toHaveClass(/open/);

    // Verify menu items
    await expect(page.locator('#menu-new')).toBeVisible();
    await expect(page.locator('#menu-open')).toBeVisible();

    // Click outside to close
    await page.locator('#canvas-root').click({ position: { x: 400, y: 300 } });
    await expect(fileMenuWrap).not.toHaveClass(/open/);
  });

  test('should clear canvas and reset diagram name when clicking New Diagram', async ({ page }) => {
    const fileMenuBtn = page.locator('#btn-file-menu');
    await fileMenuBtn.click();

    // Click New Diagram
    await page.locator('#menu-new').click();

    // Canvas nodes should be cleared
    await expect(page.locator('.gnode')).toHaveCount(0);

    // Diagram name should reset
    await expect(page.locator('#diagram-name')).toHaveValue('Untitled Diagram');
  });

  test('should trigger .umlgraph download when exporting diagram data', async ({ page }) => {
    const fileMenuBtn = page.locator('#btn-file-menu');
    await fileMenuBtn.click();

    // Start waiting for download before triggering export
    const downloadPromise = page.waitForEvent('download');
    await page.evaluate(() => document.getElementById('menu-export-json').click());

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.umlgraph$/);
  });

  test('should open and view AI Help instructions modal', async ({ page }) => {
    const aiHelpBtn = page.locator('#btn-ai-help');
    await aiHelpBtn.click();

    const modal = page.locator('#ai-help-modal');
    await expect(modal).toBeVisible();

    // Verify AI prompt text is populated
    const helpContent = page.locator('#ai-help-text');
    await expect(helpContent).toContainText('.umlgraph File Format Instructions');

    // Close AI Help modal
    await page.locator('#btn-close-ai-help').click();
    await expect(modal).toBeHidden();
  });
});
