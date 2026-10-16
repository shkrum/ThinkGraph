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
});
