import { test, expect } from '@playwright/test';

test.describe('Theme and Viewport Zoom Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.gnode');
  });

  test('should switch between Dark Theme and White Theme', async ({ page }) => {
    const settingsBtn = page.locator('#btn-settings-menu');
    await settingsBtn.click();

    // Select White Theme
    await page.locator('#menu-theme-light').click();
    await expect(page.locator('body')).toHaveClass(/light-theme/);

    // Switch back to Dark Theme
    await settingsBtn.click();
    await page.locator('#menu-theme-dark').click();
    await expect(page.locator('body')).not.toHaveClass(/light-theme/);
  });

  test('should zoom in, zoom out, and reset zoom using viewport controls', async ({ page }) => {
    const zoomLabel = page.locator('#zoom-label');
    const zoomInBtn = page.locator('#zc-in');
    const zoomOutBtn = page.locator('#zc-out');
    const zoomResetBtn = page.locator('#zc-reset');

    // Read initial zoom percentage
    const initialText = await zoomLabel.innerText();
    const initialZoom = parseInt(initialText);

    // Zoom in
    await zoomInBtn.click();
    const zoomedInText = await zoomLabel.innerText();
    expect(parseInt(zoomedInText)).toBeGreaterThan(initialZoom);

    // Zoom out twice
    await zoomOutBtn.click();
    await zoomOutBtn.click();
    const zoomedOutText = await zoomLabel.innerText();
    expect(parseInt(zoomedOutText)).toBeLessThan(parseInt(zoomedInText));

    // Reset zoom to standard 100%
    await zoomResetBtn.click();
    await expect(zoomLabel).toHaveText('100%');
  });
});
