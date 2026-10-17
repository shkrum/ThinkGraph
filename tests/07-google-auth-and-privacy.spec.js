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

  test('should show Google Drive API enable guide in client setup modal', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { window.handleGoogleSignIn(true); });

    const enableGuideLink = page.locator('#link-gdrive-api-enable-guide');
    await expect(enableGuideLink).toBeVisible();
    await expect(enableGuideLink).toHaveAttribute('href', /console\.developers\.google\.com\/apis\/api\/drive\.googleapis\.com\/overview\?project=1049811661590/);
  });

  test('should display Google Drive API enable modal with direct console link and local download option', async ({ page }) => {
    await page.goto('/');

    // Trigger API enable modal via window helper
    await page.evaluate(() => {
      window.showGoogleDriveApiEnableModal('1049811661590', {
        diagramId: 'test_diag',
        diagramName: 'Test Diagram',
        nodes: [{ id: 'n1', label: 'Node 1', x: 100, y: 100 }]
      }, 'test_diagram.umlgraph');
    });

    const modal = page.locator('#gdrive-api-enable-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#api-modal-project-id')).toHaveText('1049811661590');

    // Verify direct console link has correct project id
    const consoleLink = page.locator('#btn-enable-drive-api-link');
    await expect(consoleLink).toHaveAttribute('href', 'https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=1049811661590');

    // Test download locally button
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#btn-api-modal-download-local').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test_diagram.umlgraph');

    // Close modal
    await page.locator('#btn-close-api-modal').click();
    await expect(modal).toBeHidden();
  });

  test('should show warning in Google Drive submenu when Drive API is disabled', async ({ page }) => {
    await page.goto('/');

    // Login as offline guest first
    await page.evaluate(() => { window.handleGoogleSignIn(true); });
    await page.locator('#btn-demo-guest-login').click();

    // Mark drive API disabled and re-render menu
    await page.evaluate(() => {
      window.googleDriveService.isDriveApiDisabled = true;
      window.googleDriveService.disabledProjectId = '1049811661590';
      window.renderGoogleDriveMenu();
    });

    // Open file menu
    await page.locator('#btn-file-menu').click();
    const gdriveSubmenu = page.locator('#menu-gdrive-diagrams-wrap');
    await expect(gdriveSubmenu).toBeVisible();

    // Verify warning banner and console link are visible inside submenu
    await expect(page.locator('#menu-gdrive-list')).toContainText('Drive API Not Enabled');
    await expect(page.locator('#menu-gdrive-list')).toContainText('1049811661590');
    await expect(page.locator('#menu-gdrive-list a')).toHaveAttribute('href', /project=1049811661590/);
  });

  test('should load privacy policy page at /privacy.html with full terms and disclosures', async ({ page }) => {
    await page.goto('/privacy.html');

    // Check heading and content
    await expect(page.locator('h1')).toContainText('Privacy Policy');
    await expect(page.locator('body')).toContainText('Google Drive');
    await expect(page.locator('body')).toContainText('ThinkGraph');
  });
});
