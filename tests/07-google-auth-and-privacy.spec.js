import { test, expect } from '@playwright/test';

test.describe('Google Auth UI and Privacy Policy Page', () => {
  test('should open Google OAuth Client ID setup modal when prompted', async ({ page }) => {
    await page.goto('/');

    // Trigger Client ID modal
    await page.evaluate(() => {
      window.handleGoogleSignIn(true);
    });

    // Client modal should open
    const modal = page.locator('#gdrive-client-modal');
    await expect(modal).toBeVisible();

    // Check setup guide elements
    await expect(page.locator('#input-client-id')).toBeVisible();

    // Close modal
    await page.locator('#btn-close-client-modal').click();
    await expect(modal).toBeHidden();
  });

  test('should support Continue as Offline Guest mode and display user badge', async ({ page }) => {
    await page.goto('/');

    // Open setup modal
    await page.evaluate(() => {
      window.handleGoogleSignIn(true);
    });

    // Click Continue as Offline Guest
    await page.locator('#btn-demo-guest-login').click();

    // Modal should close
    await expect(page.locator('#gdrive-client-modal')).toBeHidden();

    // User badge should be displayed instead of Sign in button
    const userBadge = page.locator('#btn-user-badge');
    await expect(userBadge).toBeVisible();

    // File menu should now show "Google Drive Diagrams"
    await page.locator('#btn-file-menu').click();
    const gdriveSubmenu = page.locator('#menu-gdrive-diagrams-wrap');
    await expect(gdriveSubmenu).toBeVisible();

    // User profile dropdown should allow Sign Out
    await userBadge.click();
    const signoutBtn = page.locator('#menu-gdrive-logout');
    await expect(signoutBtn).toBeVisible();
    await signoutBtn.click();

    // Should return to Sign in button
    await expect(page.locator('#btn-gdrive-login')).toBeVisible();
  });

  test('should load privacy policy page at /privacy.html with full terms and disclosures', async ({ page }) => {
    await page.goto('/privacy.html');

    // Check heading and content
    await expect(page.locator('h1')).toContainText('Privacy Policy');
    await expect(page.locator('body')).toContainText('Google Drive');
    await expect(page.locator('body')).toContainText('ThinkGraph');
  });
});
