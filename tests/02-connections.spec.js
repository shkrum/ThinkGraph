import { test, expect } from '@playwright/test';

test.describe('Connection and Edge Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should render SVG connection lines between demo nodes', async ({ page }) => {
    // Check that SVG layer and connections exist
    const svgLayer = page.locator('#svg-layer');
    await expect(svgLayer).toBeVisible();

    const connPaths = page.locator('#conn-group path.vis');
    const count = await connPaths.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should switch line types in toolbar', async ({ page }) => {
    const btnOneWay = page.locator('#lt-one-way');
    const btnTwoWay = page.locator('#lt-two-way');
    const btnDotted = page.locator('#lt-dotted');
    const btnSolid = page.locator('#lt-solid');

    // Default is one-way
    await expect(btnOneWay).toHaveClass(/active/);

    // Switch to two-way
    await btnTwoWay.click();
    await expect(btnTwoWay).toHaveClass(/active/);
    await expect(btnOneWay).not.toHaveClass(/active/);

    // Switch to dotted
    await btnDotted.click();
    await expect(btnDotted).toHaveClass(/active/);

    // Switch to solid
    await btnSolid.click();
    await expect(btnSolid).toHaveClass(/active/);
  });

  test('should select a connection line when clicked and display details in Inspector', async ({ page }) => {
    // Dispatch pointerdown on the first connection hit area
    const firstConn = page.locator('#conn-group path.hit').first();
    await firstConn.dispatchEvent('pointerdown');

    // Visible connection line should now have .selected class
    const selectedConn = page.locator('#conn-group path.vis.selected');
    await expect(selectedConn).toBeVisible();

    // Inspector should open with connection properties
    const inspector = page.locator('#inspector');
    await expect(inspector).toContainText(/Connection|Line|Arrow/i);
  });

  test('should delete a selected connection', async ({ page }) => {
    const initialCount = await page.locator('#conn-group path.vis').count();
    expect(initialCount).toBeGreaterThan(0);

    // Dispatch pointerdown on first connection hit area
    const firstConn = page.locator('#conn-group path.hit').first();
    await firstConn.dispatchEvent('pointerdown');

    // Press Delete key
    await page.keyboard.press('Delete');

    // Connection count should decrease by 1
    await expect(page.locator('#conn-group path.vis')).toHaveCount(initialCount - 1);
  });
});
