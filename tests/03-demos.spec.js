import { test, expect } from '@playwright/test';

test.describe('Demo Diagram Toggling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should toggle to Demo 2 (Molecular Chemistry Graph) when clicking Demo button', async ({ page }) => {
    // Click Demo button
    const demoBtn = page.locator('#btn-demo');
    await demoBtn.click();

    // Verify toast confirms Demo 2 loaded
    const toast = page.locator('#toast');
    await expect(toast).toContainText('Demo 2');

    // Diagram title should update to molecular chemistry graph
    const diagramName = page.locator('#diagram-name');
    await expect(diagramName).toHaveValue(/Molecular|Chemistry|Food/i);

    // Verify nodes from Demo 2 are present
    const nodes = page.locator('.gnode');
    const nodeCount = await nodes.count();
    expect(nodeCount).toBeGreaterThan(10);

    // Verify specific chemistry nodes exist
    await expect(page.locator('.gnode:has-text("Sucrose")')).toBeVisible();
    await expect(page.locator('.gnode:has-text("Glucose")')).toBeVisible();
  });

  test('should toggle back to Demo 1 when clicking Demo button a second time', async ({ page }) => {
    const demoBtn = page.locator('#btn-demo');

    // Switch to Demo 2
    await demoBtn.click();
    await page.waitForTimeout(300);

    // Switch back to Demo 1
    await demoBtn.click();

    // Verify Demo 1 loaded
    const toast = page.locator('#toast');
    await expect(toast).toContainText('Demo 1');

    const diagramName = page.locator('#diagram-name');
    await expect(diagramName).toHaveValue(/742 Evergreen Terrace/);

    await expect(page.locator('.gnode:has-text("Homer J. Simpson")')).toBeVisible();
  });

  test('should display Demo button and File menu demo items on mobile phone viewport', async ({ page }) => {
    // Set viewport to mobile phone size (e.g. iPhone 12/13/14 390x844)
    await page.setViewportSize({ width: 390, height: 844 });

    // Verify Demo button is visible and within the viewport horizontally
    const demoBtn = page.locator('#btn-demo');
    await expect(demoBtn).toBeVisible();

    const box = await demoBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);

    // Click Demo button on mobile
    await demoBtn.click();
    const toast = page.locator('#toast');
    await expect(toast).toContainText('Demo 2');

    // Open File menu on mobile
    const fileBtn = page.locator('#btn-file-menu');
    await fileBtn.click();

    // Verify Demo Diagrams menu item exists in File menu
    const demosMenuItem = page.locator('#menu-demos-wrap');
    await expect(demosMenuItem).toBeVisible();

    // Tap Demo Diagrams to open submenu
    await demosMenuItem.click();
    const demo1Option = page.locator('#menu-demo-1');
    await expect(demo1Option).toBeVisible();

    // Select Demo 1 from menu
    await demo1Option.click();
    await expect(page.locator('#diagram-name')).toHaveValue(/742 Evergreen Terrace/);
    await expect(page.locator('.gnode:has-text("Homer J. Simpson")')).toBeVisible();
  });
});
