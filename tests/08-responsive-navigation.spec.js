import { test, expect } from '@playwright/test';

test.describe('Responsive Navigation & Small Screen / Resized Desktop Adaptability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should provide Tools dropdown menu accessible on resized desktop (850px width)', async ({ page }) => {
    await page.setViewportSize({ width: 850, height: 750 });

    // Verify top menu bar elements are visible
    const fileBtn = page.locator('#btn-file-menu');
    const toolsBtn = page.locator('#btn-tools-menu');
    const settingsBtn = page.locator('#btn-settings-menu');

    await expect(fileBtn).toBeVisible();
    await expect(toolsBtn).toBeVisible();
    await expect(settingsBtn).toBeVisible();

    // Open Tools menu
    await toolsBtn.click();
    const toolsMenuWrap = page.locator('#tools-menu-wrap');
    await expect(toolsMenuWrap).toHaveClass(/open/);

    // Verify all essential tools are present in the dropdown
    await expect(page.locator('#menu-tool-add-node')).toBeVisible();
    await expect(page.locator('#menu-tool-add-group')).toBeVisible();
    await expect(page.locator('#menu-tool-demo')).toBeVisible();
    await expect(page.locator('#menu-tool-format')).toBeVisible();
    await expect(page.locator('#menu-tool-inspector')).toBeVisible();
    await expect(page.locator('#menu-tool-global-props')).toBeVisible();
    await expect(page.locator('#menu-tool-lines-wrap')).toBeVisible();

    // Trigger Demo switch through the Tools menu
    await page.locator('#menu-tool-demo').click();
    await expect(page.locator('#toast')).toContainText('Demo 2');

    // Trigger Add Node through the Tools menu
    const initialNodes = await page.locator('.gnode').count();
    await toolsBtn.click();
    await page.locator('#menu-tool-add-node').click();
    const newNodes = await page.locator('.gnode').count();
    expect(newNodes).toBe(initialNodes + 1);
  });

  test('should scroll tool buttons using scroll chevrons on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 700 });

    const scrollContainer = page.locator('#tb-tools-scroll');
    const btnScrollRight = page.locator('#btn-tb-scroll-right');
    const btnScrollLeft = page.locator('#btn-tb-scroll-left');

    // Right chevron should be visible when tools overflow
    await expect(btnScrollRight).toBeVisible();

    // Initial scrollLeft should be 0
    const initialScroll = await scrollContainer.evaluate(el => el.scrollLeft);
    expect(initialScroll).toBe(0);

    // Click right chevron to scroll
    await btnScrollRight.click();
    await page.waitForTimeout(400);

    const scrolledLeft = await scrollContainer.evaluate(el => el.scrollLeft);
    expect(scrolledLeft).toBeGreaterThan(50);

    // Left chevron should now be visible
    await expect(btnScrollLeft).toBeVisible();

    // Click left chevron to scroll back
    await btnScrollLeft.click();
    await page.waitForTimeout(400);

    const backScroll = await scrollContainer.evaluate(el => el.scrollLeft);
    expect(backScroll).toBeLessThan(scrolledLeft);
  });

  test('should retain full menu access on ultra-compact mobile screens (360px width)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    // All main headers must be visible and within screen boundary
    const fileBtn = page.locator('#btn-file-menu');
    const toolsBtn = page.locator('#btn-tools-menu');
    const settingsBtn = page.locator('#btn-settings-menu');

    await expect(fileBtn).toBeVisible();
    await expect(toolsBtn).toBeVisible();
    await expect(settingsBtn).toBeVisible();

    const toolsBox = await toolsBtn.boundingBox();
    expect(toolsBox).not.toBeNull();
    expect(toolsBox.x + toolsBox.width).toBeLessThanOrEqual(360);

    // Open Settings menu
    await settingsBtn.click();
    await expect(page.locator('#settings-menu-wrap')).toHaveClass(/open/);
    await expect(page.locator('#menu-theme-light')).toBeVisible();

    // Open File menu and check Demo Diagrams
    await fileBtn.click();
    await expect(page.locator('#file-menu-wrap')).toHaveClass(/open/);
    await expect(page.locator('#settings-menu-wrap')).not.toHaveClass(/open/);
    await expect(page.locator('#menu-demos-wrap')).toBeVisible();
  });

  test('should support mobile inspector drawer with backdrop and dismiss on smartphone (390x844)', async ({ page }) => {
    // Smartphone viewport (iPhone 12/13/14)
    await page.setViewportSize({ width: 390, height: 844 });

    const homerNode = page.locator('.gnode[data-node-id="homer"]');
    const inspector = page.locator('#inspector');
    const backdrop = page.locator('#inspector-backdrop');

    // Tap node on mobile
    await homerNode.click();
    await expect(inspector).toHaveClass(/open/);
    await expect(backdrop).toHaveClass(/active/);

    // Close button should be present in mobile close bar
    const closeBtn = page.locator('#btn-close-insp-panel');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Drawer and backdrop should close
    await expect(inspector).not.toHaveClass(/open/);
    await expect(backdrop).not.toHaveClass(/active/);

    // Tap node again, then tap backdrop to dismiss
    await homerNode.click();
    await expect(inspector).toHaveClass(/open/);
    await backdrop.click({ position: { x: 20, y: 200 } });
    await expect(inspector).not.toHaveClass(/open/);
  });

  test('should render thumb-friendly zoom controls on smartphone (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    const zoomInBtn = page.locator('#zc-in');
    await expect(zoomInBtn).toBeVisible();
    await page.waitForTimeout(200);

    const box = await zoomInBtn.boundingBox();
    expect(box).not.toBeNull();
    // Verify enlarged touch target for thumbs (>=30px)
    expect(box.width).toBeGreaterThanOrEqual(30);
    expect(box.height).toBeGreaterThanOrEqual(30);
  });
});
